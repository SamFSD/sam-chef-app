from fastapi import APIRouter, HTTPException, Depends
import traceback
from .db_config import exc_qrs_get_dfs_raw
from psycopg2 import sql
from loguru import logger
import pandas as pd
from .form_class import FormValues
from datetime import datetime
from .auth import validate_token

fuel_card_router = APIRouter()


############# use this queri to test the data fronend page ##############

@fuel_card_router.post('/fuel_spend_per_cat', description='fuel spend per cat')
def fuel_spend_per_cat(formValues: dict, user: dict = Depends(validate_token)):
    form = FormValues(formValues)
     
    trans = sql.SQL("""
            COPY(
                SELECT 
                    CASE 
                        WHEN transaction_type = 'TOLL' THEN 'TOLL'
                        WHEN transaction_type = 'OIL' THEN 'OIL'
                        WHEN transaction_type = 'REPAIRS' THEN 'REPAIRS'
                        WHEN transaction_type = 'FUEL' THEN 'FUEL'
                        ELSE 'OTHER'
                    END AS purchase_category,
                    SUM(transaction_cost) AS transaction_cost,
                    division,
                    branch,
                    vendor,
                    SUM(litres) AS litres         
                FROM 
                    fleet.fleet_card
                WHERE
                    vehiclereg = ANY({reg})
                    AND julian_month BETWEEN {jul_start} AND {jul_end}
                GROUP BY 
                    division,
                    branch,
                    vendor,
                    purchase_category
                ) TO STDOUT WITH CSV HEADER""").format(
                    reg=form.registrations,
                    jul_start=form.julStartMonth,
                    jul_end=form.julEndMonth,
                )
    
    monthly_sum = sql.SQL("""
            COPY(
                SELECT
                    to_char(date_trunc('month', FC.JULIAN_MONTH), 'Mon') AS month,
                    CASE 
                        WHEN transaction_type = 'TOLL' THEN 'TOLL'
                        WHEN transaction_type = 'OIL' THEN 'OIL'
                        WHEN transaction_type = 'REPAIRS' THEN 'REPAIRS'
                        WHEN transaction_type = 'FUEL' THEN 'FUEL'
                        ELSE 'OTHER'
                    END AS purchase_category,                   
                    
                    sum(transaction_cost) as total_cost
                FROM
                    fleet.fleet_card fc

               WHERE
                    FC.JULIAN_MONTH >= date_trunc('month', current_date) - interval '11 months'
               GROUP BY 
                     month,
                    transaction_type
                ORDER BY 
                       MIN(EXTRACT(MONTH FROM FC.JULIAN_MONTH))
                
                ) TO STDOUT WITH CSV HEADER""").format(
                  
                )
    try:
        response = exc_qrs_get_dfs_raw([trans,monthly_sum])
        transactions = response[0].to_dict("records")
        monthly_data = response[1].to_dict("records")
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return {
        "transaction": transactions,
        "monthly_data":monthly_data
    }

@fuel_card_router.post('/fuel_card_and_fuel_data', description='fuel card and fuel spend data')
def fuel_card_and_fuel_data(formValues: dict, user: dict = Depends(validate_token)):
    
    def buildObject(transactions: list[dict], top_vehicles: list[dict]):

        result = []

        for i in range(len(transactions)):
            if transactions[i]['purchase_category'] == 'fuel':
                result.append({
                    "title": "Fuel",
                    "value": transactions[i]['total_amount'],
                    "count": transactions[i]['transaction_count'],
                    "icon": "fa-gas-pump",
                    "highest_vehicle": {
                        "vehiclereg": top_vehicles[i]['vehiclereg'],
                        "value": top_vehicles[i]['total_amount'],
                        "count": top_vehicles[i]['transaction_count']
                }})
            elif transactions[i]['purchase_category'] == 'tolls':
                result.append({
                    "title": "Tolls",
                    "value": transactions[i]['total_amount'],
                    "count": transactions[i]['transaction_count'],
                    "icon": "fa-road",
                    "highest_vehicle": {
                        "vehiclereg": top_vehicles[i]['vehiclereg'],
                        "value": top_vehicles[i]['total_amount'],
                        "count": top_vehicles[i]['transaction_count']
                }})
            elif transactions[i]['purchase_category'] == 'oil':
                result.append({
                    "title": "Oil",
                    "value": transactions[i]['total_amount'],
                    "count": transactions[i]['transaction_count'],
                    "icon": "fa-oil-can",
                    "highest_vehicle": {
                        "vehiclereg": top_vehicles[i]['vehiclereg'],
                        "value": top_vehicles[i]['total_amount'],
                        "count": top_vehicles[i]['transaction_count']
                }})
            elif transactions[i]['purchase_category'] == 'repair':
                result.append({
                    "title": "Repairs",
                    "value": transactions[i]['total_amount'],
                    "count": transactions[i]['transaction_count'],
                    "icon": "fa-tools",
                    "highest_vehicle": {
                        "vehiclereg": top_vehicles[i]['vehiclereg'],
                        "value": top_vehicles[i]['total_amount'],
                        "count": top_vehicles[i]['transaction_count']
                }})
        return result
    
    try:

        form = FormValues(formValues)
        trans = sql.SQL("""
            COPY(
                SELECT 
                    CASE 
                        WHEN transaction_type = 'TOLL' THEN 'tolls'
                        WHEN transaction_type = 'OIL' THEN 'oil'
                        WHEN transaction_type = 'REPAIRS' THEN 'repairs'
                        WHEN transaction_type = 'FUEL' THEN 'fuel'
                        ELSE 'OTHER'
                    END AS purchase_category,
                    SUM(transaction_cost) AS total_amount,
                    COUNT(transaction_cost) AS transaction_count
                FROM 
                    fleet.fleet_card
                WHERE
                    vehiclereg = ANY({reg})
                    AND julian_month BETWEEN {jul_start} AND {jul_end}
                GROUP BY 
                    purchase_category
                ) TO STDOUT WITH CSV HEADER""").format(
                    reg=form.registrations,
                    jul_start=form.julStartMonth,
                    jul_end=form.julEndMonth,
                )
        
        top_veh = sql.SQL("""COPY(
            WITH ranked_rows AS (
                SELECT 
                    vehiclereg,
                    CASE 
                        WHEN transaction_type = 'TOLL' THEN 'tolls'
                        WHEN transaction_type = 'OIL' THEN 'oil'
                        WHEN transaction_type = 'REPAIRS' THEN 'repairs'
                        WHEN transaction_type = 'FUEL' THEN 'fuel'
                        ELSE 'OTHER'
                    END AS purchase_category,
                    SUM(transaction_cost) AS total_amount,
                    COUNT(transaction_cost) AS transaction_count,
                    ROW_NUMBER() OVER (PARTITION BY 
                                        CASE 
                                            WHEN transaction_type = 'TOLL' THEN 'tolls'
                                            WHEN transaction_type = 'OIL' THEN 'oil'
                                            WHEN transaction_type = 'REPAIRS' THEN 'repairs'
                                            WHEN transaction_type = 'FUEL' THEN 'fuel'
                                            ELSE 'OTHER'
                                        END 
                                        ORDER BY SUM(transaction_cost) DESC) AS row_num
                FROM 
                    fleet.fleet_card
                WHERE
                    vehiclereg = ANY({reg})
                    AND julian_month BETWEEN {jul_start} AND {jul_end}
                GROUP BY 
                    vehiclereg, transaction_type
            )
            SELECT 
                vehiclereg,
                purchase_category,
                total_amount,
                transaction_count
            FROM 
                ranked_rows
            WHERE 
                row_num = 1) TO STDOUT WITH CSV HEADER""").format(
                    reg=form.registrations,
                    jul_start=form.julStartMonth,
                    jul_end=form.julEndMonth,
                )
        results = exc_qrs_get_dfs_raw([trans, top_veh])
        transactions = results[0].to_dict("records")
        top_vehicles = results[1].to_dict("records")
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return buildObject(transactions, top_vehicles)

@fuel_card_router.post('/get_spend_cpk_cons', description="Get Spend CPK and Consumption Per Vehicle Type")
def get_spend_cpk_cons(formValues: dict, user: dict = Depends(validate_token)):
    
    formValues = FormValues(formValues)
    query = sql.SQL("""COPY(
     
          WITH TRANS AS (
            SELECT
                to_char(date_trunc('month',  JULIAN_MONTH), 'Mon') AS month,
                VEHICLEREG,
                JULIAN_MONTH,
                SUM(DISTANCE) AS DISTANCE,
                SUM(fuel_vol) AS LITRES,
                SUM(fuel_cost) AS COST
            FROM
                FLEET.var_cost_per_month
            WHERE
                JULIAN_MONTH BETWEEN {jul_from} AND {jul_to}
                AND VEHICLEREG = ANY({reg})
            GROUP BY
                month,
                VEH_TYPE_MAP,
                JULIAN_MONTH,
                VEHICLEREG                    
        )
        SELECT
            month,
            VEHICLEREG,
            JULIAN_MONTH,
            DISTANCE,
            LITRES,
            COST,
            (COST / NULLIF(DISTANCE, 0)) * 100 AS CPK,
            (LITRES / NULLIF(DISTANCE, 0)) * 100 AS CONSUMPTION
        FROM
            TRANS
        GROUP BY
            month,
            VEHICLEREG,
            JULIAN_MONTH,
            DISTANCE,
            LITRES,
            COST
        ORDER BY
            CPK DESC,
            CONSUMPTION DESC                   
       

    ) TO STDOUT WITH CSV HEADER""").format(
        reg=formValues.registrations,
        jul_from=formValues.julStartMonth,
        jul_to=formValues.julEndMonth,
    )

    try:
        response = exc_qrs_get_dfs_raw([query])[0].replace("", 0).fillna(0).to_dict("records")
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response


@fuel_card_router.post('/get_fc_transactions', description="Gets fleet card transactions (go figure)")
def get_fc_transactions(formValues: dict, user: dict = Depends(validate_token)):
    
    formValues = FormValues(formValues)
    query = sql.SQL("""COPY(
        SELECT
            vehiclereg,
            fleet_no,
            transaction_type,
            vendor,
            transaction_cost,
            litres,
            transaction_date,
            transaction_number
        FROM
            fleet.fleet_card
        WHERE
            julian_month BETWEEN {jul_from} AND {jul_to} 
            AND vehiclereg = ANY({reg})
    ) TO STDOUT WITH CSV HEADER""").format(
        reg=formValues.registrations,
        jul_from=formValues.julStartMonth,
        jul_to=formValues.julEndMonth,
    )

    try:
        response = exc_qrs_get_dfs_raw([query])[0].replace("", 0).fillna(0).to_dict("records")
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response