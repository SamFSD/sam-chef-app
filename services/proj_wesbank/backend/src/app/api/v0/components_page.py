from fastapi import APIRouter, HTTPException, Depends
import traceback
from .db_config import exc_qrs_get_dfs_raw
from psycopg2 import sql
import traceback
from .form_class import FormValues
from .auth import validate_token

components_router = APIRouter()


@components_router.post(
    "/sho002_spend_per_month_per_component_graph",
    description="Get spend per month",
)
def sho002_spend_per_month_per_component(formValues: dict, user: dict = Depends(validate_token)):
    try:
        formValues = FormValues(formValues)
        monthlyCost_query = sql.SQL(
            """COPY(
                SELECT 
                    julian_month as month,
                    sum(amount) as monthly_cost
                FROM fleet.maintenance                    

                WHERE  
                    julian_month >= date_trunc ('month', current_date - interval '12 months')
            
                AND 
                    vehiclereg = any({registrations})  
                AND 
                    mapping = any({components}) 
                ---
                AND 
                    invoice_status <> 'invoice_exception'
                ---
                GROUP BY 
                    julian_month
                    )TO STDOUT WITH CSV HEADER"""
        ).format(
            registrations=formValues.registrations,
            components=formValues.components
        )
        response = exc_qrs_get_dfs_raw([monthlyCost_query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response


@components_router.post(
    "/sho002_least_assets_costs_per_component",
    description="Get the bottom vehicles cost per component",
)
def sho002_least_assets_costs_per_component(
    formValues: dict, user: dict = Depends(validate_token)
):
    try:
        form_values = FormValues(formValues)
        component_query = sql.SQL(
            """COPY(
                SELECT
                    maintenance.vehiclereg,
                    SUM(amount) AS cost,
                    COUNT(amount) AS repair_count,
                    COALESCE(dist.distance, 0) AS distance,
                    COALESCE(ROUND(SUM(amount) / NULLIF(dist.distance, 0), 2), 0) AS component_cpk
                FROM
                    fleet.maintenance
                LEFT JOIN (
                    SELECT
                        vehiclereg,
                        SUM(distance) AS distance
                    FROM
                        fleet.trip_data_daily
                    WHERE
                        (julian_month BETWEEN {julian_from} AND {julian_to} )
                        AND distance > 0
                    GROUP BY
                        vehiclereg
                ) dist ON dist.vehiclereg = maintenance.vehiclereg
                WHERE
                    maintenance.vehiclereg = any({registrations})  
                    and mapping = any({components}) and
                    (julian_month BETWEEN {julian_from} AND {julian_to} )
                GROUP BY
                    maintenance.vehiclereg, dist.distance
                having sum(amount) > 0
                ORDER BY
                    cost ASC
                LIMIT 8
                    ) TO STDOUT WITH CSV HEADER """
        ).format(
            julian_from=form_values.julStartMonth,
            julian_to=form_values.julEndMonth,
            registrations=form_values.registrations,
            components=form_values.components,
        )

        response = exc_qrs_get_dfs_raw([component_query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response



@components_router.post(
    "/sho002_get_total_counts_and_costs_for_completed_accrual_orderExcep_and_invoiceExcep",
    description="get total counts and costs for completed accrual, order exceptions and invoice exceptions",
)
def sho002_get_total_counts_and_costs_for_completed_accrual_orderExcept_and_invoiceExcept(
    formValues: dict, user: dict = Depends(validate_token)
):
    try:
        form_values = FormValues(formValues)
        total_counts_and_costs_query = sql.SQL(
            """COPY(
            with FilteredVehicles as (
            select vehiclereg from fleet.fleetlist where
            vehiclereg = any({registrations})  
            --to handle multi orders (man on site etc)
            --or lower(vehiclereg) = 'various'
            --or vehiclereg = '#N/A'
        )
            SELECT 
                SUM(CASE WHEN invoice_status = 'completed' THEN amount ELSE 0 END) AS completed_invoice,
                SUM(CASE WHEN invoice_status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
                SUM(CASE WHEN invoice_status = 'invoice_exception' THEN amount ELSE 0 END) AS invoice_exception,
                SUM(CASE WHEN invoice_status = 'invoice_exception' THEN 1 ELSE 0 END) AS invoice_exception_count,
                SUM(CASE WHEN invoice_status = 'accrual' THEN amount ELSE 0 END) AS accruals,
                SUM(CASE WHEN invoice_status = 'accrual' THEN 1 ELSE 0 END) AS accruals_count,        
                (SELECT 
                    SUM(CASE WHEN order_status = 'order_exception' THEN amount ELSE 0 END)	 
                FROM fleet.orders
                where (julian_month BETWEEN {julian_from} AND {julian_to} )and vehiclereg in (select vehiclereg from FilteredVehicles)
                ) AS orders_exception
                ,
                (SELECT 
                    SUM(CASE WHEN order_status = 'order_exception' THEN 1 ELSE 0 END)	 
                FROM fleet.orders
                where (julian_month BETWEEN {julian_from} AND {julian_to} )and vehiclereg in (select vehiclereg from FilteredVehicles))
                AS orders_exception_count,
                        (
                    SELECT SUM(invoice_diff) AS invoice_difference
                    FROM fleet.orders
                    WHERE  (julian_month BETWEEN {julian_from} AND {julian_to} )and vehiclereg IN (SELECT vehiclereg FROM FilteredVehicles)
                ) AS invoice_difference,
                (
                    SELECT COUNT(vehiclereg) AS vehicle_count
                    FROM fleet.orders
                    WHERE  (julian_month BETWEEN {julian_from} AND {julian_to} )and vehiclereg IN (SELECT vehiclereg FROM FilteredVehicles)
                ) AS invoice_difference_count
                        FROM fleet.maintenance

            where (julian_month BETWEEN {julian_from} AND {julian_to} )and vehiclereg in (select vehiclereg from FilteredVehicles)
            )TO STDOUT WITH CSV HEADER"""
        ).format(
            julian_from=form_values.julStartMonth,
            julian_to=form_values.julEndMonth,
            registrations=form_values.registrations,
        )

        response = (
            exc_qrs_get_dfs_raw([total_counts_and_costs_query])[0]
            .replace("", 0)
            .fillna(0)
            .to_dict("records")
        )
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response
@components_router.post(
    "/sho002_get_inv_by_component",
    description="get inv by component",
)
def sho002_get_inv_by_component(
    formValues: dict, user: dict = Depends(validate_token)
):
    try:
        form_values = FormValues(formValues)
        inv_query = sql.SQL(
            """COPY(
    select serviceprovider, order_no, transdate, veh_type_map, amount, savings, savings_reason, vehiclereg, veh_model_map, veh_make_map, mapping, invoice_no  from fleet.maintenance
    where  julian_month BETWEEN {julian_from} AND {julian_to}
                    and vehiclereg = any({registrations})  
                    and mapping = any({components}) 
        order by transdate desc
        
        ) TO STDOUT WITH CSV HEADER"""
        ).format(
            julian_from=form_values.julStartMonth,
            julian_to=form_values.julEndMonth,
            registrations=form_values.registrations,
            components=form_values.components,
        )  # invoice by component
        response = exc_qrs_get_dfs_raw([inv_query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response
@components_router.post(
    "/sho002_get_maintenance_cost_over_odo",
    description="get maintenance maps",
)
def sho002_get_maintenance_cost_over_odo(
    formValues: dict, user: dict = Depends(validate_token)
):
    try:
        form_values = FormValues(formValues)
        odo_scatter_query = sql.SQL(
            """COPY(
                    SELECT work_order_distance, mapping, amount, vehiclereg, veh_make_map, veh_model_map, serviceprovider from fleet.maintenance
                    WHERE 
                    julian_month BETWEEN {julian_from} AND {julian_to}
                    and vehiclereg = any({registrations})  
                    and mapping = any({components}) 
                    and work_order_distance::numeric <= 2000000
                    and work_order_distance::numeric >= 1000
                    ORDER BY work_order_distance
        )TO STDOUT WITH CSV HEADER """
        ).format(
            julian_from=form_values.julStartMonth,
            julian_to=form_values.julEndMonth,
            registrations=form_values.registrations,
            components=form_values.components,
        )
        response = exc_qrs_get_dfs_raw([odo_scatter_query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response
@components_router.post(
    "sho002_get_total_spend_veh_type",
    description="get total spend per vehicle type",
)
def sho002_get_total_spend_per_veh_type(
    formValues: dict, user: dict = Depends(validate_token)
):
    try:
        form_values = FormValues(formValues)
        vehicle_query = sql.SQL(
            """COPY(    SELECT veh_type_map, SUM(amount) as costs
                            FROM fleet.maintenance
                            WHERE julian_month BETWEEN {julian_from} AND {julian_to}
                    and vehiclereg = any({registrations})  
                    and mapping = any({components})                                
                            GROUP BY veh_type_map
                            order by costs asc   ) TO STDOUT WITH CSV HEADER """
        ).format(
            julian_from=form_values.julStartMonth,
            julian_to=form_values.julEndMonth,
            registrations=form_values.registrations,
            components=form_values.components,
        )

        response = exc_qrs_get_dfs_raw([vehicle_query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response
# check components in maitenance table
@components_router.post(
    "sho002_get_total_spend_per_supplier",
    description="get total spend per supplier",
)
def sho002_get_total_spend_per_supplier(
    formValues: dict, user: dict = Depends(validate_token)
):
    try:
        form_values = FormValues(formValues)

        supplier_query = sql.SQL(
            """COPY(
                            SELECT serviceprovider, SUM(amount) as costs
                            FROM fleet.maintenance 
                            WHERE vehiclereg = any({registrations})  
                        and mapping = any({components}) 
                            and (julian_month BETWEEN {julian_from} AND {julian_to} )        
                            GROUP BY serviceprovider   
                            order by costs asc 
                                            
                        )TO STDOUT WITH CSV HEADER """
        ).format(
            julian_from=form_values.julStartMonth,
            julian_to=form_values.julEndMonth,
            registrations=form_values.registrations,
            components=form_values.components,
        )

        response = exc_qrs_get_dfs_raw([supplier_query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response
@components_router.post(
    "/sho002_best_assets_costs_per_component",
    description="Get the bottom vehicles cost per component",
)
def sho002_best_assets_costs_per_component(
    formValues: dict, user: dict = Depends(validate_token)
):
    try:
        form_values = FormValues(formValues)
        component_query = sql.SQL(
            """COPY(
                SELECT
                    maintenance.vehiclereg,
                    SUM(amount) AS cost,
                    COUNT(amount) AS repair_count,
                    COALESCE(dist.distance, 0) AS distance,
                    COALESCE(ROUND(SUM(amount) / NULLIF(dist.distance, 0), 2), 0) AS component_cpk
                FROM
                    fleet.maintenance
                LEFT JOIN (
                    SELECT
                        vehiclereg,
                        SUM(distance) AS distance
                    FROM
                        fleet.trip_data_daily
                    WHERE
                        (julian_month BETWEEN {julian_from} AND {julian_to} )
                        AND distance > 0
                    GROUP BY
                        vehiclereg
                ) dist ON dist.vehiclereg = maintenance.vehiclereg
                WHERE
                    maintenance.vehiclereg = any({registrations})  
                    and mapping = any({components}) and
                    (julian_month BETWEEN {julian_from} AND {julian_to} )
                GROUP BY
                    maintenance.vehiclereg, dist.distance
                ORDER BY
                    cost DESC
                LIMIT 8
                    ) TO STDOUT WITH CSV HEADER """
        ).format(
            julian_from=form_values.julStartMonth,
            julian_to=form_values.julEndMonth,
            registrations=form_values.registrations,
            components=form_values.components,
        )

        response = exc_qrs_get_dfs_raw([component_query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response
