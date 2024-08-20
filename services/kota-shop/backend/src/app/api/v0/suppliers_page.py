from logging import Logger
from fastapi import APIRouter, HTTPException, Depends
import numpy as np
from loguru import logger
from .db_config import exc_qrs_get_dfs_raw
from psycopg2 import sql
import traceback
from .form_class import FormValues
from .auth import validate_token

suppliers_page_router = APIRouter()

@suppliers_page_router.post(
    "sho002_get_veh_type_table",
    description="get veh type table",
)
def sho002_get_veh_type_table(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form_values = FormValues(formValues)

        veh_type_query = sql.SQL(
            """COPY(
        SELECT veh_type_map,
                SUM(amount) AS cost, COUNT(amount) AS repair_count,
                COALESCE(ROUND(SUM(amount) / COUNT(amount), 2), 0) AS avarage_cost
                FROM fleet.maintenance
                WHERE  serviceprovider = any({suppliers})
        
            and julian_month BETWEEN {julian_from} AND {julian_to} 
            and vehiclereg = any({registrations})      
                GROUP BY veh_type_map
                ORDER BY cost DESC
        )TO STDOUT WITH CSV HEADER"""
        ).format(
            julian_from=form_values.julStartMonth,
            julian_to=form_values.julEndMonth,
            registrations=form_values.registrations,
            suppliers=form_values.suppliers,
        )

        response = exc_qrs_get_dfs_raw([veh_type_query])[0].to_dict("records")
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response


@suppliers_page_router.post(
    "/sho002_get_supplier_costs_and_counts_for_bar_graph",
    description="Get costs and counts per veh_type for a specific supplier.   Bar grap at top of supplier page",
)
def sho002_get_supplier_costs_and_counts_for_bar_graph(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form_values = FormValues(formValues)
        maint_raw_data = sql.SQL(
            """COPY(
                select veh_type_map, sum(amount) as cost, count(serviceprovider) from fleet.maintenance 
                where  serviceprovider = any({suppliers})
            
                and julian_month BETWEEN {julian_from} AND {julian_to}  
                and vehiclereg = any({registrations})      
                group by veh_type_map
                order by cost desc                             
            )TO STDOUT WITH CSV HEADER """
        ).format(
            julian_from=form_values.julStartMonth,
            julian_to=form_values.julEndMonth,
            registrations=form_values.registrations,
            suppliers=form_values.suppliers,
        )

        response = exc_qrs_get_dfs_raw([maint_raw_data])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
        
    return response


@suppliers_page_router.post(
    "/sho002_get_supplier_costs_and_counts_for_top_totals",
    description="Get costs and counts per veh_type for a specific supplier.   Bar grap at top of supplier page",
)
def sho002_get_supplier_costs_and_counts_for_top_totals(
    formValues: dict, user: dict = Depends(validate_token)
):
    try:
        form_values = FormValues(formValues)
      
        maint_raw_data = sql.SQL(
            """COPY(
            select sum(amount) as cost, count(amount)
            from fleet.maintenance where
            serviceprovider = any({suppliers})
        
            and julian_month BETWEEN {julian_from} AND {julian_to} 
            and vehiclereg = any({registrations})                     
        )TO STDOUT WITH CSV HEADER """
        ).format(
            julian_from=form_values.julStartMonth,
            julian_to=form_values.julEndMonth,
            registrations=form_values.registrations,
            suppliers=form_values.suppliers,
        )

        response = exc_qrs_get_dfs_raw([maint_raw_data])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response


@suppliers_page_router.post(
    "/sho002_get_supplier_inv",
    description="Get supplier invoice",
)
def sho002_get_supplier_inv(
     formValues: dict, user: dict = Depends(validate_token)
):
    try:
        form_values = FormValues(formValues)
        maint_raw_data = sql.SQL(
            """COPY(
                        select sum(savings::numeric) as savings,fleet_no, transdate, savings_reason, mapping, serviceprovider, amount, branch, veh_type_map, division, vehiclereg, invoice_no  from fleet.maintenance   
                        where  serviceprovider = any({suppliers})
            
                and julian_month BETWEEN {julian_from} AND {julian_to}   
                and vehiclereg = any({registrations})      
                        group by transdate, savings_reason, mapping, serviceprovider, 
                        amount, branch, veh_type_map, division, vehiclereg, invoice_no, fleet_no                              
            )TO STDOUT WITH CSV HEADER """
        ).format(
            julian_from=form_values.julStartMonth,
            julian_to=form_values.julEndMonth,
            registrations=form_values.registrations,
            suppliers=form_values.suppliers,
        )

        response = exc_qrs_get_dfs_raw([maint_raw_data])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response




@suppliers_page_router.post(
    "sho002_get_component_type_table",
    description="get component type table",
)
def sho002_get_component_type_table(

    formValues: dict, user: dict = Depends(validate_token)
):
    try: 
        form_values = FormValues(formValues)
        component_type_query = sql.SQL(
            """COPY(
                SELECT mapping,
                SUM(amount) AS cost, COUNT(amount) AS repair_count,
                COALESCE(ROUND(SUM(amount) / COUNT(amount), 2), 0) AS avarage_cost
                FROM fleet.maintenance
                WHERE  serviceprovider = any({suppliers})
        
            and julian_month BETWEEN {julian_from} AND {julian_to} 
            and vehiclereg = any({registrations})      
                GROUP BY mapping
                ORDER BY cost DESC
        )TO STDOUT WITH CSV HEADER"""
        ).format(
            julian_from=form_values.julStartMonth,
            julian_to=form_values.julEndMonth,
            registrations=form_values.registrations,
            suppliers=form_values.suppliers,
        )

        response = exc_qrs_get_dfs_raw([component_type_query])[0].to_dict("records")

    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response


@suppliers_page_router.post(
    "/get_supplier_totals_table_per_division",
    description="Get total spend, savings, cancelled and txn count per supplier for a division",
)
def get_supplier_totals_table_per_division(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form_values = FormValues(formValues)
        query_list = []
        supplier_query = sql.SQL(
            """COPY (
                    select maintenance.serviceprovider, count(amount) as txn_count, sum(amount) as costs, sum(savings::numeric) as savings, cancelled.costs as cancelled_costs from fleet.maintenance

                    join (select serviceprovider, sum(amount) as costs from fleet.maintenance_cancelled
                    where vehiclereg in (select vehiclereg from fleet.fleetlist where branch = any(array(select branches from fleet.divisions where division = {division})))
                        group by serviceprovider)
                    cancelled on cancelled.serviceprovider = maintenance.serviceprovider

                    where vehiclereg in (select vehiclereg from fleet.fleetlist where branch = any(array(select branches from fleet.divisions where division = {division})))
                    group by maintenance.serviceprovider, cancelled.costs
            ) TO STDOUT WITH CSV HEADER"""
        ).format(
            division=form_values.registrations
        )

        query_list.append(supplier_query)
        response_list = exc_qrs_get_dfs_raw(query_list)
        supplier_df = response_list[0]
        supplier_df["avg_txn_cost"] = round(
            supplier_df.costs / supplier_df.txn_count, 2
        )
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")

    return supplier_df.to_dict("records")
