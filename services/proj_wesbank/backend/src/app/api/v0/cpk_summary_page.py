import traceback
from fastapi import APIRouter,HTTPException, Depends
from psycopg2 import sql
from .db_config import exc_qrs_get_dfs_raw
import numpy as np
from loguru import logger
from fastapi.responses import StreamingResponse
from .helpers import div_branch_type_filter_check 
from .form_class import FormValues 
from .auth import validate_token

fnb_colours = [
    "#7c878e",
    "#3c474e",
    "#f2bc47",
    "#f39200",
    "#cf3f27",
    "#69d2dc",
    "#15a3b2",
    "#007582",
]
cpks_charts_graphs_router = APIRouter()


@cpks_charts_graphs_router.post(
    "/get_distances_ranked",
    description="Get distances, ranked, per veh_model_map compared to its own branch and to the whole fleet",
)
def get_ranked_distances(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form_values = FormValues(formValues)
        query_list = []
        invoice_query = sql.SQL(
            """COPY(SELECT
    d.vehiclereg,
    d.branch,
    d.veh_model_map,
    d.asset_total,
    d.asset_daily_avg,
    b.branch_total,
    b.avg_daily_all_vehicles,
    b.total_all_vehicles,
    b.num_vehicles_per_branch
        FROM (

    SELECT
        vehiclereg,
        SUM(distance) AS asset_total,
        AVG(distance) AS asset_daily_avg,
        branch,
        LOWER(veh_model_map) AS veh_model_map
    FROM
        fleet.x_dist_per_day_asset
    WHERE
        veh_model_map = {veh_model_map}
    GROUP BY
        vehiclereg, branch, veh_model_map
        ) d

        JOIN (
    SELECT
        branch,
        AVG(distance) AS branch_total_avg,
        SUM(distance) AS branch_total,
        (SELECT AVG(distance) FROM fleet.x_dist_per_day_asset WHERE
        veh_model_map = {veh_model_map}) AS avg_daily_all_vehicles,
        (SELECT SUM(distance) FROM fleet.x_dist_per_day_asset WHERE
        veh_model_map = {veh_model_map}) AS total_all_vehicles,
        COUNT(DISTINCT vehiclereg) AS num_vehicles_per_branch
    FROM
        fleet.x_dist_per_day_asset
    WHERE
        veh_model_map = {veh_model_map}
    GROUP BY
        branch
        ) b ON d.branch = b.branch

    ORDER BY asset_total ASC


    )  TO STDOUT WITH CSV HEADER"""
        ).format(
            veh_model_map=form_values.models,
        )
        query_list.append(invoice_query)
        # try:
        response_list = exc_qrs_get_dfs_raw(query_list)

        df = response_list[0]
        df["avg_total_dist_branch"] = round(df.branch_total / df.num_vehicles_per_branch)
        df["avg_total_distance"] = round(df.total_all_vehicles / len(df))
        # logger.info(df.groupby('branch').mean('asset_daily_avg'))
        df["avg_daily_distance_branch"] = df.groupby("branch")["asset_daily_avg"].transform(
            "mean"
        )
        df["avg_daily_distance_fleet"] = df.groupby("vehiclereg")[
            "asset_daily_avg"
        ].transform("mean")
        df["percentage_of_branch_avg_total"] = round(
            df.asset_total / df.avg_total_dist_branch * 100
        )
        df["percentage_of_fleet_avg_total"] = round(
            df.asset_total / df.avg_total_distance * 100
        )
        df["percentage_of_branch_avg_daily"] = round(
            df.asset_daily_avg / df.avg_daily_distance_branch * 100
        )
        df["percentage_of_fleet_avg_daily"] = round(
            df.asset_daily_avg / df.avg_daily_distance_fleet * 100
        )
        df["daily_avg_ranking_fleet"] = df["percentage_of_fleet_avg_daily"].rank(
            ascending=True
        )
        df["daily_avg_ranking_branch"] = df.groupby("branch")[
            "percentage_of_branch_avg_daily"
        ].rank(ascending=True)
        df["total_avg_ranking_fleet"] = df["percentage_of_fleet_avg_total"].rank(
            ascending=True
        )
        df["total_avg_ranking_branch"] = df.groupby(["veh_model_map", "branch"])[
            "percentage_of_branch_avg_total"
        ].rank(ascending=True)
        df["max_fleet_dist_ranking"] = len(df)
        df["max_branch_dist_ranking"] = df.groupby(["veh_model_map", "branch"])[
            "percentage_of_branch_avg_total"
        ].transform("max")
        # logger.info(df['max_branch_dist_ranking'])
        vehicle_df = df[df.vehiclereg == form_values.registrations]
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return vehicle_df.to_dict("records")

@cpks_charts_graphs_router.get(
    "/sho002_get_variable_cost_details",
    description="variable cost details table",
   
)
def sho002_get_variable_cost_details(
    month: str, division: str, branch: str, veh_type: str, user: dict = Depends(validate_token)
):
    try:
    # print(month, "gfgfgf")
        division_filter, branches_filter, type_filter = div_branch_type_filter_check(
            division, branch, veh_type
        )
        query = sql.SQL(
                """ COPY(
                        select f.vehiclereg, f.division, f.branch, f.fleet_no, f.veh_type_map, f.contract_type,m.orders_exceptions,  m.total_cost, m.total_savings, m.completed_invoices, m.accruals, s.shoprite_amount from fleet.fleetlist f
                        -- get total amount + total savings amount ffrom maintenance table join from fleetlist by vehicle registration
                        left join ( 
                        select vehiclereg, sum(amount) as total_cost, sum(savings) as total_savings,
                            count(
                            (case when invoice_status = 'completed' then amount else 0 end) ) as completed_invoices,
                            count(
                            (case when invoice_status = 'accruals' then amount else 0 end) ) as accruals,
                                    count(
                            (case when invoice_status = 'orders_exception' then amount else 0 end) ) as orders_exceptions	
                            from fleet.maintenance 
                            where julian_month = {month} and lower(division) = {division_filter} and lower(branch) = {branches_filter} and lower(veh_type_map) = {type_filter}
                            group by
                                vehiclereg
                        ) m on m.vehiclereg = f.vehiclereg
                        left join (
                        select vehiclereg, sum(amount) as shoprite_amount from fleet.orders group by vehiclereg ) s on m.vehiclereg = s.vehiclereg
            )TO STDOUT WITH CSV HEADER """
            ).format(
                month=sql.Literal(month),
                division_filter=division_filter,
                branches_filter=branches_filter,
                type_filter=type_filter,
            )
        response = exc_qrs_get_dfs_raw([query])
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response[0].to_dict("records")

@cpks_charts_graphs_router.get(
    "/sho002_get_asset_details",
    description="assets details table",
   
)
def sho002_get_asset_details(month: str, division: str, branch: str, veh_type: str, user: dict = Depends(validate_token)):
    try:
    # print(month, "gfgfgf")
        division_filter, branches_filter, type_filter = div_branch_type_filter_check(
            division, branch, veh_type
        )
        query = sql.SQL(
            """ COPY(
                    select f.vehiclereg, f.division, f.branch, f.fleet_no, f.veh_type_map, f.contract_type, f.contract_start, f.contract_end, m.total_distance from fleet.fleetlist f
                    left join( select vehiclereg, sum(work_order_distance::numeric)as total_distance from fleet.maintenance
                            where julian_month = {month} and lower(division) = {division_filter} and lower(branch) = {branches_filter} and lower(veh_type_map) = {type_filter}
                            group by vehiclereg, work_order_distance) m on f.vehiclereg = m.vehiclereg
                    left join (
                                    select vehiclereg, sum(amount) as shoprite_amount from fleet.orders group by vehiclereg ) s on m.vehiclereg = s.vehiclereg
        )TO STDOUT WITH CSV HEADER """
        ).format(
            month=sql.Literal(month),
            division_filter=division_filter,
            branches_filter=branches_filter,
            type_filter=type_filter,
        )
        response = exc_qrs_get_dfs_raw([query])
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response[0].to_dict("records")

@cpks_charts_graphs_router.get(
    "/get_cpk/costs_per_component_map_per_model_type",
    description="Get a list of summed costs and cpks for a specific map per vehicle_model_map",

)
def get_costs_list_per_maint_map(veh_model_map: str, component_map: str, user: dict = Depends(validate_token)):
    try:
        query_list = []
        # get usage of same asset models in branch and full fleet for the period.

        costs_query = sql.SQL(
            """COPY (
                select fleetlist.vehiclereg, fleetlist.branch, last_known_odo, joins.vehiclereg, joins.component_map, joins.costs, dist.distance, 
                coalesce(joins.costs/dist.distance, 0) as cpk from fleet.fleetlist 
                left join(
                select x_component_cost_per_day_asset.vehiclereg, branch, component_map, sum(cost) as costs 
                from fleet.x_component_cost_per_day_asset 
                where
                LOWER(veh_model_map) = LOWER({veh_model_map})
                and lower(component_map) = LOWER({component_map})
                group by x_component_cost_per_day_asset.vehiclereg, branch, component_map
                order by component_map, costs asc
                ) as joins on joins.vehiclereg = fleetlist.vehiclereg
                left join(select vehiclereg, sum(distance) as distance from fleet.x_dist_per_day_asset
                        where
                LOWER(veh_model_map) = LOWER({veh_model_map})
                        group by vehiclereg) dist on dist.vehiclereg = fleetlist.vehiclereg
                WHERE
                LOWER(veh_model_map) = LOWER({veh_model_map})
                order by cpk asc
            ) TO STDOUT WITH CSV HEADER"""
        ).format(
            veh_model_map=sql.Literal(veh_model_map.lower()),
            component_map=sql.Literal(component_map.lower()),
        )
        # get expected maint plan usage per day for asset

        query_list.append(costs_query)
        # try:
        response_list = exc_qrs_get_dfs_raw(query_list)

        # get df of all same models daily usage in the whole fleet
        # all_models_df = response_list[0].fillna(0)
        maint_maps_df = response_list[0]
        # df_processed =     all_models_df.groupby(['work_order_distance', 'mapping'])['amount'].sum().groupby(level=0).cumsum().reset_index()

        # Rename the columns for consistency with the radar chart data format
        # df_processed.columns = ['work_order_distance', 'mapping', 'cost']
        # except Exception as error:
        #     logger.info(error)
        #     return error
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")

    return maint_maps_df.to_dict("records")


@cpks_charts_graphs_router.get(
    "/get-maint-maps-of-model",
    description="Get all logged txn maint maps for a specific model acroos all the fleet",

)
def get_maint_maps_of_model(formValues: dict, user: dict = Depends(validate_token)):
    
    try:
        registrations = list(
            map(lambda x: x["vehiclereg"], formValues["registrations"])
        )

        query_list = []
        # get usage of same asset models in branch and full fleet for the period.

        map_query = sql.SQL(
            """COPY (
            SELECT  DISTINCT component_map FROM fleet.x_component_cost_per_day_asset
            WHERE veh_model_map = any({registration})
            ) TO STDOUT WITH CSV HEADER"""
        ).format(
            registrations=sql.Literal(registrations),
        )
        # get expected maint plan usage per day for asset

        query_list.append(map_query)
        # try:
        response_list = exc_qrs_get_dfs_raw(query_list)

        # get df of all same models daily usage in the whole fleet
        # all_models_df = response_list[0].fillna(0)
        maint_maps_df = response_list[0]
        # df_processed =     all_models_df.groupby(['work_order_distance', 'mapping'])['amount'].sum().groupby(level=0).cumsum().reset_index()

        # Rename the columns for consistency with the radar chart data format
        # df_processed.columns = ['work_order_distance', 'mapping', 'cost']
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")

    return maint_maps_df.to_dict("records")


@cpks_charts_graphs_router.get(
    "/get_cpk_totals_ranker",
    description="Get distances, ranked, per veh_model_map compared to its own branch and to the whole fleet",

)
def get_cpk_totals_ranker(division: str, positions: int | None = 9999, user: dict = Depends(validate_token)):
    try:
        query_list = []
        component_cost_query = sql.SQL(
            """COPY (
                    select x_component_cost_per_day_asset.vehiclereg, veh_type_map, veh_model_map, sum(cost) as total_cost, coalesce(dist.total_dist, 1) as distance,
                    fl.months_remaining, fl.veh_lic_expirey
                    from fleet.x_component_cost_per_day_asset
                    left join (select vehiclereg, sum(distance)as total_dist from fleet.x_dist_per_day_asset 
                    where branch = any(array(select branches from fleet.divisions where lower(division) = lower({division}))) and veh_type_map <> 'Trailer' group by vehiclereg
                    ) dist on dist.vehiclereg = x_component_cost_per_day_asset.vehiclereg
                    left join (select vehiclereg, months_remaining, 'Unknown' as veh_lic_expirey from fleet.fleetlist) fl on fl.vehiclereg = x_component_cost_per_day_asset.vehiclereg
                    where branch = any(array(select branches from fleet.divisions where lower(division) = lower({division})))  and veh_type_map <> 'Trailer'
                    group by x_component_cost_per_day_asset.vehiclereg, dist.total_dist, veh_type_map, veh_model_map, fl.months_remaining, fl.veh_lic_expirey
            ) TO STDOUT WITH CSV HEADER"""
        ).format(
            division=sql.Literal(division.lower()),
        )

        query_list.append(component_cost_query)

        # get division size from fleetlist
        fleetlist_query = sql.SQL(
            """COPY (
                select count(vehiclereg) from fleet.fleetlist where branch = any(array(select branches from fleet.divisions where lower(division) = {division}))
            ) TO STDOUT WITH CSV HEADER"""
        ).format(
            division=sql.Literal(division.lower()),
        )

        query_list.append(fleetlist_query)

        response_list = exc_qrs_get_dfs_raw(query_list)
        cpk_df = response_list[0]

        cpk_df["asset_cpk"] = round(cpk_df.total_cost / cpk_df.distance, 2)
        cpk_df = cpk_df.replace([np.inf, -np.inf, np.nan], None).sort_values("asset_cpk")
        # logger.info(cpk_df)
        top_cpk_df = cpk_df[:positions]
        bottom_cpk_df = cpk_df[-positions:]
        total_costs_df = cpk_df.sort_values("total_cost")
        total_dist_df = cpk_df.sort_values("distance", ascending=False)
        contract_expirey_df = total_dist_df.sort_values("months_remaining", ascending=False)
        veh_lic_expirey_df = total_dist_df.sort_values("veh_lic_expirey", ascending=False)
        # create df used for division totals and avgs
        fleetlist_df = response_list[1]
        fleetlist_df["total_distance_tvled"] = cpk_df.distance.astype(float).sum().round()
        fleetlist_df["total_costs"] = cpk_df.total_cost.astype(float).sum().round(2)
        fleetlist_df["avg_cpk"] = (
            cpk_df.asset_cpk.replace([np.inf, -np.inf, np.nan], 0)
            .astype(float)
            .replace([np.inf, -np.inf, np.nan], 0)
            .mean()
        )
        fleetlist_df = fleetlist_df.replace([np.inf, -np.inf, np.nan], 0)
        fleetlist_df.avg_cpk = fleetlist_df.avg_cpk.round(2)
        logger.info(fleetlist_df)
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return {
        "top_cpk": top_cpk_df.to_dict("records"),
        "bottom_cpk": bottom_cpk_df.to_dict("records"),
        "top_costs": total_costs_df[:positions].to_dict("records"),
        "bottom_costs": total_costs_df[-positions:].to_dict("records"),
        "top_distances": total_dist_df[:positions].to_dict("records"),
        "bottom_distances": total_dist_df[-positions:].to_dict("records"),
        "top_contract_exp": contract_expirey_df[:positions].to_dict("records"),
        "bot_contract_expirey": contract_expirey_df[-positions:].to_dict("records"),
        "top_lic_expirey": veh_lic_expirey_df[:positions].to_dict("records"),
        "bot_lic_expirey": veh_lic_expirey_df[-positions:].to_dict("records"),
        "division_totals": fleetlist_df.to_dict("records"),
    }

@cpks_charts_graphs_router.get(
    "/get_cpk_totals_ranker_branch",
    description="Get distances, ranked, per veh_model_map compared to its own branch and to the whole fleet",

)
def get_cpk_totals_ranker(branch: str, positions: int | None = 9999, user: dict = Depends(validate_token)):
    try:
        query_list = []
        component_cost_query = sql.SQL(
            """COPY (
                    select x_component_cost_per_day_asset.vehiclereg, veh_type_map, veh_model_map, sum(cost) as total_cost, coalesce(dist.total_dist, 1) as distance,
                    fl.months_remaining, fl.veh_lic_expirey
                    from fleet.x_component_cost_per_day_asset
                    left join (select vehiclereg, sum(distance)as total_dist from fleet.x_dist_per_day_asset 
                    where lower(branch) = {branch} and veh_type_map <> 'Trailer' group by vehiclereg
                    ) dist on dist.vehiclereg = x_component_cost_per_day_asset.vehiclereg
                    left join (select vehiclereg, months_remaining, 'Unknown' as veh_lic_expirey from fleet.fleetlist) fl on fl.vehiclereg = x_component_cost_per_day_asset.vehiclereg
                    where lower(branch) = {branch}  and veh_type_map <> 'Trailer'
                    group by x_component_cost_per_day_asset.vehiclereg, dist.total_dist, veh_type_map, veh_model_map, fl.months_remaining, fl.veh_lic_expirey
            ) TO STDOUT WITH CSV HEADER"""
        ).format(
            branch=sql.Literal(branch.lower()),
        )

        query_list.append(component_cost_query)

        # get division size from fleetlist
        fleetlist_query = sql.SQL(
            """COPY (
                select count(vehiclereg) from fleet.fleetlist where lower(branch) = {branch}
            ) TO STDOUT WITH CSV HEADER"""
        ).format(
            branch=sql.Literal(branch.lower()),
        )

        query_list.append(fleetlist_query)

        response_list = exc_qrs_get_dfs_raw(query_list)
        cpk_df = response_list[0]

        cpk_df["asset_cpk"] = round(cpk_df.total_cost / cpk_df.distance, 2)
        cpk_df = cpk_df.replace([np.inf, -np.inf, np.nan], None).sort_values("asset_cpk")
        # logger.info(cpk_df)

        top_cpk_df = cpk_df[:positions]
        bottom_cpk_df = cpk_df[-positions:]
        total_costs_df = cpk_df.sort_values("total_cost")
        total_dist_df = cpk_df.sort_values("distance", ascending=False)
        contract_expirey_df = total_dist_df.sort_values("months_remaining", ascending=False)
        veh_lic_expirey_df = total_dist_df.sort_values("veh_lic_expirey", ascending=False)
        # create df used for division totals and avgs
        fleetlist_df = response_list[1]
        fleetlist_df["total_distance_tvled"] = cpk_df.distance.astype(float).sum().round()
        fleetlist_df["total_costs"] = cpk_df.total_cost.astype(float).sum().round(2)
        fleetlist_df["avg_cpk"] = (
            cpk_df.asset_cpk.replace([np.inf, -np.inf, np.nan], 0)
            .astype(float)
            .replace([np.inf, -np.inf, np.nan], 0)
            .mean()
        )
        fleetlist_df = fleetlist_df.replace([np.inf, -np.inf, np.nan], 0)
        fleetlist_df.avg_cpk = fleetlist_df.avg_cpk.round(2)
        # logger.info(fleetlist_df)
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return {
        "top_cpk": top_cpk_df.to_dict("records"),
        "top_costs": total_costs_df[:positions].to_dict("records"),
        "top_distances": total_dist_df[:positions].to_dict("records"),
        "top_contract_exp": contract_expirey_df[:positions].to_dict("records"),
        "top_lic_expirey": veh_lic_expirey_df[:positions].to_dict("records"),
        "division_totals": fleetlist_df.to_dict("records"),
    }

@cpks_charts_graphs_router.get(
    "/get_cpk_per_model",
    description="Get distances, ranked, per veh_model_map compared to its own branch and to the whole fleet",

)
def get_cpks_per_model_ranker(division: str, positions: int | None = 9999, user: dict = Depends(validate_token)):
    try:

        query_list = []
        component_cost_query = sql.SQL(
            """COPY (
                    select x_component_cost_per_day_asset.veh_model_map, veh_type_map, sum(cost) as total_cost
                    , coalesce(dist.total_dist, 1) as distance, fl.asset_count
                    from fleet.x_component_cost_per_day_asset
                    left join (select veh_model_map, sum(distance)as total_dist from fleet.x_dist_per_day_asset 
                    where branch = any(array(select branches from fleet.divisions where lower(division) = lower('transrite'))) and veh_type_map <> 'Trailer' group by veh_model_map
                    ) dist on dist.veh_model_map = x_component_cost_per_day_asset.veh_model_map
                    left join (select veh_model_map, count(veh_model_map)as asset_count from fleet.fleetlist where branch = any(array(select branches from fleet.divisions where lower(division) = lower('transrite'))) and veh_type_map <> 'Trailer'
                            group by veh_model_map) fl on fl.veh_model_map = x_component_cost_per_day_asset.veh_model_map

                    where branch = any(array(select branches from fleet.divisions where lower(division) = lower('transrite')))  and veh_type_map <> 'Trailer'
                    group by x_component_cost_per_day_asset.veh_model_map
                    , dist.total_dist, veh_type_map, fl.asset_count
            ) TO STDOUT WITH CSV HEADER"""
        ).format(
            division=sql.Literal(division.lower()),
        )

        query_list.append(component_cost_query)
        response_list = exc_qrs_get_dfs_raw(query_list)
        models_cpk_df = response_list[0]

        models_cpk_df["model_cpk"] = round(
            models_cpk_df.total_cost / models_cpk_df.distance, 2
        )
        models_cpk_df = models_cpk_df.replace([np.inf, -np.inf, np.nan], None).sort_values(
            "model_cpk"
        )

        top_cpk_df = models_cpk_df[:positions]
        bottom_cpk_df = models_cpk_df[-positions:]
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return {
        "top_cpk": top_cpk_df.to_dict("records"),
        "bottom_cpk": bottom_cpk_df.to_dict("records"),
    }

@cpks_charts_graphs_router.get(
    "/get_cpk_per_model_branch",
    description="Get distances, ranked, per veh_model_map compared to its own branch and to the whole fleet",

)
def get_cpks_per_model_branch_ranker(branch: str, positions: int | None = 9999, user: dict = Depends(validate_token)):
    try:
            
        query_list = []
        component_cost_query = sql.SQL(
            """COPY (
                select x_component_cost_per_day_asset.veh_model_map, veh_type_map, sum(cost) as total_cost
    , coalesce(dist.total_dist, 1) as distance
    from fleet.x_component_cost_per_day_asset
    left join (select veh_model_map, sum(distance)as total_dist from fleet.x_dist_per_day_asset 
    where lower(branch) = {branch} and veh_type_map <> 'Trailer' group by veh_model_map
    ) dist on dist.veh_model_map = x_component_cost_per_day_asset.veh_model_map
    where lower(branch) = {branch}  and veh_type_map <> 'Trailer'
    group by x_component_cost_per_day_asset.veh_model_map
    , dist.total_dist, veh_type_map
            ) TO STDOUT WITH CSV HEADER"""
        ).format(
            branch=sql.Literal(branch.lower()),
        )

        query_list.append(component_cost_query)
        response_list = exc_qrs_get_dfs_raw(query_list)
        models_cpk_df = response_list[0]

        models_cpk_df["model_cpk"] = round(
            models_cpk_df.total_cost / models_cpk_df.distance, 2
        )
        models_cpk_df = models_cpk_df.replace([np.inf, -np.inf, np.nan], None).sort_values(
            "model_cpk"
        )

        top_cpk_df = models_cpk_df[:positions]
        bottom_cpk_df = models_cpk_df[-positions:]
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return {
        "top_cpk": top_cpk_df.to_dict("records"),
        "bottom_cpk": bottom_cpk_df.to_dict("records"),
    }
@cpks_charts_graphs_router.get(
    "/sho002_get_assets_cpk_summary",
    description="get assets cpk summary",
  
)
def sho002_get_assets_cpk_summary(from_date: str, to_date: str, download: bool = False, user: dict = Depends(validate_token)):
    try:

        assets_query = sql.SQL(
            """COPY(
                            SELECT DISTINCT fleetlist_cent.model, c.make, a.cost, c.distance, 
                    ROUND(a.cost / c.distance * 100, 2) AS cpk_per_month
                    FROM fleet.fleetlist_cent

                    LEFT JOIN (SELECT SUM(total_distance) AS distance, d.model, d.make FROM fleet.trip_data_cent
                    LEFT JOIN (SELECT vehicle_reg, model, make FROM fleet.fleetlist_cent) d ON d.vehicle_reg = trip_data_cent.vehicle_reg
                    WHERE date BETWEEN {from_date} AND {to_date}
                    GROUP BY d.model, d.make) c ON c.model = fleetlist_cent.model
                    LEFT JOIN (SELECT SUM(charge_on_amount) AS cost, b.model FROM fleet.maintenance_cent
                    LEFT JOIN (SELECT vehicle_reg, model FROM fleet.fleetlist_cent) b ON b.vehicle_reg = maintenance_cent.license_plate
                    WHERE date_created BETWEEN {from_date} AND {to_date}
                    GROUP BY b.model) a ON a.model = fleetlist_cent.model
                    GROUP BY fleetlist_cent.model, a.cost, c.distance, c.make 
                            )TO STDOUT WITH CSV HEADER """
        ).format(from_date=sql.Literal(from_date), to_date=sql.Literal(to_date))

        # Assuming exc_qrs_get_dfs_raw returns a list of DataFrames
        response_df_list = exc_qrs_get_dfs_raw([assets_query])
        response_df = response_df_list[0]

        if download:
            # Create a BytesIO object to hold the Excel file
            buffer = io.BytesIO()

            # Create a Pandas Excel writer using xlsxwriter as the engine
            with pd.ExcelWriter(buffer, engine="xlsxwriter") as writer:
                # Convert the DataFrame to an XlsxWriter Excel object
                response_df.to_excel(writer, sheet_name="Sheet1", index=False)

            return StreamingResponse(
                BytesIO(buffer.getvalue()),
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={
                    "Content-Disposition": 'attachment; filename="assets_cpk_summary.xlsx"'
                },
            )
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response_df.to_dict("records")
@cpks_charts_graphs_router.get(
    "/sho002_get_variable_cost",
    description="Get variable cost table",

)
def sho002_get_variable_cost(month: str, user: dict = Depends(validate_token)):
    try:
        query = sql.SQL(
            """COPY(
                select m.serviceprovider as customer, m.branch as unit_account, m.vehiclereg, m.contract_type, m.fleet_no, f.contract_start, f.contract_end 
                from fleet.maintenance as m
                inner join fleet.fleetlist as f on   m.vehiclereg = f.vehiclereg
                where m.julian_month = {month}
        )TO STDOUT WITH CSV HEADER """
        ).format(
            month=sql.Literal(month),
        )

        response = exc_qrs_get_dfs_raw([query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response

@cpks_charts_graphs_router.get(
    "/get_overview_sunburst",
    description="Get data for fleet-overview sunburst chart",

)
def get_overview_sunburst(user: dict = Depends(validate_token)):
    try:
        query_list = []
        sunburst_query = sql.SQL(
            """COPY(select div.division, vehiclereg, veh_type_map, veh_model_map, branch from fleet.fleetlist
    left join (select division, branches from fleet.divisions where division <> 'full_fleet') div on branch = any(div.branches) limit 500
    )  TO STDOUT WITH CSV HEADER"""
        )
        query_list.append(sunburst_query)
        # try:
        response_list = exc_qrs_get_dfs_raw(query_list)

        df = (
            response_list[0]
            .replace([np.inf, -np.inf, np.nan], None)
            .fillna(0)
            .replace("", "Unknown")
        )
        grouped = (
            df.groupby(["division", "branch", "veh_type_map", "veh_model_map"])
            .size()
            .reset_index(name="count")
        )

        # Create the final output structure
        sunburst_format = []

        # get sunburst format
        sunburst_format = []
        color_index = 0
        # get sunburst format
        for division, division_group in grouped.groupby("division"):
            division_data = {
                "name": division,
                "value": int(division_group["count"].sum()),
                "itemStyle": {"color": fnb_colours[color_index]},
                "children": [],
            }
            color_index = (color_index + 1) % len(fnb_colours)
            for branch, branch_group in division_group.groupby("branch"):
                branch_data = {
                    "name": branch,
                    "value": int(branch_group["count"].sum()),
                    "itemStyle": {"color": fnb_colours[color_index]},
                    "children": [],
                }
                color_index = (color_index + 1) % len(fnb_colours)

                for veh_type, veh_type_group in branch_group.groupby("veh_type_map"):
                    veh_type_data = {
                        "name": veh_type,
                        "value": int(veh_type_group["count"].sum()),
                        "itemStyle": {"color": fnb_colours[color_index]},
                        "children": [],
                    }
                    color_index = (color_index + 1) % len(fnb_colours)
                    for veh_model, veh_model_group in veh_type_group.groupby(
                        "veh_model_map"
                    ):
                        veh_model_data = {
                            "name": veh_model,
                            "value": int(veh_model_group["count"].sum()),
                            "itemStyle": {"color": fnb_colours[color_index]},
                        }
                        color_index = (color_index + 1) % len(fnb_colours)

                        veh_type_data["children"].append(veh_model_data)

                    branch_data["children"].append(veh_type_data)

                division_data["children"].append(branch_data)

            sunburst_format.append(division_data)
        # get sankey format

        # SANKEY FLEET OVERVIEW
        unique_divisions = df["division"].dropna().unique().tolist()
        unique_branches = df["branch"].dropna().unique().tolist()
        unique_veh_type_map = df["veh_type_map"].dropna().unique().tolist()
        unique_veh_model_map = df["veh_model_map"].dropna().unique().tolist()

        # Create the desired format
        formatted_data = (
            [
                {"name": "Full Fleet"},
            ]
            + [{"name": unique_division} for unique_division in unique_divisions]
            + [{"name": unique_branch} for unique_branch in unique_branches]
            + [{"name": unique_veh_type_map} for unique_veh_type_map in unique_veh_type_map]
            + [
                {"name": unique_veh_model_map}
                for unique_veh_model_map in unique_veh_model_map
            ]
        )
        # remove duplicates (Únknown')
        # formatted_data = [*set(formatted_data)]
        unique_list = list(set(tuple(item.items()) for item in formatted_data))

        # Convert the list back to the original format
        formatted_data = [{key: value for key, value in item} for item in unique_list]

        # Calculate the counts for each combination of division, branch, and veh_type_map
        links = []

        # Calculate the counts for each unique division
        division_counts = df["division"].value_counts()
        division_names = division_counts.index.tolist()
        division_values = division_counts.values.tolist()

        # Full Fleet to unique division
        full_fleet_count = df.shape[0]
        for name, value in zip(division_names, division_values):
            links.append({"source": "Full Fleet", "target": name, "value": value})

        # Unique division to unique branch
        branch_counts = df.groupby(["division", "branch"]).size().reset_index(name="count")
        for row in branch_counts.itertuples(index=False):
            division, branch, count = row
            links.append({"source": division, "target": branch, "value": count})
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return {
        "sunburst": sunburst_format,
        "sankey": {"links": links, "data": formatted_data},
    }

@cpks_charts_graphs_router.post(
    "/get_supplier_sankey",
    description="Get data for sankey that shows the flow to each supplier and component map for a division, branch and veh type",
 
)
def get_supplier_sankey(formValues: dict, user: dict = Depends(validate_token)):
    try:
        query_list = []
        registrations = list(map(lambda x: x["vehiclereg"], formValues["registrations"]))
        components = formValues["components"]
        jul_month = formValues["julMonth"]

        sankey_query = sql.SQL(
            """COPY(
            select maintenance.serviceprovider, 
            mapping, 
            count(amount) as txn_count, 
            sum(amount) as costs, 
            sum(savings::numeric) as savings from fleet.maintenance
            where vehiclereg = any({registrations})  
            and mapping =  any({components})
            and julian_month = {jul_month}  
            group by maintenance.serviceprovider, mapping
            order by maintenance.serviceprovider, mapping
            )  TO STDOUT WITH CSV HEADER"""
        ).format(
            components=sql.Literal(components),
            jul_month=sql.Literal(jul_month),
            registrations=sql.Literal(registrations),
        )

        query_list.append(sankey_query)
        # try:
        response_list = exc_qrs_get_dfs_raw(query_list)

        df = (
            response_list[0]
            .replace([np.inf, -np.inf, np.nan], None)
            .fillna(0)
            .replace("", "Unknown")
        )
        # If we need todraw the graph with the transaction costs:
        if count_or_cost == "costs":
            # Calculate total costs for each service provider
            df_serviceprovider = df.groupby("serviceprovider")["costs"].sum().reset_index()
            df_serviceprovider["source"] = "All Suppliers"
            df_serviceprovider.rename(
                columns={"serviceprovider": "target", "costs": "value"}, inplace=True
            )

            # Format data for each mapping within a service provider
            df_mapping = df[["serviceprovider", "mapping", "costs"]].copy()
            df_mapping.rename(
                columns={
                    "serviceprovider": "source",
                    "mapping": "target",
                    "costs": "value",
                },
                inplace=True,
            )

            # Create a list of dictionaries
            links = df_serviceprovider.to_dict(orient="records") + df_mapping.to_dict(
                orient="records"
            )
            unique_mappings = df["mapping"].unique().tolist()
            unique_serviceproviders = df["serviceprovider"].unique().tolist()

            # Create a list of objects for unique mappings
            mapping_objects = [{"name": mapping} for mapping in unique_mappings]

            # Create a list of objects for unique service providers
            serviceprovider_objects = [
                {"name": serviceprovider} for serviceprovider in unique_serviceproviders
            ]

            # Combine the two lists
            data = [{"name": "All Suppliers"}] + mapping_objects + serviceprovider_objects

            return {"sankey": {"links": links, "data": data}}

        # if we need to draw the chart based on repair count and not cost
        if count_or_cost == "count":
            df_mapping = df[["serviceprovider", "mapping", "txn_count"]].copy()
            df_mapping.rename(
                columns={
                    "serviceprovider": "source",
                    "mapping": "target",
                    "txn_count": "value",
                },
                inplace=True,
            )

            # Create a list of dictionaries
            links = df_mapping.to_dict(orient="records")
            unique_mappings = df["mapping"].unique().tolist()
            unique_serviceproviders = df["serviceprovider"].unique().tolist()

            # Create a list of objects for unique mappings
            mapping_objects = [{"name": mapping} for mapping in unique_mappings]

            # Create a list of objects for unique service providers
            serviceprovider_objects = [
                {"name": serviceprovider} for serviceprovider in unique_serviceproviders
            ]

            # Combine the two lists
            data = mapping_objects + serviceprovider_objects
    except Exception as e:
            print(f"An error occurred: {e}")
            raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return {"sankey": {"links": links, "data": data}}

@cpks_charts_graphs_router.get(
    "/get_per_division_sunburst",
    description="Get data for division overview sunburst chart. Branches > Veh Types > Veh Models",
  
)
def get_division_sunburst(division: str, user: dict = Depends(validate_token)):
    try:
        query_list = []
        sunburst_query = sql.SQL(
            """COPY(select div.division, vehiclereg, veh_type_map, veh_model_map, branch from fleet.fleetlist
    left join (select division, branches from fleet.divisions where lower(division) = lower({division}) and division <> 'full_fleet') div on branch = any(div.branches) 
    where branch = any(array(select branches from fleet.divisions where lower(division) = {division}))
    )  TO STDOUT WITH CSV HEADER"""
        ).format(division=sql.Literal(division.lower()))
        query_list.append(sunburst_query)
        # try:
        response_list = exc_qrs_get_dfs_raw(query_list)

        df = (
            response_list[0]
            .replace([np.inf, -np.inf, np.nan], None)
            .fillna(0)
            .replace("", "Unknown")
        )
        # logger.info(df)
        grouped = (
            df.groupby(["division", "branch", "veh_type_map", "veh_model_map"])
            .size()
            .reset_index(name="count")
        )

        # Create the final output structure
        sunburst_format = []
        # logger.info(grouped)
        # get sunburst format
        color_index = 0
        for division, division_group in grouped.groupby("division"):
            division_data = {
                "name": division,
                "value": int(division_group["count"].sum()),
                "itemStyle": {"color": fnb_colours[color_index]},
                "children": [],
            }
            color_index = (color_index + 1) % len(fnb_colours)
            # logger.info(division_data)
            for branch, branch_group in division_group.groupby("branch"):
                # color_index = 0
                branch_data = {
                    "name": branch,
                    "value": int(branch_group["count"].sum()),
                    "itemStyle": {"color": fnb_colours[color_index]},
                    "children": [],
                }
                color_index = (color_index + 1) % len(fnb_colours)
                for veh_type, veh_type_group in branch_group.groupby("veh_type_map"):
                    # color_index = 0
                    veh_type_data = {
                        "name": veh_type,
                        "value": int(veh_type_group["count"].sum()),
                        "itemStyle": {"color": fnb_colours[color_index]},
                        "children": [],
                    }
                    color_index = (color_index + 1) % len(fnb_colours)
                    for veh_model, veh_model_group in veh_type_group.groupby(
                        "veh_model_map"
                    ):
                        # color_index = 0
                        veh_model_data = {
                            "name": veh_model,
                            "value": int(veh_model_group["count"].sum()),
                            "itemStyle": {"color": fnb_colours[color_index]},
                        }

                        veh_type_data["children"].append(veh_model_data)
                        color_index = (color_index + 1) % len(fnb_colours)
                    branch_data["children"].append(veh_type_data)

                division_data["children"].append(branch_data)

            sunburst_format.append(division_data)
        # get sankey format

        # SANKEY FLEET OVERVIEW
        unique_divisions = df["division"].dropna().unique().tolist()
        unique_branches = df["branch"].dropna().unique().tolist()
        unique_veh_type_map = df["veh_type_map"].dropna().unique().tolist()
        unique_veh_model_map = df["veh_model_map"].dropna().unique().tolist()

        # Create the desired format
        formatted_data = (
            [
                {"name": "Full Fleet"},
            ]
            + [{"name": unique_division} for unique_division in unique_divisions]
            + [{"name": unique_branch} for unique_branch in unique_branches]
            + [{"name": unique_veh_type_map} for unique_veh_type_map in unique_veh_type_map]
            + [
                {"name": unique_veh_model_map}
                for unique_veh_model_map in unique_veh_model_map
            ]
        )
        # remove duplicates (Únknown')
        # formatted_data = [*set(formatted_data)]
        unique_list = list(set(tuple(item.items()) for item in formatted_data))

        # Convert the list back to the original format
        formatted_data = [{key: value for key, value in item} for item in unique_list]

        # Calculate the counts for each combination of division, branch, and veh_type_map
        links = []

        # Calculate the counts for each unique division
        division_counts = df["division"].value_counts()
        division_names = division_counts.index.tolist()
        division_values = division_counts.values.tolist()

        # Full Fleet to unique division
        full_fleet_count = df.shape[0]
        for name, value in zip(division_names, division_values):
            links.append({"source": "Full Fleet", "target": name, "value": value})

        # Unique division to unique branch
        branch_counts = df.groupby(["division", "branch"]).size().reset_index(name="count")
        for row in branch_counts.itertuples(index=False):
            division, branch, count = row
            links.append({"source": division, "target": branch, "value": count})
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return {
        "sunburst": sunburst_format,
        "sankey": {"links": links, "data": formatted_data},
    }

@cpks_charts_graphs_router.get(
    "/get_per_branch_sunburst",
    description="Get data for division overview sunburst chart. Branches > Veh Types > Veh Models",

)
def get_branch_sunburst(branch: str, user: dict = Depends(validate_token)):
    try:

        query_list = []
        sunburst_query = sql.SQL(
            """COPY(select vehiclereg, veh_type_map, veh_model_map, branch from fleet.fleetlist

            where lower(branch) = {branch}
    )  TO STDOUT WITH CSV HEADER"""
        ).format(branch=sql.Literal(branch.lower()))
        query_list.append(sunburst_query)
        # try:
        response_list = exc_qrs_get_dfs_raw(query_list)

        df = (
            response_list[0]
            .replace([np.inf, -np.inf, np.nan], None)
            .fillna(0)
            .replace("", "Unknown")
        )
        # logger.info(df)
        grouped = (
            df.groupby(["branch", "veh_type_map", "veh_model_map"])
            .size()
            .reset_index(name="count")
        )
        # logger.info(grouped)
        # Create the final output structure
        sunburst_format = []
        # logger.info(grouped)
        # get sunburst format
        color_index = 0

        for branch, branch_group in grouped.groupby("branch"):
            # color_index = 0
            branch_data = {
                "name": branch,
                "value": int(branch_group["count"].sum()),
                "itemStyle": {"color": fnb_colours[color_index]},
                "children": [],
            }
            # logger.info(branch, branch_group)
            color_index = (color_index + 1) % len(fnb_colours)
            for veh_type, veh_type_group in branch_group.groupby("veh_type_map"):
                # color_index = 0
                veh_type_data = {
                    "name": veh_type,
                    "value": int(veh_type_group["count"].sum()),
                    "itemStyle": {"color": fnb_colours[color_index]},
                    "children": [],
                }
                color_index = (color_index + 1) % len(fnb_colours)
                for veh_model, veh_model_group in veh_type_group.groupby("veh_model_map"):
                    # color_index = 0
                    veh_model_data = {
                        "name": veh_model,
                        "value": int(veh_model_group["count"].sum()),
                        "itemStyle": {"color": fnb_colours[color_index]},
                    }

                    veh_type_data["children"].append(veh_model_data)
                    color_index = (color_index + 1) % len(fnb_colours)
                branch_data["children"].append(veh_type_data)

            # branch_data['children'].append(branch_data)

            sunburst_format.append(branch_data)
        # get sankey format

        # SANKEY FLEET OVERVIEW

        #     unique_branches = df['branch'].dropna().unique().tolist()
        #     unique_veh_type_map = df['veh_type_map'].dropna().unique().tolist()
        #     unique_veh_model_map = df['veh_model_map'].dropna().unique().tolist()

        #     # Create the desired format
        #     formatted_data = [
        #         {'name': 'Full Fleet'},
        #     ] +  [ {'name': unique_branch} for unique_branch in unique_branches] + [ {'name': unique_veh_type_map} for  unique_veh_type_map in unique_veh_type_map] + [    {'name': unique_veh_model_map } for unique_veh_model_map  in unique_veh_model_map]
        #     #remove duplicates (Únknown')
        #     # formatted_data = [*set(formatted_data)]
        #     unique_list = list(set(tuple(item.items()) for item in formatted_data))

        #     # Convert the list back to the original format
        #     formatted_data = [{key: value for key, value in item} for item in unique_list]

        #     # Calculate the counts for each combination of division, branch, and veh_type_map
        #     links = []

        #     # Calculate the counts for each unique division
        #     branch_counts = df['branch'].value_counts()
        #     branch_names = branch_counts.index.tolist()
        #     branch_values = branch_counts.values.tolist()

        #     # Full Fleet to unique division
        #     full_fleet_count = df.shape[0]
        #     for name, value in zip(branch_names, branch_values):
        #         links.append({'source': 'Full Fleet', 'target': name, 'value': value})

        # # Unique division to unique branch
        # branch_counts = df.groupby(['branch']).size().reset_index(name='count')
        # for row in branch_counts.itertuples(index=False):
        #     branch, count = row
        #     links.append({'source': branch, 'target': branch, 'value': count})

        # logger.info(sunburst_format)
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return {
        "sunburst": sunburst_format,
        # 'sankey': {'links': links, 'data': formatted_data}
    }

@cpks_charts_graphs_router.get(
    "/get_cost_oper_component_in_division_pi",
    description="Get data for cost per component in division pi chart.",
  
)
def get_cost_per_component_in_division_pi(division: str, user: dict = Depends(validate_token)):
    try:
        query_list = []
        sunburst_query = sql.SQL(
            """COPY(SELECT
    component_map,
    branch,
    SUM(cost) AS costs
    FROM
    fleet.x_component_cost_per_day_asset where lower(division) = {division}
    GROUP BY
    component_map, branch
    )  TO STDOUT WITH CSV HEADER"""
        ).format(division=sql.Literal(division.lower()))
        query_list.append(sunburst_query)

        response_list = exc_qrs_get_dfs_raw(query_list)

        df = (
            response_list[0]
            .replace([np.inf, -np.inf, np.nan], None)
            .fillna(0)
            .replace("", "Unknown")
        )
        grouped_df = df.groupby("component_map").agg({"costs": "sum"})
        logger.info(grouped_df)
        result = []
        for component_map, sum_of_costs in grouped_df.iterrows():
            logger.info(component_map, sum_of_costs["costs"])
            component_map_dict = {
                "name": component_map,
                "value": sum_of_costs["costs"],
                "children": [],
            }
            component_rows = df[df["component_map"] == component_map]
            for _, row in component_rows.iterrows():
                branch_dict = {"name": row["branch"], "value": row["costs"]}
                component_map_dict["children"].append(branch_dict)
            result.append(component_map_dict)
        logger.info(component_map_dict)
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return {"sunburst": result}

@cpks_charts_graphs_router.get(
    "/get_cpk_and_costs_ranked_per_component_for_a_model",
    description="Get ranked cpks and total costs per component map (including total costs), for all vehciles of a certain model.",

)
def get_ranked_component_cpks_per_model(veh_model_map: str, vehicle_reg: str, user: dict = Depends(validate_token)):
    try:

        query_list = []
        cost_query = sql.SQL(
            """COPY(WITH component_costs AS (
    SELECT
        vehiclereg,
        branch,
        component_map,
        SUM(cost) AS costs
    FROM
        fleet.x_component_cost_per_day_asset
    WHERE
        LOWER(veh_model_map) = LOWER({veh_model_map})
    GROUP BY
        vehiclereg,
        branch,
        component_map
    ), distances AS (
    SELECT
        vehiclereg,
        SUM(distance) AS distance
    FROM
        fleet.x_dist_per_day_asset
    WHERE
        LOWER(veh_model_map) = LOWER({veh_model_map})
    GROUP BY
        vehiclereg
    ), total_component_costs AS (
    SELECT
        vehiclereg,
        SUM(costs) AS total_cost
    FROM
        component_costs
    GROUP BY
        vehiclereg
    )
    SELECT
    COALESCE(fl.vehiclereg, cc.vehiclereg) AS vehiclereg,
    fl.branch,
    cc.component_map,
    cc.costs,
    d.distance,
    COALESCE(cc.costs / d.distance, 0) AS cpk
    FROM
    distances d
    FULL OUTER JOIN fleet.fleetlist fl ON fl.vehiclereg = d.vehiclereg
    FULL OUTER JOIN component_costs cc ON cc.vehiclereg = fl.vehiclereg AND cc.branch = fl.branch
    WHERE
    LOWER(fl.veh_model_map) = LOWER({veh_model_map})
    UNION ALL
    SELECT
    fl.vehiclereg,
    fl.branch,
    'Total',
    tcc.total_cost,
    d.distance,
    COALESCE(tcc.total_cost / d.distance, 0) AS cpk
    FROM
    fleet.fleetlist fl
    JOIN total_component_costs tcc ON tcc.vehiclereg = fl.vehiclereg
    JOIN distances d ON d.vehiclereg = fl.vehiclereg
    WHERE
    LOWER(fl.veh_model_map) = LOWER({veh_model_map})
    ORDER BY
    cpk ASC
    )  TO STDOUT WITH CSV HEADER"""
        ).format(
            veh_model_map=sql.Literal(veh_model_map.lower()),
        )
        query_list.append(cost_query)
        # try:
        response_list = exc_qrs_get_dfs_raw(query_list)

        df = response_list[0]
        # df2 = response_list[1]
        # Calculate the average costs of all vehicles for each component_map
        df["avg_costs"] = round(df.groupby("component_map")["costs"].transform("mean"), 2)

        # Calculate the average costs of all vehicles for each component_map and branch
        df["avg_costs_branch"] = round(
            df.groupby(["component_map", "branch"])["costs"].transform("mean"), 2
        )

        # Calculate the average cpk per component of all vehicles for full fleet
        df["avg_cpks"] = df.groupby("component_map")["cpk"].transform("mean")

        # Calculate the average cpk per component of all vehicles for branch
        df["avg_cpks_branch"] = df.groupby(["component_map", "branch"])["cpk"].transform(
            "mean"
        )

        # Calculate the percentage of costs for each unique vehiclereg and component_map row
        df["percentage_avg_costs"] = round(df["costs"] / df["avg_costs"] * 100)

        # Calculate the percentage of costs for each unique vehiclereg, component_map, and branch row
        df["percentage_avg_costs_branch"] = round(
            df["costs"] / df["avg_costs_branch"] * 100
        )

        # Calculate the percentage of costs for each unique vehiclereg
        df["percentage_avg_cpk"] = round(df["cpk"] / df["avg_cpks"] * 100)

        # Calculate the percentage of costs for each unique vehiclereg and branch row
        df["percentage_avg_cpk_branch"] = round(df["cpk"] / df["avg_cpks_branch"] * 100)

        # Add ranking based on percentage costs for each vehicle vs fleet
        df["ranking_fleet_costs"] = df.groupby("component_map")[
            "percentage_avg_costs"
        ].rank(ascending=True)

        # Add ranking based on percentage costs for each vehicle vs branch
        df["ranking_branch_costs"] = df.groupby(["component_map", "branch"])[
            "percentage_avg_costs_branch"
        ].rank(ascending=True)

        # Add ranking based on CPK for each branch
        df["ranking_branch_cpk"] = df.groupby(["component_map", "branch"])["cpk"].rank(
            ascending=True
        )

        # Add ranking based on CPK for the whole fleet
        df["ranking_fleet_cpk"] = df.groupby("component_map")["cpk"].rank(ascending=True)

        # Add maximum possible ranking per branch for each component_map
        df["max_ranking_branch"] = df.groupby(["component_map", "branch"])[
            "ranking_branch_cpk"
        ].transform("max")

        # Add maximum possible ranking for the whole fleet for each component_map
        df["max_ranking_fleet"] = df.groupby(["component_map"])[
            "ranking_fleet_cpk"
        ].transform("max")
        df["veh_model_map"] = veh_model_map
        df = df.replace([np.inf, -np.inf, np.nan], 0)
        vehicle_df = df[df["vehiclereg"] == vehicle_reg].replace(
            [np.inf, -np.inf, np.nan], 0
     )
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return vehicle_df.to_dict("records"), df.to_dict("records")


@cpks_charts_graphs_router.get(
    "/get_cpk_and_costs_ranked_per_component_for_a_model_in_division",
    description="Get ranked cpks and total costs per component map (including total costs), for all vehciles of a certain model.",

)
def get_ranked_component_cpks_per_model_in_division(
    veh_model_map: str, vehicle_reg: str, user: dict = Depends(validate_token)
):
    try:
        query_list = []
        cost_query = sql.SQL(
            """COPY(WITH component_costs AS (
    SELECT
        vehiclereg,
        branch,
        component_map,
        SUM(cost) AS costs
    FROM
        fleet.x_component_cost_per_day_asset
    WHERE
        LOWER(veh_model_map) = LOWER({veh_model_map})
    GROUP BY
        vehiclereg,
        branch,
        component_map
    ), distances AS (
    SELECT
        vehiclereg,
        SUM(distance) AS distance
    FROM
        fleet.x_dist_per_day_asset
    WHERE
        LOWER(veh_model_map) = LOWER({veh_model_map})
    GROUP BY
        vehiclereg
    ), total_component_costs AS (
    SELECT
        vehiclereg,
        SUM(costs) AS total_cost
    FROM
        component_costs
    GROUP BY
        vehiclereg
    )
    SELECT
    COALESCE(fl.vehiclereg, cc.vehiclereg) AS vehiclereg,
    fl.branch,
    cc.component_map,
    cc.costs,
    d.distance,
    COALESCE(cc.costs / d.distance, 0) AS cpk
    FROM
    distances d
    FULL OUTER JOIN fleet.fleetlist fl ON fl.vehiclereg = d.vehiclereg
    FULL OUTER JOIN component_costs cc ON cc.vehiclereg = fl.vehiclereg AND cc.branch = fl.branch
    WHERE
    LOWER(fl.veh_model_map) = LOWER({veh_model_map})
    UNION ALL
    SELECT
    fl.vehiclereg,
    fl.branch,
    'Total',
    tcc.total_cost,
    d.distance,
    COALESCE(tcc.total_cost / d.distance, 0) AS cpk
    FROM
    fleet.fleetlist fl
    JOIN total_component_costs tcc ON tcc.vehiclereg = fl.vehiclereg
    JOIN distances d ON d.vehiclereg = fl.vehiclereg
    WHERE
    LOWER(fl.veh_model_map) = LOWER({veh_model_map})
    ORDER BY
    cpk ASC
    )  TO STDOUT WITH CSV HEADER"""
        ).format(
            veh_model_map=sql.Literal(veh_model_map.lower()),
        )
        query_list.append(cost_query)
        # try:
        response_list = exc_qrs_get_dfs_raw(query_list)

        df = response_list[0]
        # Calculate the average costs of all vehicles for each component_map
        df["avg_costs"] = round(df.groupby("component_map")["costs"].transform("mean"), 2)

        # Calculate the average costs of all vehicles for each component_map and branch
        df["avg_costs_branch"] = round(
            df.groupby(["component_map", "branch"])["costs"].transform("mean"), 2
        )

        # Calculate the average cpk per component of all vehicles for full fleet
        df["avg_cpks"] = df.groupby("component_map")["cpk"].transform("mean")

        # Calculate the average cpk per component of all vehicles for branch
        df["avg_cpks_branch"] = df.groupby(["component_map", "branch"])["cpk"].transform(
            "mean"
        )

        # Calculate the percentage of costs for each unique vehiclereg and component_map row
        df["percentage_avg_costs"] = round(df["costs"] / df["avg_costs"] * 100)

        # Calculate the percentage of costs for each unique vehiclereg, component_map, and branch row
        df["percentage_avg_costs_branch"] = round(
            df["costs"] / df["avg_costs_branch"] * 100
        )

        # Calculate the percentage of costs for each unique vehiclereg
        df["percentage_avg_cpk"] = round(df["cpk"] / df["avg_cpks"] * 100)

        # Calculate the percentage of costs for each unique vehiclereg and branch row
        df["percentage_avg_cpk_branch"] = round(df["cpk"] / df["avg_cpks_branch"] * 100)

        # Add ranking based on percentage costs for each vehicle vs fleet
        df["ranking_fleet_costs"] = df.groupby("component_map")[
            "percentage_avg_costs"
        ].rank(ascending=True)

        # Add ranking based on percentage costs for each vehicle vs branch
        df["ranking_branch_costs"] = df.groupby(["component_map", "branch"])[
            "percentage_avg_costs_branch"
        ].rank(ascending=True)

        # Add ranking based on CPK for each branch
        df["ranking_branch_cpk"] = df.groupby(["component_map", "branch"])["cpk"].rank(
            ascending=True
        )

        # Add ranking based on CPK for the whole fleet
        df["ranking_fleet_cpk"] = df.groupby("component_map")["cpk"].rank(ascending=True)

        # Add maximum possible ranking per branch for each component_map
        df["max_ranking_branch"] = df.groupby(["component_map", "branch"])[
            "ranking_branch_cpk"
        ].transform("max")

        # Add maximum possible ranking for the whole fleet for each component_map
        df["max_ranking_fleet"] = df.groupby(["component_map"])[
            "ranking_fleet_cpk"
        ].transform("max")
        df["veh_model_map"] = veh_model_map
        df = df.replace([np.inf, -np.inf, np.nan], 0)
        vehicle_df = df[df["vehiclereg"] == vehicle_reg].replace(
            [np.inf, -np.inf, np.nan], 0
        )
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return vehicle_df.to_dict("records"), df.to_dict("records")

@cpks_charts_graphs_router.get(
    "/get_total_cpk_ranked_for_all_models_in_division",
    description="Get ranked cpks and total costs per component map (including total costs), for all vehciles of a certain model.",
 
)
def get_total_cpk_ranked_for_all_models_in_division(division: str, user: dict = Depends(validate_token)):
    try:
        query_list = []
        cost_query = sql.SQL(
            """COPY(
        select x_component_cost_per_day_asset.veh_model_map, veh_type_map, sum(cost) as total_cost
    , coalesce(dist.total_dist, 1) as distance, fl.asset_count_division, coalesce(tot_dist.fleet_total_dist, 0) as fleet_total_dist, tot_cost.fleet_total_cost
    from fleet.x_component_cost_per_day_asset
    left join (select veh_model_map, sum(distance)as total_dist from fleet.x_dist_per_day_asset 
    where branch = any(array(select branches from fleet.divisions where lower(division) = lower({division}))) and veh_type_map <> 'Trailer' group by veh_model_map
    ) dist on dist.veh_model_map = x_component_cost_per_day_asset.veh_model_map
    left join (select veh_model_map, count(veh_model_map)as asset_count_division from fleet.fleetlist where branch = any(array(select branches from fleet.divisions where lower(division) = lower({division}))) and veh_type_map <> 'Trailer'
            group by veh_model_map) fl on fl.veh_model_map = x_component_cost_per_day_asset.veh_model_map
    left join( select veh_model_map, sum(distance)as fleet_total_dist from fleet.x_dist_per_day_asset where veh_type_map <> 'Trailer' group by veh_model_map ) 
    as tot_dist on tot_dist.veh_model_map = x_component_cost_per_day_asset.veh_model_map
    left join( select veh_model_map, sum(cost)as fleet_total_cost from fleet.x_component_cost_per_day_asset where veh_type_map <> 'Trailer' group by veh_model_map ) 
    as tot_cost on tot_cost.veh_model_map = x_component_cost_per_day_asset.veh_model_map
    where branch = any(array(select branches from fleet.divisions where lower(division) = lower({division})))  and veh_type_map <> 'Trailer'
    group by x_component_cost_per_day_asset.veh_model_map
    , dist.total_dist, veh_type_map, fl.asset_count_division, tot_dist.fleet_total_dist, tot_cost.fleet_total_cost
    )  TO STDOUT WITH CSV HEADER"""
        ).format(
            division=sql.Literal(division.lower()),
        )
        query_list.append(cost_query)
        # try:
        response_list = exc_qrs_get_dfs_raw(query_list)

        df = response_list[0]

        df["div_cpk"] = round(df.total_cost / df.distance, 2)
        df["fleet_cpk"] = round(df.fleet_total_cost / df.fleet_total_dist, 2)
        df["percentage_of_fleet_cpk"] = round(df.div_cpk / df.fleet_cpk * 100)

        model_map_df = df.copy()
        df.drop(["veh_model_map"], inplace=True, axis="columns")
        type_map_df = df.groupby(["veh_type_map"]).sum().reset_index("veh_type_map")
        type_map_df["div_cpk"] = round(type_map_df.total_cost / type_map_df.distance, 2)
        type_map_df["fleet_cpk"] = round(
            type_map_df.fleet_total_cost / type_map_df.fleet_total_dist, 2
        )
        type_map_df["percentage_of_fleet_cpk"] = round(
            type_map_df.div_cpk / type_map_df.fleet_cpk * 100
        )

        type_map_df = type_map_df.replace([np.inf, -np.inf, np.nan], 0)
        model_map_df = model_map_df.replace([np.inf, -np.inf, np.nan], 0)
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return {
        "model_cpks": model_map_df.to_dict("records"),
        "type_cpks": type_map_df.to_dict("records"),
    }

@cpks_charts_graphs_router.get(
    "/get_maint_cpks",

    description="Get a vehicles cpk per maintenance catagory over a period.  Also get the same model avg cpks for the branch and fleet for period",
)
def get_cpks(asset_id: str, branch: str, veh_model_map: str, user: dict = Depends(validate_token)):
    try:
        query_list = []
        # get usage of same asset models in branch and full fleet for the period.

        component_cost_query = sql.SQL(
            """COPY (
                SELECT
        component_map,
        total_cost_per_component_map,
        total_cost_per_component_map_same_branch,
        total_cost_per_component_map_same_veh_model
    FROM (
        SELECT
            component_map,
            SUM(CASE WHEN LOWER(vehiclereg) = LOWER('KR95PVGP') THEN cost ELSE 0 END) AS total_cost_per_component_map,
            SUM(CASE WHEN LOWER(branch) = LOWER('5620 152 TRANSRITE GAU') AND LOWER(veh_model_map) = LOWER('Scania G450 TT') THEN cost ELSE 0 END) AS total_cost_per_component_map_same_branch,
            SUM(CASE WHEN LOWER(veh_model_map) = LOWER('Scania G450 TT') THEN cost ELSE 0 END) AS total_cost_per_component_map_same_veh_model
        FROM
            fleet.x_component_cost_per_day_asset
        GROUP BY
            component_map
    ) AS subquery
    WHERE
        total_cost_per_component_map > 0 OR
        total_cost_per_component_map_same_branch > 0 OR
        total_cost_per_component_map_same_veh_model > 0

            ) TO STDOUT WITH CSV HEADER"""
        ).format(
            asset_id=sql.Literal(asset_id.lower()),
            branch=sql.Literal(branch.lower()),
            veh_model_map=sql.Literal(veh_model_map.lower()),
        )
        veh_count_query = """COPY (
                select 
        sum(case when lower(branch) = lower('5620 152 TRANSRITE GAU') and 
                            lower(veh_model_map) = lower('Scania G450 TT') then 1 else 0 end) as branch_count,
            
        sum(case when lower(veh_model_map) = lower('Scania G450 TT') then 1 else 0 end) as fleet_count from fleet.fleetlist
            ) TO STDOUT WITH CSV HEADER"""
        distances_query = """COPY (
                SELECT
        
            SUM(CASE WHEN lower(vehiclereg) = lower('KR95PVGP') then distance else 0 end) AS total_distance,
            SUM(CASE WHEN LOWER(branch) = LOWER('5620 152 TRANSRITE GAU') AND LOWER(veh_model_map) = LOWER('Scania G450 TT') THEN distance ELSE 0 END) AS total_distance_same_branch,
            SUM(CASE WHEN LOWER(veh_model_map) = LOWER('Scania G450 TT') THEN distance ELSE 0 END) AS total_distance_same_veh_model
        FROM
            fleet.x_dist_per_day_asset
            ) TO STDOUT WITH CSV HEADER"""

        query_list.append(component_cost_query)
        query_list.append(veh_count_query)
        query_list.append(distances_query)
        # try:
        response_list = exc_qrs_get_dfs_raw(query_list)
        costs_df = response_list[0]
        distances = response_list[2]
        veh_counts = response_list[1]
        costs_df = costs_df.assign(veh_counts_branch=veh_counts["branch_count"].values[0])
        costs_df = costs_df.assign(veh_count_fleet=veh_counts["fleet_count"].values[0])
        costs_df = costs_df.assign(
            dist_fleet=distances["total_distance_same_veh_model"].values[0]
        )
        costs_df = costs_df.assign(
            dist_branch=distances["total_distance_same_branch"].values[0]
        )
        costs_df = costs_df.assign(dist_asset=distances["total_distance"].values[0])
        # costs_df['veh_count_branch'] = veh_counts.branch_count
        # costs_df['veh_count_fleet'] = veh_counts.fleet_count
        # costs_df['dist_fleet'] = distances.total_distance_same_veh_model
        # costs_df['dist_branch'] = distances.total_distance_same_branch
        # costs_df['dist_asset'] = distances.total_distance
        costs_df["asset_cpk"] = round(
            costs_df.total_cost_per_component_map / costs_df.dist_asset, 2
        )
        costs_df["branch_cpk"] = round(
            costs_df.total_cost_per_component_map_same_branch / costs_df.dist_branch, 2
        )
        costs_df["fleet_cpk"] = round(
            costs_df.total_cost_per_component_map_same_veh_model / costs_df.dist_fleet, 2
        )
        costs_df = costs_df.replace([np.inf, -np.inf, np.nan], None)
        logger.info(costs_df)

        # Rename the columns for consistency with the radar chart data format

        # except Exception as error:
        #     logger.info(error)
        #     return error
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")

    return costs_df.to_dict("records")

@cpks_charts_graphs_router.get(
    "/get_cpk_per_component_map_per_division",
    description="Get cpk poer component for all branches in a division.  Also gives division avg cpk per component",
    )
def get_cpk_per_component_map_per_division(division: str, user: dict = Depends(validate_token)):
    try:
        query_list = []
        component_cost_query = sql.SQL(
            """COPY (
    SELECT
        component_map,
        x_component_cost_per_day_asset.branch,
        SUM(cost) AS component_cost,
        dist.distance,
        ROUND(SUM(cost) / dist.distance, 2) AS component_cpk,
        ROUND(AVG(ROUND(SUM(cost) / dist.distance, 2)) OVER (PARTITION BY component_map), 2) AS avg_component_cpk
    FROM
        fleet.x_component_cost_per_day_asset
    LEFT JOIN
        (
            SELECT
                SUM(distance) AS distance,
                branch
            FROM
                fleet.x_dist_per_day_asset
            WHERE
                branch = ANY (
                    ARRAY (
                        SELECT
                            branches
                        FROM
                            fleet.divisions
                        WHERE
                            LOWER(division) = {division}
                    )
                )
            GROUP BY
                branch
        ) dist ON dist.branch = x_component_cost_per_day_asset.branch
    WHERE
        x_component_cost_per_day_asset.branch = ANY (
            ARRAY (
                SELECT
                    branches
                FROM
                    fleet.divisions
                WHERE
                    LOWER(division) = {division}
            )
        )
    GROUP BY
        x_component_cost_per_day_asset.branch,
        x_component_cost_per_day_asset.component_map,
        dist.distance
        order by component_map
        
        
    ) TO STDOUT WITH CSV HEADER"""
        ).format(
            division=sql.Literal(division.lower()),
        )

        query_list.append(component_cost_query)
        response_list = exc_qrs_get_dfs_raw(query_list)
        df = response_list[0]
        component_map_dfs = {}
        for component_map, group_df in df.groupby("component_map"):
            component_map_dfs[component_map] = {
                "div_avg": group_df.copy().avg_component_cpk.values[0],
                "div_data": group_df.copy().sort_values("component_cpk").to_dict("records"),
            }
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return {"dfs": component_map_dfs}

