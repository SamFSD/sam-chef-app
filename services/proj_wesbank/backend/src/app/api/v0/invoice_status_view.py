import traceback
from fastapi import APIRouter,HTTPException, Depends
from .db_config import exc_qrs_get_dfs_raw
from psycopg2 import sql
import pandas as pd
from .auth import validate_token

invoice_status = APIRouter()

@invoice_status.post(
    "/sho002_get_tables_invoice_status_orders_excep",
    description="get tables invoice status orders excep",

)
def sho002_get_tables_invoice_status_orders_excep(formValues: dict, user: dict = Depends(validate_token)):
    try:
        registrations = list(map(lambda x: x["vehiclereg"], formValues["registrations"]))
        julian_from = formValues['julStartMonth']
        julian_to = formValues['julEndMonth']

        # Took vehicle_type_map out, it's all kinds of fucked. If we need it, we can left join from fleetlist
        invoices_table_query = sql.SQL(
            """COPY(
                select   
                    date,
                    fleet_no, 
                    order_no, 
                    invoice_amount as savings, 
                    amount,invoice_diff as invoice_difference,
                    vehiclereg, 
                    service_provider, 
                    odo, 
                    mapping, 
                    description,
                    order_status
                from fleet.orders
                    where 
                        order_status = 'order_exception' 
                    and 
                        (julian_month BETWEEN {julian_from} AND {julian_to})
                    and 
                        vehiclereg = any({registrations})
                    --order exceptions                                   
                            ) TO STDOUT WITH CSV HEADER"""
        ).format(
            julian_from=sql.Literal(julian_from),
            julian_to=sql.Literal(julian_to),
            registrations=sql.Literal(registrations),
        )

        response = exc_qrs_get_dfs_raw([invoices_table_query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response


@invoice_status.post(
    "sho002_get_invoice_difference",
    description="Get invoice difference",
  
)
def sho002_get_invoice_difference(formValues: dict, user: dict = Depends(validate_token)):
    try:
        registrations = list(map(lambda x: x["vehiclereg"], formValues["registrations"]))
        julian_from = formValues['julStartMonth']
        julian_to = formValues['julEndMonth']
        invoice_diff_query = sql.SQL(
            """COPY(                      
                SELECT  
                    SUM(invoice_diff) AS invoice_difference, 
                    count(vehiclereg) as vehicle_count
                FROM
                    fleet.orders
                    WHERE
                        (julian_month BETWEEN {julian_from} AND {julian_to})  
                    AND
                        vehiclereg = any({registrations})                   
        )TO STDOUT WITH CSV HEADER """
        ).format(
            julian_from=sql.Literal(julian_from),
            julian_to=sql.Literal(julian_to),
            registrations=sql.Literal(registrations),
        )

        response = (
            exc_qrs_get_dfs_raw([invoice_diff_query])[0]
            .fillna(0)
            .replace("", 0)
            .to_dict("records")
        )
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response

@invoice_status.post(
    "/sho002_get_tables_invoice_status_completed_invoices",
    description="get tables invoice status completed invoices",

)
def sho002_get_tables_invoice_status_completed_invoices(formValues: dict, user: dict = Depends(validate_token)):
    try:
        registrations = list(map(lambda x: x["vehiclereg"], formValues["registrations"]))
        julian_from = formValues['julStartMonth']
        julian_to = formValues['julEndMonth']

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
                and 
                (m.julian_month BETWEEN {julian_from} AND {julian_to})
                and m.vehiclereg = any({registrations})  
                                    ) TO STDOUT WITH CSV HEADER"""
        ).format(
            julian_from=sql.Literal(julian_from),
            julian_to=sql.Literal(julian_to),
            registrations=sql.Literal(registrations),
        )
        response = exc_qrs_get_dfs_raw([invoices_table_query])[0]
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response.to_dict("records")

@invoice_status.post(
    "/sho002_get_tables_invoice_status_accrual_invoices",
    description="get tables invoice status accrual invoices",

)
def sho002_get_tables_invoice_status_accrual_invoices(formValues: dict, user: dict = Depends(validate_token)):
    try:
        registrations = list(map(lambda x: x["vehiclereg"], formValues["registrations"]))
        julian_from = formValues['julStartMonth']
        julian_to = formValues['julEndMonth']

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
                AND 
                    (m.julian_month BETWEEN {julian_from} AND {julian_to})
                and 
                    m.vehiclereg = any({registrations})  
                        ) TO STDOUT WITH CSV HEADER"""
        ).format(
            julian_from=sql.Literal(julian_from),
            julian_to=sql.Literal(julian_to),
            registrations=sql.Literal(registrations),
        )

        response = exc_qrs_get_dfs_raw([invoices_table_query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response


@invoice_status.post(
    "sho002_get_unassigned_orders",
    description="Get unassigned orders",
  
)
def sho002_get_unassigned_orders(formValues: dict, user: dict = Depends(validate_token)):
    try:
        julian_from = formValues['julStartMonth']
        julian_to = formValues['julEndMonth']
        unassigned_query = sql.SQL(
            """COPY(
                    SELECT 
                        *
                    FROM fleet.orders                            
                        WHERE 
                            vehiclereg NOT IN (SELECT vehiclereg FROM fleet.fleetlist) 
                        and  
                            (julian_month BETWEEN {julian_from} AND {julian_to})                                
                    )TO STDOUT WITH CSV HEADER """
        ).format(
            julian_from=sql.Literal(julian_from),
            julian_to=sql.Literal(julian_to),
        )

        response = exc_qrs_get_dfs_raw([unassigned_query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response

@invoice_status.post(
    "/sho002_get_tables_invoice_status_invoice_excep",
    description="get tables invoice status invoice excep",

)
def sho002_get_tables_invoice_status_invoices_excep(formValues: dict, user: dict = Depends(validate_token)):
    try:
        registrations = list(map(lambda x: x["vehiclereg"], formValues["registrations"]))
        julian_from = formValues['julStartMonth']
        julian_to = formValues['julEndMonth']

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
                m.vehiclereg = any({registrations}) 
                                    ) TO STDOUT WITH CSV HEADER"""
        ).format(
        julian_from=sql.Literal(julian_from),
        julian_to=sql.Literal(julian_to),
            registrations=sql.Literal(registrations),
        )
        response = exc_qrs_get_dfs_raw([invoices_table_query])[0]
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response.to_dict("records")

@invoice_status.post(
    "/sho002_get_invoice_status_sankey",
    description="Sankey of suppliers invoice status",

)
def sho002_get_invoice_status_sankey(formValues: dict, user: dict = Depends(validate_token)):
    try:

        julian_from = formValues['julStartMonth']
        julian_to = formValues['julEndMonth']

        invoices_table_query = sql.SQL(
            """COPY(
                    SELECT 
        COALESCE(maintenance.serviceprovider, a.service_provider) AS supplier_or_provider,
        SUM(amount) AS completed,
        COALESCE(a.order_exception_cost, 0) AS order_exception_cost,
        COALESCE(b.accruals, 0) AS accruals,
        COALESCE(c.invoice_exception_cost, 0) AS invoice_exception_cost
    FROM 
        fleet.maintenance 
    FULL OUTER JOIN (
        SELECT 
            service_provider, 
            SUM(amount) AS order_exception_cost 
        FROM 
            fleet.orders 
        WHERE 
            order_no NOT IN (SELECT order_no FROM fleet.maintenance) 
        and julian_month BETWEEN {julian_from} AND {julian_to} 
        GROUP BY 
            service_provider
    ) AS a ON a.service_provider = maintenance.serviceprovider
    FULL OUTER JOIN (
        SELECT 
            serviceprovider,
            SUM(amount) AS accruals
        FROM 
            fleet.maintenance 
        WHERE 
            invoice_no = 'not_invoiced'
        and julian_month BETWEEN {julian_from} AND {julian_to} 
        GROUP BY 
            serviceprovider
    ) AS b ON b.serviceprovider = COALESCE(maintenance.serviceprovider, a.service_provider)
    FULL OUTER JOIN (
        SELECT 
            maintenance.serviceprovider,
            SUM(amount) AS invoice_exception_cost
        FROM 
            fleet.maintenance 
        WHERE 
            order_no NOT IN (SELECT order_no FROM fleet.orders)
        and julian_month BETWEEN {julian_from} AND {julian_to} 
        GROUP BY 
            maintenance.serviceprovider
    ) AS c ON c.serviceprovider = COALESCE(maintenance.serviceprovider, a.service_provider)
    FULL OUTER JOIN (
        SELECT DISTINCT service_provider
        FROM fleet.orders
        where julian_month BETWEEN {julian_from} AND {julian_to} 
    ) AS s ON COALESCE(maintenance.serviceprovider, a.service_provider) = s.service_provider
    WHERE 
        invoice_no <> 'not_invoiced'
        and julian_month BETWEEN {julian_from} AND {julian_to} 
    GROUP BY 
        supplier_or_provider, a.order_exception_cost, b.accruals, c.invoice_exception_cost

                            ) TO STDOUT WITH CSV HEADER"""
        ).format(
                 julian_from=sql.Literal(julian_from),
        julian_to=sql.Literal(julian_to),
        )
        df = exc_qrs_get_dfs_raw([invoices_table_query])[0]

        # //create nodes
        invoice_columns = [
            "completed",
            "order_exception_cost",
            "accruals",
            "invoice_exception_cost",
        ]
        supplier_nodes = df["supplier_or_provider"].tolist()

        nodes = [{"name": column, "level": 0} for column in invoice_columns] + [
            {"name": supplier, "level": 1} for supplier in supplier_nodes
        ]
        # create data set
        links = []
        inv_types = [
            "completed",
            "order_exception_cost",
            "accruals",
            "invoice_exception_cost",
        ]
        for _, row in df.iterrows():
            for node in inv_types:
                value = row[node]
                if value != 0:
                    links.append(
                        {
                            "source": row["supplier_or_provider"],
                            "target": node,
                            "value": value,
                        }
                    )

        # Create the Sankey chart dataframe
        sankey_df = pd.DataFrame(links)
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return {"nodes": nodes, "data": sankey_df.to_dict("records")}
