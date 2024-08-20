from fastapi import APIRouter, HTTPException, Depends
import traceback
from loguru import logger
from .db_config import exc_qrs_get_dfs_raw
from psycopg2 import sql
from .form_class import FormValues
from datetime import datetime
import pandas as pd
from .auth import validate_token

expirations_page_router = APIRouter()

@expirations_page_router.post(
    "/sho002_get_upcoming_expirations_counts",
    description="get_upcoming_expirations_counts",
)
def sho002_get_upcoming_expirations_counts(formValues: dict, user: dict = Depends(validate_token)):
    try:        
        form_values = FormValues(formValues)
        expiration_count_query = sql.SQL(
            """COPY(
        select 
            sum(case when (veh_lic_exp <= date_trunc('month', now())) then 1 else 0 end) as lic_expired_count,
            sum(case when (contract_end <= date_trunc('month', now())) then 1 else 0 end) as contract_expired_count,
            sum(case when ((veh_lic_exp <= date_trunc('month', now() + interval '1 months')) and (veh_lic_exp >= date_trunc('month', now()))) then 1 else 0 end) as next_month_lic_expired_count,
            sum(case when ((contract_end <= date_trunc('month', now() + interval '1 months')) and (contract_end >= date_trunc('month', now()))) then 1 else 0 end) as next_month_contract_expired_count,
            sum(case when ((veh_lic_exp <= date_trunc('month', now() + interval '2 months')) and (veh_lic_exp >= date_trunc('month', now() + interval '1 months'))) then 1 else 0 end) as next_two_month_lic_expired_count,
            sum(case when ((contract_end <= date_trunc('month', now() + interval '2 months')) and (contract_end >= date_trunc('month', now() + interval '1 months'))) then 1 else 0 end) as next_two_month_contract_expired_count
        from fleet.fleetlist      
        where vehiclereg = any({registrations})        
        ) TO STDOUT WITH CSV HEADER """
        ).format(
            registrations=form_values.registrations,          
        )

        response = exc_qrs_get_dfs_raw([expiration_count_query])[0]
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response.to_dict("records")

 # DO NOT CHANGE THIS LINE

@expirations_page_router.post(
    "/get_vehicle_licence_count_table",
    description="get vehicles licence expirations count table",

)
def get_vehicle_licence_count_table(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form_values = FormValues(formValues)
      
        # check if we are looking for already expired licenses or not
        if form_values.month.lower() == "expired":
            veh_lic_exp_table_query = sql.SQL(
                """COPY(
                                            
                SELECT division, vehiclereg,fleet_no, branch,  veh_type_map, veh_lic_exp
                FROM fleet.fleetlist
                WHERE date_trunc('month', veh_lic_exp) <= date_trunc('month', now())
                and vehiclereg = any({registrations})  and fleet_no = any({fleetno})
            ) TO STDOUT WITH CSV HEADER """
            ).format(    
            registrations=form_values.registrations,
            fleetno=form_values.fleetno,
             )
        else:
            veh_lic_exp_table_query = sql.SQL(
                """COPY(
            SELECT division, vehiclereg,fleet_no, branch, date_of_first_reg, veh_type_map,
           contract_type
            FROM fleet.fleetlist
            WHERE date_trunc('month', veh_lic_exp::timestamp) = date_trunc('month', {month}::timestamp)
            and vehiclereg = any({registrations})  and fleet_no = any({fleetno})
                    and map = any({components}) 
        ) TO STDOUT WITH CSV HEADER """
            ).format(
            month=form_values.month,
            registrations=form_values.registrations,
            fleetno=form_values.fleetno,
            components=form_values.components,

            )
        response = exc_qrs_get_dfs_raw([veh_lic_exp_table_query])[0].to_dict("records")
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response

@expirations_page_router.post(
    "/get_vehicle_contract_table",
    description="get vehicles conrtract expirations count table",
 
)
def get_vehicle_contract_table(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form_values = FormValues(formValues)
        # check if we are looking for already expired licenses or not
        if form_values.month.lower() == "expired":
            veh_contract_exp_table_query = sql.SQL(
                """COPY(                
                SELECT division, vehiclereg,fleet_no, branch,  veh_type_map, contract_end, contract_type, contract_start, months_remaining,modified_contract_start_date
                FROM fleet.fleetlist
                WHERE date_trunc('month', contract_end) <= date_trunc('month', now())
                    and vehiclereg = any({registrations})  and fleet_no = any({fleetno})
            ) TO STDOUT WITH CSV HEADER """
            ).format(     
             registrations=form_values.registrations,
             fleetno=form_values.fleetno,
            )
        else:
            veh_contract_exp_table_query = sql.SQL(
                """COPY(
            SELECT division, vehiclereg,fleet_no, branch,  veh_type_map, contract_end, contract_type, contract_start, months_remaining, modified_contract_start_date
            FROM fleet.fleetlist
            WHERE date_trunc('month', contract_end::timestamp) = date_trunc('month', {month}::timestamp)
            and vehiclereg = any({registrations}) and fleet_no = any({fleetno})  
        ) TO STDOUT WITH CSV HEADER """
            ).format(     
              month=form_values.month,
              registrations=form_values.registrations,
              fleetno=form_values.fleetno,
            )

        response = exc_qrs_get_dfs_raw([veh_contract_exp_table_query])[0].to_dict("records")
        print(response)
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response

@expirations_page_router.post(
    "/get_vehicle_licence_expirations",
    description="get vehicles licence expirations",
   
)
def get_vehicle_licence_expirations(formValues: dict, user: dict = Depends(validate_token)):
    try:

        form_values = FormValues(formValues)    

        veh_lic_exp_query = sql.SQL(
            """COPY(
                        select division, branch, vehiclereg,fleet_no, description, date_of_first_reg, veh_lic_exp FROM fleet.fleetlist
                        where vehiclereg = any({registrations})  and fleet_no = any({fleetno})    
                                    order by veh_lic_exp asc
        ) TO STDOUT WITH CSV HEADER """
        ).format(              registrations=form_values.registrations,
              fleetno=form_values.fleetno,)

        response = exc_qrs_get_dfs_raw([veh_lic_exp_query])[0].to_dict("records")
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response

@expirations_page_router.post(
    "/get_vehicle_contract_expirations",
    description="get vehicles contract expirations",
   
)
def get_vehicle_contract_expirations(formValues: dict, user: dict = Depends(validate_token)):
    try:

        form_values = FormValues(formValues)
        veh_contr_exp_query = sql.SQL(
                    """COPY(
            select division, branch, vehiclereg,fleet_no, months_remaining, contract_start, contract_end,contract_type, modified_contract_start_date from fleet.fleetlist
            where vehiclereg = any({registrations})  
        
                ) TO STDOUT WITH CSV HEADER """
        ).format(
             registrations=form_values.registrations,
              fleetno=form_values.fleetno,        )


        df = exc_qrs_get_dfs_raw([veh_contr_exp_query])[0]        
        today = datetime.now()
        df['progress'] = ((today - pd.to_datetime(df['contract_start'])) / (pd.to_datetime(df['contract_end']) - pd.to_datetime(df['contract_start']))) * 100
        df['progress'] = df['progress'].astype(str)      

        response = df.to_dict("records")       

    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response
 



