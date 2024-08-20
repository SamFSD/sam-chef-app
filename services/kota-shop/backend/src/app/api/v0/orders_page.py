from io import BytesIO
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
import io
import pandas as pd
from sqlite3 import IntegrityError
from typing import List
import json
from .helpers import (div_branch_filter_check,
                      put_dates_in_dumb_format,
                      fin_year_check)
import re
from .db_config import exc_qrs_get_dfs_raw, exec_query, return_connection
from .orders_logs import get_orders_logs
from psycopg2 import sql
from .form_class import ordersactionsclass
from datetime import datetime
import traceback
from .form_class import FormValues
from .auth import validate_token

orders_router = APIRouter()


@orders_router.get(
    "/sho002_get_external_shoprite_tnx_orders",
    description="Get external shoprite tnx orders",
  
)
def sho002_get_external_shoprite_tnx_orders(user: dict = Depends(validate_token)):
    try:
        query = sql.SQL(
            """COPY(
                    select * from fleet.orders_non_miles
                    where (order_status != 'deleted' OR order_status IS NULL)
                                                        
        )TO STDOUT WITH CSV HEADER """
        ).format()
        response = exc_qrs_get_dfs_raw([query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response

@orders_router.post(
    "/dl_orders_file",
    description="Downloads orders matching the KZN order file format",

)
def dl_orders_file(formValues: dict, user: dict = Depends(validate_token)):
    # try:
    form = FormValues(formValues)
    query = sql.SQL(
        """COPY(
                    SELECT quote_no, date AS quote_date, order_no, date AS order_date, service_provider, vehiclereg, fleet_no, odo, repair_type, description, amount
                    FROM fleet.orders
                    WHERE branch = {branch}
                    AND julian_month = {date}
                    ORDER BY order_no ASC
    )TO STDOUT WITH CSV HEADER
                    """
    ).format(branch=form.singleBranch, date=form.julMonth)

    results = put_dates_in_dumb_format(exc_qrs_get_dfs_raw([query])[0])
    csv = results.to_csv(index=False).encode("utf-8")

    content_disposition = 'attachment; filename="data.csv"'
    headers = {"Content-Disposition": content_disposition}
    # except Exception as e:
    #     print(f"An error occurred: {e}")
    #     raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")

    return Response(
        csv,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers,
    )


@orders_router.post(
    "/wesbank_order_file",
    description="Downloads Wesbank Orders",

)
def wesbank_order_files(formValues: dict, user: dict = Depends(validate_token)):
    try: 
        form = FormValues(formValues)       
    
        query = sql.SQL(
            """COPY(
                SELECT date as orders_date, order_no, invoice_no, quote_no, client_ref, 
                vehiclereg, odo, description, amount, service_provider, 
                division, branch, order_status, contract_type, repair_type, 
                mapping, invoice_amount, invoice_diff, fleet_no, veh_type_map
                FROM fleet.orders
                WHERE branch = {branch}
                AND (julian_month BETWEEN {julian_from} AND {julian_to} )
                ORDER BY order_no ASC
            ) TO STDOUT WITH CSV HEADER
            """
        ).format(branch=form.singleBranch, julian_from=form.julStartMonth,
            julian_to=form.julEndMonth,)
        results = put_dates_in_dumb_format(exc_qrs_get_dfs_raw([query])[0])

        # Write the DataFrame to an Excel file in memory
        output = BytesIO()
        with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
            results.to_excel(writer, index=False)
            # No need to call writer.save()

        output.seek(0)

        content_disposition = f'attachment; filename="data.xlsx"'
        headers = {"Content-Disposition": content_disposition}
    except Exception as e:
         print(f"An error occurred: {e}")
         raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")

    return Response(
        content=output.read(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers,
    )
@orders_router.get(
    "/sho002_get_fleet_no__for_orders_popup_form",
    description="Get fleet numbers based on selected branch",
  
)
def sho002_get_fleet_no__for_orders_popup_form(branch: str, user: dict = Depends(validate_token)):
    try:
        query = sql.SQL(
            """COPY(
                    select distinct fleet_no from fleet.fleetlist
                    where branch = {branch} 
                    order by fleet_no asc   
                                                        
        )TO STDOUT WITH CSV HEADER """
        ).format(branch=sql.Literal(branch))
        response = exc_qrs_get_dfs_raw([query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response


# orders page

@orders_router.get(
    "/get_vehicle_details_per_selected_branch",
    description="Get spefici vehicle info from fleetlist",
)
def get_vehicle_details_per_selected_branch(branch: str, user: dict = Depends(validate_token)):
    try:
        vehicle_query = sql.SQL(
            """COPY(
                        select veh_type_map, veh_model_map, contract_type, fleet_no, vehiclereg FROM fleet.fleetlist
                        where branch = {branch}
                                
        ) TO STDOUT WITH CSV HEADER """
        ).format(branch=sql.Literal(branch))

        response = exc_qrs_get_dfs_raw([vehicle_query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response



@orders_router.post(
    "/delete_from_fleet_orders",
    description="Deletes rows from fleet.orders from array of row objects returned from AG Grid",
)
def delete_from_fleetorders(order_nos: str, table: str, user: dict = Depends(validate_token)):
    try:        
        action = 'delete'
        query = (
            """
            UPDATE fleet.{table}
                SET 
                    amount = 0,
                    order_status = 'deleted'
            WHERE order_no = '{order_nos}'
            """
        ).format(order_nos=order_nos, table=table)
        query = sql.SQL(query)        
        get_orders_logs( order_nos, user['email'] ,prev_value=query, action=action)
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    exec_query(query)


@orders_router.get(
    "/repair_type_from_fleet_orders",
    description="repair type from fleet.orders",
)
def repair_type_from_fleet_orders(user: dict = Depends(validate_token)):
    try:
        query = sql.SQL(
            """COPY (SELECT * FROM fleet.order_repair_types
            ) TO STDOUT WITH CSV HEADER"""
        ).format()
        response = exc_qrs_get_dfs_raw([query])[0].to_dict("records")

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )
    return response


@orders_router.post(
    "/update_fleet_orders",
    description="Updates fleet orders with data from AG Grid representation",
)
def update_fleet_orders(table: str, data: dict, user: dict = Depends(validate_token)):
    try:
        action = 'update'
        
        date = data["date"]
        quote_no = data["quote_no"]
        order_no = data["order_no"]
        invoice_no = '{' + data["invoice_no"] + '}'
        vehiclereg = data["vehiclereg"]
        odo = data["odo"]
        description = data["description"]
        amount = data["amount"]
        service_provider = data["service_provider"]
        # order_status = data["order_status"]
        contract_type = data["contract_type"]
        mapping = data["mapping"]
        repair_type = data["repair_type"]
        client_ref = data["client_ref"]
        fleet_no = data["fleet_no"]
        invoice_amount = data.get("invoice_amount", 0)
        new_invoice_diff = invoice_amount - amount

        query = """
        UPDATE fleet.{table}
                SET date = '{date}',
                    quote_no = '{quote_no}',
                    invoice_no = '{invoice_no}',
                    vehiclereg = '{vehiclereg}',
                    contract_type = '{contract_type}',
                    odo = {odo},
                    description = '{description}',
                    amount = {amount},
                    service_provider = '{service_provider}',
                    client_ref = '{client_ref}',
                    fleet_no = '{fleet_no}',
                    mapping = '{mapping}',
                    repair_type = '{repair_type}',
                    invoice_diff = '{new_invoice_diff}'
                
                WHERE order_no = '{order_no}'
                RETURNING 'OK'
            """.format(
            date=date,
            quote_no=quote_no,
            order_no=order_no,
            invoice_no=invoice_no,
            vehiclereg=vehiclereg,
            odo=odo,
            description=description,
            amount=amount,
            service_provider=service_provider,
            client_ref=client_ref,
            fleet_no=fleet_no,
            mapping=mapping,
            repair_type=repair_type,
            contract_type=contract_type,
            new_invoice_diff=new_invoice_diff,
            table=table,
        )
            
        get_orders_logs( order_no, user['email'] ,prev_value=query, action=action)
        query = sql.SQL(query)
        exec_query(query)
        result = "Success"

    except IntegrityError as e:
        if "Error occurred" in str(e):
            raise HTTPException(
                status_code=400,
                detail={"error_code": "400", "message": "Double Check The order"},
            )
        else:
            raise HTTPException(
                status_code=400,
                detail={"error_code": "400", "message": "Double Check The order"},
            )

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )

    else:
        print("Order Updated successfully!")

    return result

    # try:
    # print(data, "ffff")


@orders_router.post(
    "/add_shoprite_transaction",
    description="Adds an entry to fleet.orders",
)
def add_shoprite_transaction(data: dict, user: dict = Depends(validate_token)):
    try:
        action = 'create'
        # print("vvvvvvvvv", data)
        date = data["date"]
        quote_no = data["quote_no"]
        order_no = data["order_no"]
        invoice_no = "{" + data["invoice_no"] + "}"
        vehiclereg = data.get("vehiclereg", None)
        odo = data.get("odo", None)
        description = data["description"]
        amount = data.get("amount", None)
        service_provider = data["service_provider"]
        contract_type = data["contract_type"]
        mapping = data["mapping"]
        repair_type = data["repair_type"]
        veh_type_map = data["veh_type_map"]
        client_ref = data["client_ref"]
        invoice_amount = data.get("invoice_amount", 0)
        invoice_diff = invoice_amount - amount
        invoice_diff = invoice_amount - amount
        fleet_no = data.get("fleet_no", None)

        if data["isMilesOrder"]:
            table = "fleet.orders"

        # if a non miles order
        else:
            table = "fleet.orders_non_miles"

        query = """
            INSERT INTO {table} (
                date, quote_no, invoice_no, vehiclereg, odo, description, amount, service_provider, client_ref, order_no, fleet_no, veh_type_map, contract_type, repair_type, mapping, invoice_amount, invoice_diff, order_status
            )
            VALUES (
                '{date}', '{quote_no}', '{invoice_no}', '{vehiclereg}', {odo}, '{description}', {amount}, '{service_provider}', '{client_ref}', '{order_no}', '{fleet_no}', '{veh_type_map}', '{contract_type}', '{repair_type}', '{mapping}', {invoice_amount}, {invoice_diff}, 'order_exception'
            )
            RETURNING 'OK'
        """.format(
            table=table,
            date=date,
            quote_no=quote_no,
            order_no=order_no,
            invoice_no=invoice_no,
            vehiclereg=vehiclereg,
            odo=odo,
            description=description,
            amount=amount,
            service_provider=service_provider,
            client_ref=client_ref,
            fleet_no=fleet_no,
            veh_type_map=veh_type_map,
            contract_type=contract_type,
            repair_type=repair_type,
            mapping=mapping,
            invoice_amount=invoice_amount,
            invoice_diff=invoice_diff,
        )
        query = sql.SQL(query)
        pp1 = """
        UPDATE {table} AS st
            SET julian_month = jc.selected_month
            FROM fleet.julian_cal AS jc
            WHERE st.date BETWEEN jc.jul_from_date AND jc.jul_to_date
            AND st.order_no = '{order_no}'""".format(
            table=table, order_no=order_no
        )
        pp2 = """
        UPDATE {table} AS st
        SET branch = fl.branch, division = fl.division
        FROM fleet.fleetlist AS fl
        WHERE st.vehiclereg = fl.vehiclereg
        AND st.order_no = '{order_no}'""".format(
            table=table, order_no=order_no
        )
        get_orders_logs( order_no, user['email'] ,prev_value=query, action=action)
        pp1 = sql.SQL(pp1)
        pp2 = sql.SQL(pp2)
        exec_query(query)
        exec_query(pp1)
        exec_query(pp2)

        result = "Success"

    except IntegrityError as e:
        if "Error occurred" in str(e):
            raise HTTPException(
                status_code=400,
                detail={"error_code": "400", "message": "Double Check The order"},
            )
        else:
            raise HTTPException(
                status_code=400,
                detail={"error_code": "400", "message": "Double Check The order"},
            )

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )

    else:
        print("Order Created successfully!")

    return result


@orders_router.get(
    "/get_division_and_branch_dev",
    description="Orders division and branch",
)
def get_division_and_branch_dev(user: dict = Depends(validate_token)):
    try:
        query = sql.SQL(
            """COPY ( SELECT division, branch
                        FROM fleet.divisions_new 
                        ----
                        where lower(division) = 'transrite'
                        -----
                        ) TO STDOUT WITH CSV HEADER"""
        ).format()
        response = exc_qrs_get_dfs_raw([query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )
    return response


@orders_router.post("/get_orders_dev", description="Orders grid")
def get_orders_grid_dev(formValues: dict, user: dict = Depends(validate_token)):
    form = FormValues(formValues)    
    try:
        query = sql.SQL(
            """COPY(
            SELECT
                date,
                vehiclereg,
                fleet_no,
                order_no,
                unnest(invoice_no) as invoice_no,
                quote_no,
                amount,
                invoice_amount,
                invoice_diff,
                service_provider,
                description,
                contract_type,
                odo,
                client_ref,
                veh_type_map,
                repair_type,
                "mapping"
            FROM fleet.{table}
            WHERE 
               (julian_month BETWEEN {julian_from} AND {julian_to} ) and 
            branch ={branch}
                AND (order_status != 'deleted' OR order_status IS NULL)
            ORDER BY time_created DESC
            ) TO STDOUT WITH CSV HEADER"""
        )
        miles = query.format(
            table=sql.SQL('orders'),
            branch=form.singleBranch,
            julian_from=form.julStartMonth,
            julian_to=form.julEndMonth,
        )
        non_miles = query.format(
            table=sql.SQL('orders_non_miles'),
            branch=form.singleBranch,
            julian_from=form.julStartMonth,
            julian_to=form.julEndMonth,
        )
        response = exc_qrs_get_dfs_raw([miles, non_miles])
        miles_df = response[0].to_dict("records")
        # print("miles_df", miles_df)
        non_miles_df = response[1].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )

    return {"miles_orders": miles_df, "non_miles_orders": non_miles_df}


@orders_router.get(
    "/generate_order_no",
    description="Generates order number for Shoprite transactions *RETURNS A STRING*",
 
)
def generate_order_no(branch: str, date: str, user: dict = Depends(validate_token)):
    try:
        # print(date)
        con = return_connection()
        cursor = con.cursor()
        cursor.execute(
            """
            SELECT prefix, fin_year
            FROM fleet.order_prefixes
            WHERE branch = '{branch}'
            """.format(
                branch=branch
            )
        )
        resp = cursor.fetchall()[0]
        prefix = resp[0]
        use_fin_year = resp[1]

        cursor.execute(
            """
            SELECT order_no 
            FROM fleet.orders 
            WHERE vehiclereg IN (SELECT vehiclereg FROM fleet.fleetlist) 
            AND order_no LIKE '{prefix}%' 
            AND julian_month = '{date}' 
            UNION
            SELECT order_no 
            FROM fleet.orders_non_miles 
            WHERE order_no LIKE '{prefix}%' 
            AND julian_month = '{date}' 
            ORDER BY order_no DESC
            """.format(
                prefix=prefix, date=date
            )
        )
        results = cursor.fetchall()
        order_no_date = datetime.strptime(date, "%Y-%m-%d")

        # Check if branch uses financial years, updates date to match
        if not use_fin_year:
            order_date_prefix = order_no_date.strftime("%y%m")
        elif use_fin_year:
            order_date_prefix = fin_year_check(order_no_date).strftime("%y%m")
            newdate = datetime.strptime(order_date_prefix, "%y%m")
            date = str(newdate.strftime("%Y-%m-%d"))

        transactions = []
        trim = 4 + len(prefix)

        if not results:
            # Edge case for 1st transaction of the month
            transaction_no = 1
        else:
            for i in range(len(results)):
                # Remove prefix from order no
                order_no_date = results[i][0][len(prefix) : len(prefix) + 4]
                if order_no_date == order_date_prefix:
                    # For orders in correct month, remove non-numeric chars
                    transaction = results[i][0][trim:]
                    transaction = re.sub(r"[^0-9]", "", transaction)
                    transactions.append(int(transaction))
                    # Select largest order no
            current_transaction = max(transactions)

            # Increment transaction no
            transaction_no = int(current_transaction) + 1
        if len(str(transaction_no < 4)):
            # Check transaction no is 4 chars, otherwise add 0s until it is
            for i in range(4 - len(str(transaction_no))):
                transaction_no = "0" + str(transaction_no)
            # Stitch the fucker together en gooi
        datelist = date.split("-")
        transaction_date = str(datelist[0][2:]) + str(datelist[1])
        order_no = str(prefix) + str(transaction_date) + str(transaction_no)
        cursor.close()
        if con:
            con.close()
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return order_no


@orders_router.get(
    "/get_orders_vehicles_reg_dev",
    description="Add Orders to  grid",
)
def get_grid_veh_reg_dev(branch: str, user: dict = Depends(validate_token)):
    try:
        query = sql.SQL(
            """COPY ( select vehiclereg from fleet.fleetlist
                                    where branch = {branch}
                        ) TO STDOUT WITH CSV HEADER"""
        ).format(branch=sql.Literal(branch))
        response = exc_qrs_get_dfs_raw([query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )

    return response


@orders_router.get("/mapping_grid", description="mapping for the grid order form")
def mapping_grid(veh_type_map: str, user: dict = Depends(validate_token)):
    try:
        query = sql.SQL(
            """COPY (  select distinct mapping from fleet.repair_maps_per_veh_type
                        where lower(veh_type_map) = lower(veh_type_map) 
                        ) TO STDOUT WITH CSV HEADER"""
        ).format(veh_type_map=sql.Literal(veh_type_map.lower()))
        response = exc_qrs_get_dfs_raw([query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response




@orders_router.post('/get_order_amount_summary', description= ' Orders Amounts Summary')
def orders_summary(formValues: dict, user: dict = Depends(validate_token)):
    form = FormValues(formValues)    
    try:
        query = sql.SQL(
            """COPY (
            SELECT sum(amount) as Total_order_amount, 
            sum(invoice_amount) as total_inv_amount, 
            sum(invoice_diff) as total_inv_diff , 
            count(invoice_amount) as total_inv_count  FROM fleet.orders
            where  
            (julian_month BETWEEN {julian_from} AND {julian_to} ) and 
            branch ={branch}
             AND (order_status != 'deleted' OR order_status IS NULL)
            )TO STDOUT WITH CSV HEADER"""
        ).format(
            julian_from=form.julStartMonth,
            julian_to=form.julEndMonth,
            branch=form.singleBranch,
        )
        results = exc_qrs_get_dfs_raw([query])[0].replace('', 0).to_dict("records")
        print(results)
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return results

@orders_router.post("/get_invoices_orders",
                    description="Gets invoices for selected orders")
def get_invoices_orders(order_nos: list, user: dict = Depends(validate_token)):

    query = sql.SQL("""COPY(
        SELECT
            transdate,
            fleet_no,
            vehiclereg,
            order_no,
            invoice_no,
            veh_type_map,
            veh_make_map,
            veh_model_map,
            "mapping",
            maintdescription,
            serviceprovider,
            amount,
            savings,
            quantity,
            component_cat,
            work_order_id,
            work_order_distance
        FROM
            fleet.maintenance
        WHERE
            order_no = ANY({order_nos})
        ) TO STDOUT WITH CSV HEADER
            """).format(order_nos=sql.Literal(order_nos))

    result = exc_qrs_get_dfs_raw([query])[0].to_dict("records")

    return result
