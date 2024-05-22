import traceback
from fastapi import APIRouter,HTTPException, Depends
from .db_config import exc_qrs_get_dfs_raw
from .helpers import (
    div_filter_check, 
    div_branch_type_filter_check,   
    date_filter,)
from psycopg2 import sql
from .auth import validate_token

filter_form = APIRouter()

@filter_form.get(
    "/sho002_get_supplier_dropdown_per_div_and_branch",
    description="Get supplier dropdowns per div and branch",
)
def sho002_get_supplier_dropdown_per_div_and_branch(
    from_date: str, to_date: str, division: str, branch: str, veh_type: str, user: dict = Depends(validate_token)
):
    try:
        division_filter, branches_filter, type_filter = div_branch_type_filter_check(
            division, branch, veh_type
        )
        date_condition = date_filter(from_date, to_date)
        query = sql.SQL(
            """COPY(
                    select distinct serviceprovider from fleet.maintenance
                                where transdate {date_condition} 
                                and lower(division) = {division} 
                                and lower(branch) = {branch} 
                                and lower(veh_type_map) = {veh_type}
                                order by serviceprovider asc                             
        )TO STDOUT WITH CSV HEADER """
        ).format(
            date_condition=date_condition,
            division=division_filter,
            branch=branches_filter,
            veh_type=type_filter,
        )
        response = exc_qrs_get_dfs_raw([query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response


@filter_form.get(
    "/get_order_suppliers_per_branch",
    description="Get suppliers per branch for order form dropdown",
)
def get_order_suppliers_per_branch(branch: str, user: dict = Depends(validate_token)):
    try:
        select_statement = sql.SQL(
            """COPY (select service_provider from fleet.supplier_per_branch where lower(branch) = {branch}
        ) TO STDOUT WITH CSV HEADER"""
        ).format(branch=sql.Literal(branch.lower()))

        # try:
        response_list = exc_qrs_get_dfs_raw([select_statement])
        service_providers = response_list[0]
        # except Exception as error:
        #     logger.info(error)
        #     return error
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")

    return service_providers.to_dict("records")


@filter_form.get(
    "/get_divisions",

    description="Get all fleet divisions for divisions drop down",
)
def get_divisions(user: dict = Depends(validate_token)):
    try:

        """get all fleet divsions, mostly for dropdowns"""

        get_divisions = sql.SQL(
            """COPY (    
            select distinct division from fleet.divisions_new
            order by division ASC
            ) TO STDOUT WITH CSV HEADER"""
        )

        response = exc_qrs_get_dfs_raw([get_divisions])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response


@filter_form.get(
    "/get_registrations_for_maintenance_txns",

    description="Get all registrations present in txns for asset dropdown",
)
def get_registrations(division: str, branch: str, veh_type: str, user: dict = Depends(validate_token)):
    try:
        """get all fleet divsions, mostly for dropdowns"""
        division_filter, branch_filter, veh_type_filter = div_branch_type_filter_check(
            division, branch, veh_type
        )
        query_list = []
        get_query = sql.SQL(
            """COPY (    
                    select distinct vehiclereg from fleet.fleetlist

            where lower(division) = {division} and lower(branch) = {branch}
            and lower(veh_type_map) = {veh_type}
            order by vehiclereg

                ) TO STDOUT WITH CSV HEADER"""
        ).format(
            division=division_filter, branch=branch_filter, veh_type=veh_type_filter
        )

        query_list.append(get_query)

        df = exc_qrs_get_dfs_raw(query_list)[0]
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")

    return df.to_dict("records")


@filter_form.get(
    "/get_suppliers_for_maintenance_txns",

    description="Get all suppliers present in txns for asset dropdown",
)
def get_suppliers_for_maintenance_txns(from_date: str, to_date: str, user: dict = Depends(validate_token)):
    try:
        """get all fleet divsions, mostly for dropdowns"""
        query_list = []
        get_query = sql.SQL(
            """COPY (    
                    select distinct supplier_name from fleet.maintenance_cent 

            where date_created between {from_date} and {to_date}
            order by supplier_name

            ) TO STDOUT WITH CSV HEADER"""
        ).format(from_date=sql.Literal(from_date), to_date=sql.Literal(to_date))

        query_list.append(get_query)

        df = exc_qrs_get_dfs_raw(query_list)[0]
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")

    return df.to_dict("records")


@filter_form.get(
    "/get_branches_in_division",

    description="Get all branches for a selected division to populate branch dropdown",
)
def get_branches_in_division(division: str, user: dict = Depends(validate_token)):
    try:
        """get all fleet branches of spacific division"""
        division_filter = div_filter_check(division)
        query_list = []
        # if division == 'full_fleet':
        #     snippet = sql.SQL('lower(division)')
        # else:
        #     snippet = sql.SQL('any({division})').format(division=sql.Literal(division.lower()))
        # get_branches_query = sql.SQL("""COPY (
        #     select distinct branch from fleet.divisions_new
        #                        where lower(division)={main}
        #        ) TO STDOUT WITH CSV HEADER""").format(main = snippet)
        get_branches_query = sql.SQL(
            """COPY (    
            select distinct branch from fleet.divisions_new
                            where lower(division) = {division}
                                order by branch asc
            ) TO STDOUT WITH CSV HEADER"""
        ).format(division=division_filter)
        query_list.append(get_branches_query)
        response = exc_qrs_get_dfs_raw(query_list)[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response


@filter_form.get(
    "/get_veh_types_in_division",

    description="Get unique vehicle/asset types and counts for a given division",
)
def get_per_cat_count_division(filtered_division: str, user: dict = Depends(validate_token)):
    try:
        """Get count of commercial, heavy commercial, trailers etc"""
        select_statement = sql.SQL(
            """COPY (
                            select distinct(veh_type_map), COUNT(CASE WHEN veh_type_map = veh_type_map then 1 ELSE 0 END)
                as unit_count
                from fleet.fleetlist where branch
                = any(array(select branches from fleet.divisions where lower(division) = {fleetfilter}))
                group by veh_type_map
                    order by unit_count desc
                    
        ) TO STDOUT WITH CSV HEADER"""
        ).format(fleetfilter=sql.Literal(filtered_division))

        query_list = [select_statement]


        response_list = exc_qrs_get_dfs_raw(query_list)
        count_df = response_list[0]
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return count_df.to_dict("records")


@filter_form.get(
    "/get_veh_types_in_branch",

    description="Get unique vehicle/asset types and counts for a given branch",
)
def get_per_cat_count_branch(filtered_branch, user: dict = Depends(validate_token)):
    try:
        """Get count of commercial, heavy commercial, trailers etc"""

        select_statement = sql.SQL(
            """COPY (
                            select distinct(veh_type_map), COUNT(CASE WHEN veh_type_map = veh_type_map then 1 ELSE NULL END)
                as unit_count
                from fleet.fleetlist where lower(branch)
                =  {filtered_branch}
                group by veh_type_map
                    order by unit_count desc
        ) TO STDOUT WITH CSV HEADER"""
        ).format(filtered_branch=sql.Literal(filtered_branch))

        query_list = [select_statement]

 
        response_list = exc_qrs_get_dfs_raw(query_list)
        count_df = response_list[0]
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")

    return count_df.to_dict("records")
