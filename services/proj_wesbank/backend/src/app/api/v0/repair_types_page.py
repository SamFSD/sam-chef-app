from fastapi import APIRouter, HTTPException, Depends
import traceback
from .db_config import exc_qrs_get_dfs_raw
from psycopg2 import sql
import traceback
from .form_class import FormValues
from .auth import validate_token

repair_router = APIRouter()


@repair_router.post(
    "/get_repair_types_data",
    description="Get Repair Types Data",
)
def get_repair_types_data(formValues: dict, user: dict = Depends(validate_token)):
    try:
        formValues = FormValues(formValues)
        repai_types_top_row = sql.SQL(
            """COPY(
                select 
                    distinct repair_type as repair_types,
                    count(repair_type) as repair_counts,
                    sum(amount) as repair_value
                FROM 
                    fleet.maintenance
                 WHERE 
                    vehiclereg = ANY({reg})
                AND 
                    julian_month BETWEEN ({jul_from}) AND ({jul_to})
                group by 
                    repair_type
                    )TO STDOUT WITH CSV HEADER"""
        ).format(
            reg=formValues.registrations,
            jul_from=formValues.julStartMonth,
            jul_to=formValues.julEndMonth,
          
        )
        response = exc_qrs_get_dfs_raw([repai_types_top_row])[0]
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    # graph_monthly_lease_df = graph_df[[ "month"]].values.tolist()
    response_repair_counts_top_df = response[['repair_counts' ]].values.tolist()
    response_repair_value_top_df = response[['repair_value' ]].values.tolist()    
    response_repair_types_top_df = response[['repair_types' ]].values.tolist()

    return_data = {
        "repair_type_top": []
    }
    icon_mapping = {
    "Accident": "fa-car-crash",
    "Breakdown": "fa-tools",
    "Full Maintenance Lease without Tyres": "fa-wrench",
    "Managed Maintenance": "fa-cogs",
    "R&M": "fa-tools"
    }

    for repair_type, repair_count,repair_value in zip(response_repair_types_top_df, response_repair_counts_top_df,response_repair_value_top_df):
        return_data["repair_type_top"].append({
            "title": repair_type[0],  
            "icon": icon_mapping.get(repair_type[0], "fa-question"),  
            "repairs": repair_type[0],  
            "count": repair_count[0],
            "value": repair_value[0]    
        })
    return return_data

@repair_router.post('/get_spend_per_supplier_category', description="Get Spend Per Supplier Per Category")
def get_spend_per_supplier_category(formValues: dict, user: dict = Depends(validate_token)):
    try:
        formValues = FormValues(formValues)
        query = sql.SQL(
                """COPY(
                    SELECT
                        serviceprovider,
                        SUM(CASE WHEN REPAIR_TYPE = 'Accident' THEN amount ELSE 0 END) AS "Accident",
                        SUM(CASE WHEN REPAIR_TYPE = 'R&M' THEN amount ELSE 0 END) AS "R&M",
                        SUM(CASE WHEN REPAIR_TYPE = 'Breakdown' THEN amount ELSE 0 END) AS "Breakdowns",
                        SUM(CASE WHEN REPAIR_TYPE = 'Unknown' THEN amount ELSE 0 END) AS "Unknown"
                    FROM
                        fleet.maintenance
                    WHERE 
                        vehiclereg = ANY({reg})
                        AND julian_month BETWEEN ({jul_from}) AND ({jul_to})
                    GROUP BY
                        serviceprovider
                    )TO STDOUT WITH CSV HEADER"""
        ).format(
            reg=formValues.registrations,
            jul_from=formValues.julStartMonth,
            jul_to=formValues.julEndMonth,
          
        )
        
        
        response = exc_qrs_get_dfs_raw([query])[0].to_dict("records")        
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    print(response)
    return response

@repair_router.post('/get_cpk_per_model', description="Get CPK Per Model")
def get_cpk_per_model(formValues: dict):
    try:
        formValues = FormValues(formValues)
        query = sql.SQL(
            """COPY(
                SELECT 
                    veh_type_map, veh_model_map,
                    SUM(distance) AS total_distance, 
                    SUM(fuel_cost) AS total_fuel_cost, 
                    SUM(toll_cost) AS total_toll_cost,

                    SUM(unknown_repair_type_cost) AS total_unknown_cost, 
                    SUM(rm_cost) AS total_rm_cost, 
                    SUM(bd_cost) AS total_breakdown_cost, 
                    SUM(acc_cost) AS total_accidents_cost, 

                    ROUND(AVG(unknown_repair_type_cpk), 2) AS unknown_cpk,
                    ROUND(AVG(rm_cpk), 2) AS rm_cpk,
                    ROUND(AVG(bd_cpk), 2) AS breakdown_cpk,
                    ROUND(AVG(acc_cpk), 2) AS accidents_cpk

                FROM 
                    fleet.var_cost_per_month
                WHERE
                    vehiclereg = ANY({reg})
                    AND julian_month BETWEEN ({jul_from}) AND ({jul_to})
                GROUP BY 
                    veh_type_map,
                    veh_model_map
                    )TO STDOUT WITH CSV HEADER"""
        ).format(
            reg=formValues.registrations,
            jul_from=formValues.julStartMonth,
            jul_to=formValues.julEndMonth,
        )
        
        response = exc_qrs_get_dfs_raw([query])[0].replace("", 0).fillna(0).to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")

    return response


@repair_router.post(
    "/get_repair_types_and_counts_for_the_past_12_month",
    description="Get Repair Types Data for the past 122 month",
)
def get_repair_types_and_counts_for_the_past_12_month(formValues: dict, user: dict = Depends(validate_token)):
    try:
        formValues = FormValues(formValues)
        repai_types_top_row = sql.SQL(
            """COPY(
                SELECT 
                    to_char(date_trunc('month', transdate), 'Mon') AS month,
                    repair_type AS repair_types,
                    COUNT(repair_type) AS repair_counts,
                    sum(amount) as total_amount
                FROM 
                    fleet.maintenance
                WHERE 
                    transdate >= date_trunc('month', current_date - interval '12 months')
                GROUP BY 
                    month,
                    repair_type
                ORDER BY 
                    repair_type,
                    MIN(EXTRACT(MONTH FROM transdate))
                    )TO STDOUT WITH CSV HEADER"""
        ).format(          
          
        )
        response = exc_qrs_get_dfs_raw([repai_types_top_row])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response

@repair_router.post('/get_cpk_per_model_type', description="Get CPK Per Model and Per Type")
def get_cpk_per_model_type (formValues: dict, user: dict = Depends(validate_token)):

    formValues = FormValues(formValues)
    query = sql.SQL("""COPY(
                    WITH TM AS (
                        SELECT
                            VEH_TYPE_MAP,
                            JULIAN_MONTH,
                            SUM(DISTANCE) AS DISTANCE,
                            SUM(FUEL_COST) AS FUEL_COST,
                            SUM(TOLL_COST) AS TOLL_COST,
                            SUM(unknown_repair_type_cost) as UNKNOWN_COST,
                            SUM(RM_COST) AS RM_COST,
                            SUM(BD_COST) AS BD_COST,
                            SUM(ACC_COST) AS ACC_COST,
                            SUM(UNKNOWN_REPAIR_TYPE_COST) AS UNKNOWN_REPAIR_TYPE_COST,
                            SUM(OTHER_FC_COST) AS OTHER_FC_COST
                        FROM
                            FLEET.VAR_COST_PER_MONTH
                        WHERE
                            JULIAN_MONTH BETWEEN {jul_start} AND {jul_end}
                            AND vehiclereg = ANY({reg})
                        GROUP BY
                            VEH_TYPE_MAP,
                            JULIAN_MONTH
                    )
                SELECT
                    VEH_TYPE_MAP,
                    JULIAN_MONTH,
                    DISTANCE,
                    FUEL_COST,
                    COALESCE(((FUEL_COST / NULLIF(DISTANCE, 0)) * 100), 0) AS FUEL_CPK,
                    TOLL_COST,
                    COALESCE(((TOLL_COST / NULLIF(DISTANCE, 0)) * 100), 0) AS TOLL_CPK,
                    RM_COST,
                    COALESCE(((RM_COST / NULLIF(DISTANCE, 0)) * 100), 0) AS RM_CPK,
                    BD_COST,
                    COALESCE(((BD_COST / NULLIF(DISTANCE, 0)) * 100), 0) AS BD_CPK,
                    ACC_COST,
                    COALESCE(((ACC_COST / NULLIF(DISTANCE, 0)) * 100), 0) AS ACC_CPK,
                    UNKNOWN_REPAIR_TYPE_COST,
                    COALESCE(
                        (
                            (UNKNOWN_REPAIR_TYPE_COST / NULLIF(DISTANCE, 0)) * 100
                        ),
                        0
                    ) AS UNKNOWN_REPAIR_TYPE_CPK,
                    OTHER_FC_COST,
                    COALESCE(((OTHER_FC_COST / NULLIF(DISTANCE, 0)) * 100), 0) AS OTHER_FC_CPK
                FROM tm
    ) TO STDOUT WITH CSV HEADER""").format(
        reg=formValues.registrations,
        jul_start=formValues.julStartMonth,
        jul_end=formValues.julEndMonth,
    )
    try:
        response = exc_qrs_get_dfs_raw([query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response