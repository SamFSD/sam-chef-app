from fastapi import APIRouter, HTTPException, Depends
import traceback
from .db_config import exc_qrs_get_dfs_raw
from psycopg2 import sql
from loguru import logger
import pandas as pd
from .form_class import FormValues
from datetime import datetime
from .auth import validate_token

fleetlist_page_router = APIRouter()

@fleetlist_page_router.post(
    "/get_fleetlist_vehicle_count",
    description="Get per type veh counts for fleetlist top row",
 
)
def get_fleetlist_vehicle_count(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form_values = FormValues(formValues)
        query = sql.SQL(
            """COPY (
                        WITH vehicle_counts AS (
                            SELECT
                                veh_type_map,
                                SUM(CASE WHEN contract_type = 'Managed Maintenance' THEN 1 ELSE 0 END) AS "mm_count",
                                SUM(CASE WHEN contract_type IN ('Full Maintenance Lease with Tyres', 'Full Maintenance Lease without Tyres') THEN 1 ELSE 0 END) AS "fml_count",
                                SUM(CASE WHEN contract_type = 'Operating Lease' THEN 1 ELSE 0 END) AS "opl_count",
                                COUNT(*) AS "total_count"
                            FROM
                                fleet.fleetlist                        
                                WHERE vehiclereg = any({registrations})  
                            GROUP BY
                                veh_type_map
                        )
                        SELECT
                            veh_type_map,
                            mm_count,
                            fml_count,
                            opl_count,
                            total_count
                        FROM
                            vehicle_counts
                        UNION ALL
                        SELECT
                            'Total' as veh_type_map,
                            SUM(mm_count) AS mm_count,
                            SUM(fml_count) AS fml_count,
                            SUM(opl_count) AS opl_count,
                            SUM(total_count) AS total_count
                        FROM
                            vehicle_counts
                    ) TO STDOUT WITH CSV HEADER"""
        ).format(
            registrations=form_values.registrations,
        )
        response = exc_qrs_get_dfs_raw([query])[0].to_dict("records")
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response


@fleetlist_page_router.post(
    "/fleetlist",
    description="Get the fleetlist for the selected filters",

)
def get_fleetlist(formValues: dict, user: dict = Depends(validate_token)):
    try:    
        form_values = FormValues(formValues)

        query = sql.SQL("""COPY(
        SELECT
            vehiclereg, fleet_no, deal_number, contract_type, division, branch, chassis_no, mm_code, vehicle_cat,
            description, new_used, maint_plan_cost, contract_mileage, make, veh_model_map, veh_type_map,
            date_of_first_reg, months_remaining, veh_lic_exp, contract_start, contract_end,
            last_odo, last_odo_date
        FROM fleet.fleetlist

        WHERE
            vehiclereg = any({registrations})  
        )TO STDOUT WITH CSV HEADER
                        """).format(
            registrations=form_values.registrations,
        )
     
        df = exc_qrs_get_dfs_raw([query])[0]    
        df['last_odo'] = df['last_odo'].replace('', 0)
        today = datetime.now()
        df['progress'] = ((today - pd.to_datetime(df['contract_start'])) / (pd.to_datetime(df['contract_end']) - pd.to_datetime(df['contract_start']))) * 100
        df['progress'] = df['progress'].astype(str)      

        results = df.to_dict("records")  
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return results
