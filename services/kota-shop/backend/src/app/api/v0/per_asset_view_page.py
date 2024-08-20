import traceback
from .db_config import exc_qrs_get_dfs_raw,  return_connection
from .helpers import fin_year_start
import pandas as pd
from psycopg2 import sql
import json
from .helpers import (
    component_filter_check,
    date_filter,
)
from .form_class import FormValues
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from .auth import validate_token

assets_view_router = APIRouter()

@assets_view_router.post(
    "/get_pav_suppliers",
    description="Gets expentidure for one asset, broken down by supplier over a time period",

)
def get_pav_supplier(formValues: dict, user: dict = Depends(validate_token)):
    
    form = FormValues(formValues)

    query = sql.SQL(
        """COPY(
                    SELECT serviceprovider, SUM(amount) AS amount
    FROM fleet.maintenance
    WHERE vehiclereg = {vehiclereg}
    AND julian_month BETWEEN {julian_from} AND {julian_to}
    AND mapping = ANY({components})
    AND serviceprovider = ANY({suppliers})
    GROUP BY serviceprovider
    )TO STDOUT WITH CSV HEADER"""
    ).format(
        vehiclereg=form.singleReg,
        julian_from=form.julStartMonth,
        julian_to=form.julEndMonth,
        components=form.components,
        suppliers=form.suppliers,
    )

    resp = exc_qrs_get_dfs_raw([query])
    return resp[0].to_dict("records")


@assets_view_router.post(
    "/get_pav_invoice_status",
    description="Gets invoice statuses for a single vehicle",

)
def get_pav_invoice_status(formValues: dict, user: dict = Depends(validate_token)):

    form = FormValues(formValues)
    
    query = sql.SQL(
        """COPY(
    SELECT 
        SUM(CASE WHEN invoice_status = 'completed' THEN amount ELSE 0 END) AS completed_invoice,
        SUM(CASE WHEN invoice_status = 'invoice_exception' THEN amount ELSE 0 END) AS invoice_exception,
        SUM(CASE WHEN invoice_status = 'accrual' THEN amount ELSE 0 END) AS accruals,     
        (SELECT 
            SUM(CASE WHEN order_status = 'order_exception' THEN amount ELSE 0 END)	 
        FROM fleet.orders
        where julian_month BETWEEN {julian_from} AND {julian_to} AND vehiclereg = {vehiclereg}
        ) AS orders_exception
FROM
	fleet.maintenance
WHERE 
	julian_month BETWEEN {julian_from} AND {julian_to} 
	AND vehiclereg = {vehiclereg}
    )TO STDOUT WITH CSV HEADER"""
    ).format(
        vehiclereg=form.singleReg,
        julian_from=form.julStartMonth,
        julian_to=form.julEndMonth,
    )

    resp = exc_qrs_get_dfs_raw([query])
    return resp[0].to_dict("records")


@assets_view_router.post(
    "/get_pav_usage_summary",
    description="Gets usage summary for a single vehicle",
  
)
def get_pav_usage_summary(formValues: dict, user: dict = Depends(validate_token)):

    form = FormValues(formValues)

    query = sql.SQL(
        """COPY(
        WITH total_usages AS (
            SELECT
                t.vehiclereg,
                t.branch,
                t.julian_month,
                SUM(t.distance) AS asset_usage
            FROM
                fleet.trip_data_daily t
            WHERE
                t.julian_month BETWEEN {julian_from} AND {julian_to}
                AND t.veh_model_map = (
                    SELECT veh_model_map
                    FROM fleet.trip_data_daily
                    WHERE vehiclereg = {vehiclereg}
                    LIMIT 1
                )
            GROUP BY
                t.vehiclereg, t.branch, t.julian_month
        )

        SELECT
            TO_CHAR(total_asset.julian_month, 'Mon YYYY') AS month,
            ROUND(total_asset.asset_usage, 2) AS asset_usage,
            ROUND(AVG(total_branch.asset_usage), 2) AS branch_avg,
            ROUND(AVG(total_fleet.asset_usage), 2) AS fleet_avg
        FROM
            (SELECT julian_month, asset_usage FROM total_usages WHERE vehiclereg = {vehiclereg}) AS total_asset
        JOIN
            (SELECT julian_month, asset_usage FROM total_usages WHERE vehiclereg != {vehiclereg}) AS total_fleet
            ON total_asset.julian_month = total_fleet.julian_month
        JOIN
            (SELECT julian_month, asset_usage FROM total_usages WHERE vehiclereg != {vehiclereg} AND branch = (SELECT branch FROM fleet.trip_data_daily WHERE vehiclereg = {vehiclereg} LIMIT 1)) AS total_branch
            ON total_asset.julian_month = total_branch.julian_month
        GROUP BY total_asset.julian_month, total_asset.asset_usage
        ORDER BY total_asset.julian_month ASC

    )TO STDOUT WITH CSV HEADER"""
    ).format(
        vehiclereg=form.singleReg,
        julian_from=form.julStartMonth,
        julian_to=form.julEndMonth,
    )
    resp = exc_qrs_get_dfs_raw([query])
    return resp[0].to_dict("records")


@assets_view_router.post(
    "/get_pav_components",
    description="Gets expentidure for one asset, broken down by component over a time period",

)
def get_pav_components(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form = FormValues(formValues)

        query = sql.SQL(
            """COPY(
                        WITH comp_total AS (
            SELECT
                t.vehiclereg,
                t.amount AS asset_amount,
                t.branch,
                t.mapping
            FROM
                fleet.maintenance t
            WHERE
                t.julian_month BETWEEN {julian_from} AND {julian_to}
                AND t.mapping = ANY({components})
                AND t.serviceprovider = ANY({suppliers})
                AND t.veh_model_map = (SELECT veh_model_map FROM fleet.fleetlist WHERE vehiclereg = {vehiclereg} LIMIT 1)
            )
            SELECT *
            FROM (
            SELECT
                mapping,
                ROUND(SUM(CASE WHEN vehiclereg = {vehiclereg} THEN asset_amount ELSE 0 END), 2) AS asset_comp,
                ROUND(AVG(CASE WHEN vehiclereg != {vehiclereg} THEN asset_amount END), 2) AS fleet_avg,
                ROUND(AVG(CASE WHEN vehiclereg != {vehiclereg} AND branch = (SELECT branch FROM fleet.fleetlist WHERE vehiclereg = {vehiclereg} LIMIT 1) THEN asset_amount END), 2) AS branch_avg
            FROM
                comp_total
            GROUP BY
                mapping
            ) AS derived_table
            WHERE
            asset_comp IS NOT NULL AND asset_comp <> 0
        )TO STDOUT WITH CSV HEADER"""
        ).format(
            vehiclereg=form.singleReg,
            julian_from=form.julStartMonth,
            julian_to=form.julEndMonth,
            components=form.components,
            suppliers=form.suppliers
        )
        resp = exc_qrs_get_dfs_raw([query])
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    
    return resp[0].to_dict("records")


@assets_view_router.post(
    "/get_pav_vehicle_stats",
    description="Gets details from fleetlist for per asset view vehicle stats card",
)
def get_pav_vehicle_stats(formValues: dict, user: dict = Depends(validate_token)):

    form = FormValues(formValues)

    query = sql.SQL(
        """COPY(
    SELECT
    vehiclereg, fleet_no, make, "map" AS model, description AS "type", branch, TO_CHAR(contract_start, 'YYYY-MM-DD') || ' - ' || TO_CHAR(contract_end, 'YYYY-MM-DD') AS contract_duration, veh_lic_exp AS license_expiration
    FROM fleet.fleetlist WHERE vehiclereg = {vehiclereg}
    )TO STDOUT WITH CSV HEADER"""
    ).format(vehiclereg=form.singleReg)
    resp = exc_qrs_get_dfs_raw([query])
    return resp[0].to_dict("records")[0]


@assets_view_router.get(
    "/get_specific_vehicle_by_fleet_no",
    description="Get spefici vehicle info from fleetlist",
)
def get_specific_vehicle_by_fleet_no(fleetno: str, user: dict = Depends(validate_token)):
    try:
        vehicle_query = sql.SQL(
            """COPY(
                        select veh_type_map, veh_model_map, contract_type, vehiclereg, fleet_no FROM fleet.fleetlist
                        where fleet_no = {fleetno}
                                
        ) TO STDOUT WITH CSV HEADER """
        ).format(fleetno=sql.Literal(fleetno))

        response = exc_qrs_get_dfs_raw([vehicle_query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response

# get user permissions

@assets_view_router.get(
    "/perassetdetails",
    description="Get fleetlist info of specific asset",
)
def get_per_asset_fleetlist_details(asset_id: str, user: dict = Depends(validate_token)):
    try:
        """Get count of commercial, heavy commercial, trailers etc"""

        select_statement = sql.SQL(
            """COPY (select * from fleet.fleetlist
                where vehiclereg = {asset_id}
                
        ) TO STDOUT WITH CSV HEADER"""
        ).format(asset_id=sql.Literal(asset_id))

        query_list = [select_statement]


        response_list = exc_qrs_get_dfs_raw(query_list)
        asset_id = response_list[0]
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")

    return asset_id.to_dict("records")


@assets_view_router.get(
    "/get_specific_vehicle_by_reg",
    description="Get spefici vehicle info from fleetlist",

)
def get_specific_vehicle_by_reg(vehiclereg: str, branch: str, user: dict = Depends(validate_token)):
    try:
        vehicle_query = sql.SQL(
            """COPY(
                        select veh_type_map, veh_model_map, contract_type, fleet_no FROM fleet.fleetlist
                        where lower(vehiclereg) = {vehiclereg} and lower(branch) = {branch}
                                
        ) TO STDOUT WITH CSV HEADER """
        ).format(vehiclereg=sql.Literal(vehiclereg.lower()), branch=sql.Literal(branch))

        response = exc_qrs_get_dfs_raw([vehicle_query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response


@assets_view_router.get("/get_asset_spend_over_odo")
def get_asset_cost_over_time(asset_id: str, user: dict = Depends(validate_token)):
    try:
        query_list = []
        # get usage of same asset models in branch and full fleet for the period.

        usage_query = sql.SQL(
            """COPY (
            SELECT  mapping, amount, work_order_distance
            FROM fleet.maintenance
            where lower(vehiclereg) = lower({asset_id})
            ) TO STDOUT WITH CSV HEADER"""
        ).format(
            asset_id=sql.Literal(asset_id.lower()),
        )
        # get expected maint plan usage per day for asset

        query_list.append(usage_query)
        # try:
        response_list = exc_qrs_get_dfs_raw(query_list)

        # get df of all same models daily usage in the whole fleet
        # all_models_df = response_list[0].fillna(0)
        all_models_df = response_list[0]
        # df_processed =     all_models_df.groupby(['work_order_distance', 'mapping'])['amount'].sum().groupby(level=0).cumsum().reset_index()

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")

    return all_models_df.to_dict("records")


@assets_view_router.get(
    "/get_asset_count_per_division",
    description="Get asset count by model and by type for a division",
  
)
def get_asset_count_per_division(division: str, user: dict = Depends(validate_token)):
    try:
        query_list = []

        type_count_query = sql.SQL(
            """COPY (
                select veh_type_map, count(veh_type_map) from fleet.fleetlist
                where branch = any(array(select branches from fleet.divisions where lower(division) = {division}))
                group by veh_type_map
            ) TO STDOUT WITH CSV HEADER"""
        ).format(division=sql.Literal(division.lower()))

        query_list.append(type_count_query)
        model_count = sql.SQL(
            """COPY (
                select veh_model_map, count(veh_model_map) from fleet.fleetlist
                where branch = any(array(select branches from fleet.divisions where lower(division) = {division}))
                group by veh_model_map
            ) TO STDOUT WITH CSV HEADER"""
        ).format(division=sql.Literal(division.lower()))

        query_list.append(model_count)
        # try:
        response_list = exc_qrs_get_dfs_raw(query_list)
        type_count_df = response_list[0]
        model_count_df = response_list[1]
        total_count = int(type_count_df["count"].sum())

        # except Exception as error:
        #     logger.info(error)
        #     return error
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")

    return {
        "total_count": total_count,
        "type_count": type_count_df.to_dict("records"),
        "model_count": model_count_df.to_dict("records"),
    }


@assets_view_router.get(
    "/get_total_stats_per_division",
    description="Get total distances, costs and cpk (including percentage of total fleet cost) for all vehicles in each division",

)
def get_total_stats_per_division(user: dict = Depends(validate_token)):
    try:

        query_list = []

        dist_query = sql.SQL(
            """COPY (
            SELECT
            x.division,
            SUM(distance) AS distance,
            coalesce(c.costs, 0) as costs
            FROM
            fleet.x_dist_per_day_asset x
            left join (   SELECT
            division,
            SUM(cost) AS costs
            FROM
            fleet.x_component_cost_per_day_asset 
            GROUP BY
            division) c on c.division = x.division
            GROUP BY
            x.division, c.costs
            ) TO STDOUT WITH CSV HEADER"""
        ).format()

        query_list.append(dist_query)
        # query_list.append(costs_query)

        # try:
        response_list = exc_qrs_get_dfs_raw(query_list)
        df = response_list[0].replace("", "Unknown")
        df["cpk"] = round(df.costs / df.distance, 2)
        # costs_df = response_list[1]
        df["percentage_of_fleet_dist"] = round(df.distance / df.distance.sum() * 100)

        # except Exception as error:
        #     logger.info(error)
        #     return error
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")

    return {"data": df.to_dict("records")}


@assets_view_router.get(
    "/get_total_stats_per_branch_in_division",
    description="Get total distances, costs and cpk (including percentage of total division cost) for all vehicles in each branch of a division",
 
)
def get_total_stats_per_branch_in_division(division: str, user: dict = Depends(validate_token)):
    try:
        query_list = []

        dist_query = sql.SQL(
            """COPY (
            SELECT
            x.branch,
            SUM(distance) AS distance,
            coalesce(c.costs, 0) as costs
            FROM
            fleet.x_dist_per_day_asset x 
            left join (   SELECT
            branch,
            SUM(cost) AS costs
            FROM
            fleet.x_component_cost_per_day_asset where lower(division) = {division}
            GROUP BY
            branch) c on c.branch = x.branch
            where lower(division) = {division}
            GROUP BY
            x.branch, c.costs
            ) TO STDOUT WITH CSV HEADER"""
        ).format(division=sql.Literal(division.lower()))

        query_list.append(dist_query)
        # query_list.append(costs_query)

        # try:
        response_list = exc_qrs_get_dfs_raw(query_list)
        df = response_list[0].replace("", "Unknown")
        df["cpk"] = round(df.costs / df.distance, 2)
        # costs_df = response_list[1]
        df["percentage_of_division_dist"] = round(df.distance / df.distance.sum() * 100)

        # except Exception as error:
        #     logger.info(error)
        #     return error
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")

    return {"data": df.to_dict("records")}


@assets_view_router.get("/get_asset_usage")
def get_asset_usage(
    asset_id: str, asset_model: str, branch: str, start_date: str, end_date: str, user: dict = Depends(validate_token)
):
    try:
        query_list = []
        # get usage of same asset models in branch and full fleet for the period.

        usage_query = sql.SQL(
            """COPY (
                SELECT 
                day_of,
                ROUND(AVG(distance), 0) AS avg_fleet_dist,
                ROUND(AVG(CASE WHEN lower(branch) = lower({branch}) THEN distance ELSE NULL END), 0) AS avg_branch_dist,
                ROUND(MAX(CASE WHEN lower(vehiclereg) = lower({asset_id}) THEN distance ELSE NULL END), 0) AS asset_dist
                FROM
                    fleet.x_dist_per_day_asset
                WHERE
                    lower(veh_model_map) = lower({asset_model}) 
                    AND (day_of BETWEEN {start_date} AND {end_date})
                GROUP BY
                    day_of
                ORDER BY day_of ASC
            ) TO STDOUT WITH CSV HEADER"""
        ).format(
            asset_model=sql.Literal(asset_model.lower()),
            branch=sql.Literal(branch.lower()),
            asset_id=sql.Literal(asset_id.lower()),
            start_date=sql.Literal(start_date),
            end_date=sql.Literal(end_date),
        )
        # get expected maint plan usage per day for asset

        query_list.append(usage_query)
        # try:
        response_list = exc_qrs_get_dfs_raw(query_list)

        # get df of all same models daily usage in the whole fleet
        # all_models_df = response_list[0].fillna(0)
        all_models_df = response_list[0]

        # except Exception as error:
        #     logger.info(error)
        #     return error

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return all_models_df.to_dict("records")


@assets_view_router.post(
    "/get_pav_invoice_accrual",
    description="get tables invoice status accrual invoices",

)
def get_pav_invoice_accrual(formValues: dict, user: dict = Depends(validate_token)):
    try:

        form = FormValues(formValues)
        invoices_table_query = sql.SQL(
            """COPY(
                SELECT 
                    m.transdate, m.order_no, m.amount, s.invoice_diff AS order_difference,
                    m.vehiclereg, m.serviceprovider, m.savings, m.mapping, m.maintdescription,
                    m.work_order_distance, m.invoice_no, m.fleet_no, m.invoice_status
                FROM 
                    fleet.maintenance m
                INNER JOIN 
                    fleet.orders s ON m.order_no = s.order_no
                WHERE 
                    m.invoice_status = 'accrual' 
                    AND m.julian_month BETWEEN {julian_from} AND {julian_to}
                    and m.vehiclereg = {vehiclereg} 
                        ) TO STDOUT WITH CSV HEADER"""
        ).format(
            julian_from=form.julStartMonth,
            julian_to=form.julEndMonth,
            vehiclereg=form.singleReg,
        )

        response = exc_qrs_get_dfs_raw([invoices_table_query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response


@assets_view_router.post(
    "/get_pav_invoices_completed",
    description="get tables invoice status completed invoices",

)
def get_pav_invoices_completed(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form = FormValues(formValues)

        invoices_table_query = sql.SQL(
            """COPY(
            SELECT 
                m.transdate, m.fleet_no, m.order_no, m.amount,s.invoice_diff as order_difference, m.mapping, m.maintdescription,
                m.vehiclereg, m.serviceprovider, m.savings, m.work_order_distance, m.invoice_no
            FROM 
                fleet.maintenance m
            INNER JOIN 
                fleet.orders s ON m.order_no = s.order_no
            WHERE 
                invoice_status = 'completed'  
                and m.julian_month BETWEEN {julian_from} AND {julian_to} 
                and m.vehiclereg = {vehiclereg}  
                                    ) TO STDOUT WITH CSV HEADER"""
        ).format(
            julian_from=form.julStartMonth,
            julian_to=form.julEndMonth,
            vehiclereg=form.singleReg,
        )
        response = exc_qrs_get_dfs_raw([invoices_table_query])[0]
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response.to_dict("records")


@assets_view_router.post(
    "/get_pav_invoice_exception",
    description="get tables invoice status invoice excep",

)
def get_pav_invoice_exception(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form = FormValues(formValues)

        invoices_table_query = sql.SQL(
            """COPY(
            SELECT 
                m.transdate, m.fleet_no, m.order_no, m.amount, m.mapping, m.maintdescription,
                m.vehiclereg, m.serviceprovider, m.savings, m.work_order_distance, m.invoice_no
            FROM 
                fleet.maintenance m
            WHERE 
                invoice_status = 'invoice_exception'  
                and m.julian_month BETWEEN {julian_from} AND {julian_to} and
                m.vehiclereg = {vehiclereg} 
                                    ) TO STDOUT WITH CSV HEADER"""
        ).format(
            julian_from=form.julStartMonth,
            julian_to=form.julEndMonth,
            vehiclereg=form.singleReg,
        )
        response = exc_qrs_get_dfs_raw([invoices_table_query])[0]
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response.to_dict("records")


@assets_view_router.post(
    "/get_pav_order_exception",
    description="get tables invoice status orders excep",

)
def get_pav_order_exception(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form = FormValues(formValues)

        invoices_table_query = sql.SQL(
            """COPY(
                        select   
                    date,fleet_no, order_no, invoice_amount as savings, amount,invoice_diff as invoice_difference, vehiclereg, service_provider, odo, mapping, description,order_status
            from fleet.orders
                    where order_status = 'order_exception' 
                    and julian_month BETWEEN {julian_from} AND {julian_to}
                    and vehiclereg = {vehiclereg}  
                    --order exceptions                                   
                            ) TO STDOUT WITH CSV HEADER"""
        ).format(
            julian_from=form.julStartMonth,
            julian_to=form.julEndMonth,
            vehiclereg=form.singleReg,
        )

        response = exc_qrs_get_dfs_raw([invoices_table_query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response


@assets_view_router.post(
    "/get_pav_drivers_events_table",
    description="Get Drivers Events Table",
)
def get_pav_drivers_events_table(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form = FormValues(formValues)
        monthlyCost_query = sql.SQL(
            """COPY(
                select division, vehiclereg,
                REPLACE(event_description,'* ','') AS event_description,             
                event_start_date || ' ' || event_start_time as event_date,
                f_start_street || ' ' || f_start_suburb || ' ' || f_start_region as event_region,
                    fleet_no,veh_type_map,
                veh_model_map, Julian_month, asset_name,
                start_lat, start_lon,
                event_key,
                road_speed_limit,
                CONCAT(event_value,' ', measurement_unitS) as event_values                from fleet.driving_events
            where vehiclereg = {registrations} and   (julian_month BETWEEN {julian_from} AND {julian_to} )
                         
                     
            )TO STDOUT WITH CSV HEADER"""
        ).format(
            julian_from=form.julStartMonth,
            julian_to=form.julEndMonth,
            registrations=form.singleReg,
            
        )
        response = exc_qrs_get_dfs_raw([monthlyCost_query])[0].to_dict("records")

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response


@assets_view_router.post("/get_bi_scores_pav", description="Get BI Scores Pav Page")
def get_bi_scores_pav(formValues: dict, user: dict = Depends(validate_token)):
    # get bi scores per vehicle per month
    # try:
    form = FormValues(formValues)
    bi_scores_query = sql.SQL(
        """COPY(
        SELECT 
            vehiclereg,
            julian_month,
            bi_scores,
            fleet_no,
            veh_type_map,
            veh_model_map
        FROM fleet.driving_score
            where
                (julian_month BETWEEN {julian_from} AND {julian_to})
            and
                vehiclereg = {registrations}
        )TO STDOUT WITH CSV HEADER"""
    ).format(
            julian_from=form.julStartMonth,
            julian_to=form.julEndMonth,
            registrations=form.singleReg,
    )
    response = exc_qrs_get_dfs_raw([bi_scores_query])[0]

    ##get avg scores for each event across all returned records
    def parse_all_bi_scores(
        row,
    ):  # take each bi_scores json object from the df and add it to dictionary
        bi_scores = json.loads(row["bi_scores"])
        parsed_data = {}

        for key, value in bi_scores.items():
            if isinstance(value, dict):
                parsed_data[f"{key.lower().replace(' ', '_')}_count"] = value.get(
                    "count", 0
                )
                parsed_data[f"{key.lower().replace(' ', '_')}_score"] = value.get(
                    "score", 0
                )

        return parsed_data

    # Apply the function to each row and create a new DataFrame
    try:  # this will fail if there are no records returned
        all_bi_scores_parsed = response.apply(parse_all_bi_scores, axis=1)
        print("c")
        print(all_bi_scores_parsed)
        # create df tof all scores per vehiclereg to pull mean scores and totals counts from (drop the vehiclereg column)
        all_bi_scores_df = pd.DataFrame(all_bi_scores_parsed.tolist())

        print(all_bi_scores_df)
        # pull mean and sum only on numeric columns
        # get the mean across all _score columns
        numeric_df = all_bi_scores_df.select_dtypes(include=["number"])

        avg_all_scores = numeric_df.mean()
        total_all_counts = numeric_df.sum()
        # Calculate the average score and total count for each event type
        # avg_all_scores = all_bi_scores_df.mean()
        print(avg_all_scores)
        # total_all_counts = all_bi_scores_df.sum()
        print(total_all_counts)
        # per_veh_df = (
        #     all_bi_scores_df.groupby("vehiclereg")
        #     .mean()
        #     .reset_index()
        #     .to_dict("records")
        # )
    except Exception as e:
        print(f"An error occurred: {e}")
        avg_all_scores = {
            "total_score": 100,
            "acceleration_score": 100,
            "braking_score": 100,
            "cornering_score": 100,
            "speeding_score": 100,
            "idling_score": 100,  # added idling score
            "severe_impact_score": 100,
            "moderate_impact_score": 100,
            "impact_score": 100,
        }
        total_all_counts = {
            "total_count": 0,
            "acceleration_count": 0,
            "braking_count": 0,
            "cornering_count": 0,
            "speeding_count": 0,
            "idling_count": 0,  # added idling count
            "severe_impact_count": 0,
            "moderate_impact_count": 0,
            "impact_count": 0,
        }
        per_veh_df = []

    # df = all_bi_scores_df.to_dict("records")
    # except Exception as e:
    #     print(f"An error occurred: {e}")
    #     raise HTTPException(
    #         status_code=500, detail=f"Error Details: {traceback.format_exc()}"
    #     )
    return {
        "gauge_scores": [
            {
                "title": "Total",
                "value": avg_all_scores["total_score"],
                "count": total_all_counts["total_count"],
            },
            {
                "title": "Acceleration",
                "icon": "fa-tachometer-alt-fast",
                "value": avg_all_scores["acceleration_score"],
                "count": total_all_counts["acceleration_count"],
            },
            {
                "title": "Braking",
                "value": avg_all_scores["braking_score"],
                "count": total_all_counts["braking_count"],
            },
            {
                "title": "Cornering",
                "value": avg_all_scores["cornering_score"],
                "count": total_all_counts["cornering_count"],
            },
            {
                "title": "Speeding",
                "value": avg_all_scores["speeding_score"],
                "count": total_all_counts["speeding_count"],
            },
            {
                "title": "Idling",
                "value": avg_all_scores["idling_score"],
                "count": total_all_counts["idling_count"],
            },
            # {
            #     "title": "Impact - Severe",
            #     "value": avg_all_scores["severe_impact_score"],
            #     "count": total_all_counts["severe_impact_count"],
            # },
            # {
            #     "title": "Impact - Moderate",
            #     "value": avg_all_scores["moderate_impact_score"],
            #     "count": total_all_counts["moderate_impact_count"],
            # },
            {
                "title": "Impact",
                "value": round(
                    (
                        avg_all_scores["impact_score"]
                        + avg_all_scores["severe_impact_score"]
                        + avg_all_scores["moderate_impact_score"]
                    )
                    / 3,
                    2,
                ),
                "count": total_all_counts["impact_count"]
                + total_all_counts["severe_impact_count"]
                + total_all_counts["moderate_impact_count"],
            },
        ],
        # "scores_per_vehicles": per_veh_df,
    }
