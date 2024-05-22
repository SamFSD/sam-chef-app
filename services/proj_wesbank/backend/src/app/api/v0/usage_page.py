from fastapi import APIRouter, HTTPException, Depends
import numpy as np
from .db_config import exc_qrs_get_dfs_raw
from psycopg2 import sql
from loguru import logger
import traceback
from .helpers import fin_year_start
from datetime import datetime
from .form_class import FormValues
from .auth import validate_token

usage_page_router = APIRouter()

@usage_page_router.get(
    "/get_pav_usage_summary",
    description="Gets usage summary for a single vehicle",
 
)
def get_pav_usage_summary(vehiclereg: str, period: str, user: dict = Depends(validate_token)):
    try:

        today = datetime.now()

        if period == "Current Month":
            date = today.strftime("%Y-%m-1")
            query = sql.SQL(
                """COPY(
                            WITH total_usages AS (
                    SELECT
                    t.vehiclereg,
                    SUM(t.distance) AS asset_usage,
                    t.branch
                FROM
                    fleet.trip_data_daily t
                WHERE
                    t.date >= {date}
                    AND t.veh_model_map = (SELECT veh_model_map FROM fleet.trip_data_daily WHERE vehiclereg = 'ND844227' LIMIT 1)
                GROUP BY
                    t.vehiclereg, t.branch)

                SELECT
                ROUND(total_asset.asset_usage, 2) AS asset_usage,
                ROUND(AVG(total_branch.asset_usage), 2) AS branch_avg,
                ROUND(AVG(total_fleet.asset_usage), 2) AS fleet_avg
                
                FROM
                (SELECT asset_usage FROM total_usages WHERE vehiclereg = {vehiclereg}) AS total_asset,
                (SELECT asset_usage FROM total_usages WHERE vehiclereg != {vehiclereg}) AS total_fleet,
                (SELECT asset_usage FROM total_usages WHERE vehiclereg != {vehiclereg} AND branch = (SELECT branch FROM fleet.trip_data_daily WHERE vehiclereg = 'ND844227' LIMIT 1)) AS total_branch
                GROUP BY total_asset.asset_usage
            )TO STDOUT WITH CSV HEADER"""
            ).format(vehiclereg=sql.Literal(vehiclereg), date=sql.Literal(date))
        elif period == "Financial Year to Date":
            date = fin_year_start(today)
            query = sql.SQL(
                """COPY(
                            WITH total_usages AS (
                    SELECT
                    t.vehiclereg,
                    SUM(t.distance) AS asset_usage,
                    t.branch
                FROM
                    fleet.trip_data_daily t
                WHERE
                    t.date >= {date}
                    AND t.veh_model_map = (SELECT veh_model_map FROM fleet.trip_data_daily WHERE vehiclereg = 'ND844227' LIMIT 1)
                GROUP BY
                    t.vehiclereg, t.branch)

                SELECT
                ROUND(total_asset.asset_usage, 2) AS asset_usage,
                ROUND(AVG(total_branch.asset_usage), 2) AS branch_avg,
                ROUND(AVG(total_fleet.asset_usage), 2) AS fleet_avg
                
                FROM
                (SELECT asset_usage FROM total_usages WHERE vehiclereg = {vehiclereg}) AS total_asset,
                (SELECT asset_usage FROM total_usages WHERE vehiclereg != {vehiclereg}) AS total_fleet,
                (SELECT asset_usage FROM total_usages WHERE vehiclereg != {vehiclereg} AND branch = (SELECT branch FROM fleet.trip_data_daily WHERE vehiclereg = 'ND844227' LIMIT 1)) AS total_branch
                GROUP BY total_asset.asset_usage
            )TO STDOUT WITH CSV HEADER"""
            ).format(vehiclereg=sql.Literal(vehiclereg), date=sql.Literal(date))
        elif period == "All Time":
            query = sql.SQL(
                """COPY(
                            WITH total_usages AS (
                    SELECT
                    t.vehiclereg,
                    SUM(t.distance) AS asset_usage,
                    t.branch
                FROM
                    fleet.trip_data_daily t
                WHERE
                    t.veh_model_map = (SELECT veh_model_map FROM fleet.trip_data_daily WHERE vehiclereg = 'ND844227' LIMIT 1)
                GROUP BY
                    t.vehiclereg, t.branch)

                SELECT
                ROUND(total_asset.asset_usage, 2) AS asset_usage,
                ROUND(AVG(total_branch.asset_usage), 2) AS branch_avg,
                ROUND(AVG(total_fleet.asset_usage), 2) AS fleet_avg
                
                FROM
                (SELECT asset_usage FROM total_usages WHERE vehiclereg = {vehiclereg}) AS total_asset,
                (SELECT asset_usage FROM total_usages WHERE vehiclereg != {vehiclereg}) AS total_fleet,
                (SELECT asset_usage FROM total_usages WHERE vehiclereg != {vehiclereg} AND branch = (SELECT branch FROM fleet.trip_data_daily WHERE vehiclereg = 'ND844227' LIMIT 1)) AS total_branch
                GROUP BY total_asset.asset_usage
            )TO STDOUT WITH CSV HEADER"""
            ).format(vehiclereg=sql.Literal(vehiclereg))

        resp = exc_qrs_get_dfs_raw([query])
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")

    return resp[0].to_dict("records")



@usage_page_router.post(
    "/sho002_get_one_month_cpk_usage_graph",
    description="Get distance, costs and cpk for a given month for the usage graph",
)
def sho002_get_one_month_cpk_usage_graph(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form_values = FormValues(formValues)

        type_query = sql.SQL(
            """COPY(
            WITH txns AS (
        SELECT
            transdate,
            SUM(amount) AS costs
        FROM
            fleet.maintenance
        WHERE
            vehiclereg = ANY({reg})
            AND julian_month BETWEEN {julian_from} AND {julian_to}
        GROUP BY
            transdate
    ),
    dist AS (
        SELECT
            date,
            SUM(distance) AS distance
        FROM
            fleet.trip_data_daily
        WHERE
            vehiclereg = ANY({reg})
            AND julian_month BETWEEN {julian_from} AND {julian_to}
        GROUP BY
            date
    )

    SELECT
        COALESCE(txns.transdate, dist.date) AS date,
        COALESCE(costs, 0) AS costs,
        COALESCE(distance, 0) AS distance
    FROM
        txns
    LEFT JOIN
        dist
    ON
        txns.transdate = dist.date
    ORDER BY
        date
                        
        )TO STDOUT WITH CSV HEADER """
        ).format(
      julian_from=form_values.julStartMonth,
            julian_to=form_values.julEndMonth,
            reg=form_values.registrations,
        )
        veh_count_query = sql.SQL(
            """COPY(
            select count(vehiclereg) as count from fleet.fleetlist
            where vehiclereg = ANY({reg})
            )TO STDOUT WITH CSV HEADER """
        ).format(
            reg=form_values.registrations,
        )

        response = exc_qrs_get_dfs_raw([type_query, veh_count_query])
        graph_data = response[0].fillna(0).replace("", 0)
        veh_count = response[1].fillna(0).replace("", 0)["count"].sum()
        graph_data["cpk"] = round(
            graph_data.costs.astype(float) / graph_data.distance, 2
        ).replace([np.inf, -np.inf], 0)
        total_costs = graph_data.costs.astype(float).sum()
        avg_costs = round(total_costs / veh_count, 2)
        total_distance = graph_data.distance.sum()
        avg_distance = round(total_distance / veh_count, 2)
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )
    return {
        "chart_data": graph_data.replace([np.inf, -np.inf, np.nan], None).to_dict("records"),
        "total_cost": float(total_costs),
        "avg_cost": float(avg_costs),
        "total_distance": float(total_distance),
        "avg_distance": float(avg_distance),
        "asset_count": int(veh_count),
    }


@usage_page_router.post(
    "/sho002_get_all_time_cpk_usage_graph",
    description="Get distance, costs and cpk for all time per month for the usage graph",
)
def sho002_get_all_time_cpk_usage_graph(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form_values = FormValues(formValues)
        type_query = sql.SQL(
            """COPY(
                select date_trunc('month', date), sum(distance) as distance, b.costs from fleet.trip_data_daily a

                full outer join (select date_trunc('month',transdate) as transdate, sum(amount) as costs from fleet.maintenance
                        where transdate >= date_trunc('month', current_date - interval '12 months')
                        AND vehiclereg = ANY({reg})
                    group by date_trunc('month',transdate)) b on date_trunc('month', date) = b.transdate

                where date >= date_trunc('month', current_date - interval '12 months')
                and vehiclereg = ANY({reg})

                group by date_trunc('month', date), b.costs

                order by date_trunc('month', date) asc
                        
        )TO STDOUT WITH CSV HEADER """
        ).format(
            reg=form_values.registrations,
        )

        response = exc_qrs_get_dfs_raw([type_query])
        graph_data = response[0].fillna(0).replace("", 0)
        graph_data["cpk"] = round(
            graph_data.costs.astype(float) / graph_data.distance, 2
        )
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )

    return {"chart_data": graph_data.to_dict("records")}


@usage_page_router.post(
    "/sho002_get_veh_type_usage_table",
    description="Get distance, costs and cpk for a given month for the vehicle-type usage table",
)
def sho002_get_veh_type_usage_table(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form_values = FormValues(formValues)
        type_query = sql.SQL(
            """COPY(
            select a.veh_type_map, sum(distance) as distance, b.costs from fleet.trip_data_daily a
            left join (select veh_type_map, sum(amount) as costs from fleet.maintenance
                where julian_month BETWEEN {julian_from} AND {julian_to}
                    AND vehiclereg = ANY({reg})
                group by veh_type_map) b on a.veh_type_map = b.veh_type_map
            where julian_month BETWEEN {julian_from} AND {julian_to}
                AND vehiclereg = ANY({reg})
                --remove vehicles that are not in fleetlist
                and a.vehiclereg in (select vehiclereg from fleet.fleetlist)
            group by a.veh_type_map, b.costs

            order by distance desc
                        
        )TO STDOUT WITH CSV HEADER """
        ).format(
            julian_from=form_values.julStartMonth,
            julian_to=form_values.julEndMonth,
            reg=form_values.registrations,
        )

        response = exc_qrs_get_dfs_raw([type_query])[0].fillna(0).replace("", 0)
        response["cpk"] = round(response.costs.astype(float) / response.distance, 2)
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )
    return response.replace([np.inf, -np.inf, np.nan], None).to_dict("records")


@usage_page_router.post(
    "/sho002_get_veh_usage_table",
    description="Get distance, costs and cpk for a given month for the vehicle specific usage table",
)
def sho002_get_veh_usage_table(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form_values = FormValues(formValues)
        # this was used to determine costs and cpks too, but needs performance improvement
        # now just getting the distances
        type_query = sql.SQL(
            """COPY(
            select a.vehiclereg, a.veh_model_map, a.veh_make_map, sum(distance) as distance, a.division, a.branch
           
            from fleet.trip_data_daily a
            
            where julian_month BETWEEN {julian_from} AND {julian_to}
                and a.vehiclereg = ANY({reg})
            group by a.vehiclereg, a.veh_model_map, a.veh_make_map, a.division, a.branch
          

            order by distance desc
                        
        )TO STDOUT WITH CSV HEADER """
        ).format(
            julian_from=form_values.julStartMonth,
            julian_to=form_values.julEndMonth,
            reg=form_values.registrations,
        )
        response = exc_qrs_get_dfs_raw([type_query])[0].fillna(0).replace("", 0)
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )

    return response.to_dict("records")
