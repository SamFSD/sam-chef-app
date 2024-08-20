from fastapi import APIRouter, HTTPException, Depends
import numpy as np
from loguru import logger
from .db_config import exc_qrs_get_dfs_raw
from psycopg2 import sql
from .helpers import div_branch_type_filter_check, months_span
import pandas as pd
import traceback
from .auth import validate_token
from .form_class import FormValues
landing_page_router = APIRouter()


## in use
@landing_page_router.post(
    "/sho002_get_accrual_graph_new",
    description="*NEW WAY OF* Get graph info for accruals and awaiting transactions.  New way uses preprocessed invoice_status column and new rules",
)
def sho002_get_invoice_diff_invoice_status_bar(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form = FormValues(formValues)
        division = formValues["division"]
        branch = formValues["branch"]
        type = formValues["vehicleType"]

        inv_diff = sql.SQL(
            """COPY(
            SELECT
            fleet.orders.julian_month,
            SUM(invoice_diff) AS invoice_difference
        FROM
            fleet.orders
        WHERE
            julian_month BETWEEN date_trunc('month', current_date - interval '12 months') AND date_trunc('month', current_date) AND
            vehiclereg IN (SELECT vehiclereg FROM fleet.fleetlist)
            and 
            division = ANY({division})
                                and
        branch =  ANY({branch})
                                and
            veh_type_map = ANY({veh_type})
        GROUP BY julian_month
            
            )TO STDOUT WITH CSV HEADER"""
        ).format(
            division=sql.Literal(division),
            branch=sql.Literal(branch),
            veh_type=sql.Literal(type),
        )

        df1 = exc_qrs_get_dfs_raw([inv_diff])[0]

        accrual_query = sql.SQL(
            """COPY(
                SELECT
                    maintenance.julian_month AS months,
                    -- Get miles (BLUE)
                    SUM(CASE WHEN invoice_status = 'completed' THEN amount ELSE 0 END) AS miles,
                    -- Get accruals (GREEN)
                    SUM(CASE WHEN invoice_status = 'accrual' THEN amount ELSE 0 END) AS accrual,
                    -- Get invoice exceptions (RED)
                    SUM(CASE WHEN invoice_status = 'invoice_exception' THEN amount ELSE 0 END) AS invoice_exceptions,
                    a.order_exceptions
                FROM
                    fleet.maintenance
                LEFT JOIN (
                    SELECT
                        fleet.orders.julian_month,
                        SUM(amount) AS order_exceptions
                    FROM
                        fleet.orders
                    WHERE
                        order_status = 'order_exception' AND
                        julian_month BETWEEN date_trunc('month', current_date - interval '12 months') AND date_trunc('month', current_date) AND
                        vehiclereg  = any({registration})
                    GROUP BY
                        julian_month
                ) a ON a.julian_month = maintenance.julian_month
                WHERE
                    maintenance.julian_month BETWEEN date_trunc('month', current_date - interval '12 months') AND date_trunc('month', current_date) AND
                    maintenance.julian_month IS NOT NULL AND
                    maintenance.vehiclereg  = any({registration})
                GROUP BY
                    maintenance.julian_month, a.order_exceptions
                ORDER BY
                    maintenance.julian_month ASC
            ) TO STDOUT WITH CSV HEADER"""
        ).format(registration=form.registrations)

        df2 = exc_qrs_get_dfs_raw([accrual_query])[0]

        df1["julian_month"] = pd.to_datetime(df1["julian_month"])
        df2["months"] = pd.to_datetime(df2["months"])

        df1["julian_month"] = df1["julian_month"].dt.strftime("%Y-%m-%d")
        df2["months"] = df2["months"].dt.strftime("%Y-%m-%d")

        df1 = df1.rename(columns={"julian_month": "months"})
        df2 = df2.rename(columns={"months": "months"})

        merged_df = pd.merge(df1, df2, on="months", how="outer")

        merged_df.fillna(0, inplace=True)

        result_dict = merged_df.to_dict("records")
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )

    return result_dict


## in use
@landing_page_router.post(
    "/sho002_veh_types",
    description="Get vehicle types for select/dd",
)
def sho002_veh_types(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form = FormValues(formValues)

        type_query = sql.SQL(
            """COPY(
            SELECT
                veh_type_map,
                count(veh_type_map) AS unit_count
            FROM
                fleet.fleetlist 
            WHERE
                vehiclereg = ANY({reg})
            GROUP BY
                veh_type_map
        )TO STDOUT WITH CSV HEADER"""
        ).format(
            reg=form.registrations
        )

        response = exc_qrs_get_dfs_raw([type_query])[0].to_dict("records")
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )

    return response


## in use
@landing_page_router.post(
    "/sho002_landing_page_stats_row",
    description="Get cpks and total costs per contract type for fixed costs and billed costs",
)
def sho002_landing_stats(formValues: dict, user: dict = Depends(validate_token)):
    try:
        no_of_months = months_span(formValues['julStartMonth'], formValues['julEndMonth'])
        julian_from = formValues['julStartMonth']
        julian_to = formValues['julEndMonth']
        registrations = list(
            map(lambda x: x["vehiclereg"], formValues["registrations"])
        )
        branch = formValues["branch"]

        type_query = sql.SQL(
            """COPY(
        WITH FilteredFleet AS (
                SELECT vehiclereg, contract_type
                FROM fleet.fleetlist
                WHERE vehiclereg = any({registrations})  
            ),
            FilteredTrips as (
                    select sum(distance) as total_distance,
                    contract_type
                    from fleet.trip_data_daily
                    WHERE vehiclereg in (select vehiclereg from FilteredFleet)
                    and julian_month BETWEEN {julian_from} AND {julian_to}
                    group by contract_type
            ),
            FilteredTxns as (
            select sum(amount) as amount, sum(savings::numeric) as savings, contract_type
            from fleet.maintenance 
                    WHERE vehiclereg in (select vehiclereg from FilteredFleet)
                    and  julian_month BETWEEN {julian_from} AND {julian_to}

                    --------------------- Added becasue we have txns not in our fleetlist 
                    -- and vehiclereg in (select vehiclereg from fleet.fleetlist)
                    --------------------- Remove all invoice_exceptions
                    and invoice_status <> 'invoice_exception'
                    group by contract_type
            ),
            FilteredInvoiceExceptions as (
                    select sum(amount) as amount
                    from fleet.maintenance
                    WHERE vehiclereg in (select vehiclereg from FilteredFleet)
                    and  julian_month BETWEEN {julian_from} AND {julian_to}
                    and invoice_status = 'invoice_exception'
                    ),
            FilteredOrderExceptions as (
                select sum(amount) as amount, contract_type from fleet.orders 
                where vehiclereg in (select vehiclereg from FilteredFleet)
                and julian_month BETWEEN {julian_from} AND {julian_to}
                and order_status = 'order_exception'
                group by contract_type
            ),
            FilteredExternalOrders as (
            select sum(amount) as amount from fleet.orders_non_miles
            where branch = ANY({branch})
            and julian_month BETWEEN {julian_from} AND {julian_to}
            )
            SELECT
            total_count,
            opl_count,
            total_billed_costs,
    -- 		total_billed_cpk,
            mm_count,
            fml_count,
            total_distance,
            total_fixed_cost,
    -- 		total_fixed_cpk,
    -- 		total_billed_cpk,
            total_savings,
            opl_fixed_cost,
    -- 		opl_fixed_cpk,
            mm_fixed_cost,
    -- 		mm_fixed_cpk,
            fml_fixed_cost,
    -- 		fml_fixed_cpk,
            opl_billed_cost,
    -- 		opl_billed_cpk,
            mm_billed_cost,
    -- 		mm_billed_cpk,
            fml_billed_cost,
    -- 		fml_billed_cpk,
            mm_distance,
            fml_distance,
            opl_distance,
            --completed_invoice_amount,
            --invoice_exception_amount,
            --accruals_amount,
    -- 		total_fixed_cost + total_billed_costs as total_costs,
    -- 		ROUND((total_fixed_cost + total_billed_costs)/total_distance, 2) as total_cpk
            mm_order_exceptions,
            opl_order_exceptions,
            fml_order_exceptions,
            total_order_exception_cost,
            invoice_exception_total,
            external_orders_total
            FROM
            (
            SELECT
            COUNT(vehiclereg) AS total_count,
            SUM(maint_plan_cost) AS total_fixed_cost,
            (select sum(total_distance) from FilteredTrips) AS total_distance,
            SUM(CASE WHEN contract_type = 'Operating Lease' and vehiclereg in (select vehiclereg from FilteredFleet)  
            THEN maint_plan_cost ELSE 0 END) AS opl_fixed_cost,
            
            ROUND(SUM(CASE WHEN contract_type = 'Operating Lease' and vehiclereg in (select vehiclereg from FilteredFleet)
            THEN maint_plan_cost ELSE 0 END) / NULLIF((SELECT SUM(total_distance) FROM FilteredTrips WHERE contract_type = 'Operating Lease'), 0), 2) AS opl_fixed_cpk,
            SUM(CASE WHEN contract_type = 'Managed Maintenance' and vehiclereg in (select vehiclereg from FilteredFleet)  
            THEN maint_plan_cost ELSE 0 END) AS mm_fixed_cost,

            SUM(CASE WHEN contract_type in ('Full Maintenance Lease without Tyres', 'Full Maintenance Lease with Tyres') and vehiclereg in (select vehiclereg from FilteredFleet) THEN maint_plan_cost ELSE 0 END) AS fml_fixed_cost,
            SUM(CASE WHEN contract_type = 'Operating Lease' and vehiclereg in  (select vehiclereg from FilteredFleet)  
            THEN 1 END) AS opl_count,
            SUM(CASE WHEN contract_type = 'Managed Maintenance' and vehiclereg in (select vehiclereg from fleet.fleetlist
            where vehiclereg in (select vehiclereg from FilteredFleet)  ) THEN 1 END) AS mm_count,
            SUM(CASE WHEN contract_type in ('Full Maintenance Lease without Tyres', 'Full Maintenance Lease with Tyres') and vehiclereg in  (select vehiclereg from FilteredFleet) THEN 1 END) AS fml_count,
                
                        
            ------------------------ get distances per contract_type
            (SELECT SUM(total_distance) FROM FilteredTrips WHERE contract_type = 'Operating Lease') as mm_distance,
            (SELECT SUM(total_distance) FROM FilteredTrips WHERE contract_type = 'Operating Lease') as opl_distance,
            (SELECT SUM(total_distance) FROM FilteredTrips WHERE contract_type in ('Full Maintenance Lease without Tyres','Full Maintenance Lease with Tyres')) as fml_distance
            FROM fleet.fleetlist where vehiclereg in (select vehiclereg from FilteredFleet)   
                
        
                
            ) AS query1
            JOIN
            (
            SELECT
            -- unknown transactions are linked to the '#N/A' asset in the vehicle list which has 'Unknown' as the contract_type type.
            -- Add unknown contract_type to this line to include all billed costs
            -- get savings total
            sum(savings::numeric) as total_savings,
            --total miles costs that have been invoiced
            SUM(amount) AS total_billed_costs,
            -- get total cpk including awaiting and accruals
            ROUND(
            (SUM(amount))/
            NULLIF((SELECT SUM(total_distance) FROM FilteredTrips), 0), 2) 
            AS total_billed_cpk,
            -- get total opl billed
            (select sum(amount) from FilteredTxns where contract_type = 'Operating Lease') AS opl_billed_cost,
            -- get opl cpk including awaiting
            ROUND((select sum(amount) from FilteredTxns where contract_type = 'Operating Lease')
            / NULLIF((SELECT SUM(total_distance) from FilteredTrips where contract_type = 'Operating Lease'), 0), 2) 
            AS opl_billed_cpk,
            -- get mm billed costs including awaiting
            (select sum(amount) from FilteredTxns where contract_type = 'Managed Maintenance' 
            )  AS mm_billed_cost,
            -- get mm cpk including awaiting
            ROUND((select sum(amount) from FilteredTxns where contract_type = 'Managed Maintenance' ) / NULLIF((SELECT SUM(total_distance) from FilteredTrips where contract_type = 'Managed Maintenance'), 0), 2) 
            AS mm_billed_cpk,
            -- get fml total billed including awaiting
            (select sum(amount) from FilteredTxns where contract_type in ('Full Maintenance Lease without Tyres','Full Maintenance Lease with Tyres') 
            ) AS fml_billed_cost,
            -- get fml cpk including awaiting
            ROUND((select sum(amount) from FilteredTxns where contract_type in ('Full Maintenance Lease without Tyres','Full Maintenance Lease with Tyres')) / NULLIF((
                SELECT SUM(total_distance) from FilteredTrips where contract_type in ('Full Maintenance Lease without Tyres','Full Maintenance Lease with Tyres'))
            , 0), 2) AS fml_billed_cpk
            FROM FilteredTxns
            ) AS query2
            ON 1=1
            JOIN
            (
            SELECT sum(case when contract_type = 'Managed Maintenance' then amount else 0 end) as mm_order_exceptions,
                sum(case when contract_type = 'Operating Lease' then amount else 0 end) as opl_order_exceptions,
                sum(case when contract_type in ('Full Maintenance Lease without Tyres','Full Maintenance Lease with Tyres')  then amount else 0 end) as fml_order_exceptions,
                sum(amount) as total_order_exception_cost
                from FilteredOrderExceptions
            ) AS query3 ON 1=1
            -- get invoice exceptions total
            JOIN (select sum(amount) as invoice_exception_total from FilteredInvoiceExceptions) 
            AS query4 ON 1=1
            JOIN (select sum(amount) as external_orders_total from FilteredExternalOrders)
            AS query5 ON 1=1
            
                    ) TO STDOUT WITH CSV HEADER"""
        ).format(
            branch=sql.Literal(branch),
            julian_from=sql.Literal(julian_from),
            julian_to=sql.Literal(julian_to),
            registrations=sql.Literal(registrations),
        )

        df = exc_qrs_get_dfs_raw([type_query])[0].replace("", 0)
        # calculate total costs
        # mm costs include opl costs, set opl costs and cpks to 0
        df.mm_billed_cost = (
            df.mm_billed_cost
            + df.opl_billed_cost
            + df.mm_order_exceptions
            + df.opl_order_exceptions
        )
        df.total_fixed_cost = df.total_fixed_cost * no_of_months
        df.fml_billed_cost = df.fml_billed_cost + df.fml_order_exceptions

        df["total_fixed_costs"] = (
            df.mm_fixed_cost + df.fml_fixed_cost + df.opl_fixed_cost
        )
        # opl billed costs is set to zero so only use mm and fml billed costs for toal billed costs
        df["total_billed_costs"] = df.mm_billed_cost + df.fml_billed_cost
        # get total billed cpk
        df["total_billed_cpk"] = (
            round(df.total_billed_costs / df.total_distance, 2) * 100
        )
        # get mm billed cpk
        df["mm_distance"] = (
            df.mm_distance + df.opl_distance
        )  # add opl distance to mm for cpk since opl cpk will always be 0
        df["mm_billed_cpk"] = round(df.mm_billed_cost / df.mm_distance, 2) * 100
        # get fml billed cpk
        df["fml_billed_cpk"] = round(df.fml_billed_cost / df.fml_distance, 2) * 100
        df["total_costs"] = df.total_fixed_cost + df.total_billed_costs

        # get fixed cpks
        df["total_fixed_cpk"] = round(df.total_fixed_costs / df.total_distance, 2) * 100
        df["mm_fixed_cpk"] = round(df.mm_fixed_cost / df.mm_distance, 2) * 100
        df["fml_fixed_cpk"] = round(df.fml_fixed_cost / df.fml_distance, 2) * 100
        df["opl_fixed_cpk"] = round(df.opl_fixed_cost / df.opl_distance, 2) * 100

        # get total cpk
        df["total_cpk"] = round(df.total_costs / df.total_distance, 2) * 100
        # print(df)
        # replace all nan and inf with 0's
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )

    return df.replace([np.inf, -np.inf, np.nan], 0).to_dict("records")

## in use
@landing_page_router.post(
    "/get_cost_per_supplier_graph",
    description="Get graph info for supplier cost graph on landing page",
)
def get_cost_per_supplier_graph(formValues: dict, user: dict = Depends(validate_token)):
    try:
        julian_from = formValues['julStartMonth']
        julian_to = formValues['julEndMonth']
        registrations = list(
            map(lambda x: x["vehiclereg"], formValues["registrations"])
        )

        supplier_query = sql.SQL(
            """COPY (
                            select serviceprovider, sum(amount) as costs 
                            from fleet.maintenance
                            where (julian_month BETWEEN {julian_from} AND {julian_to})  and
                            vehiclereg = any({registrations})  
                            group by serviceprovider   
                            order by costs asc
                    )TO STDOUT WITH CSV HEADER """
        ).format(
                       julian_from=sql.Literal(julian_from),
            julian_to=sql.Literal(julian_to), registrations=sql.Literal(registrations)
        )

        response = exc_qrs_get_dfs_raw([supplier_query])[0].to_dict("records")
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )
    return response


## in use
@landing_page_router.post(
    "/get_cost_per_component_graph",
    description="Get graph info for component cost graph on landing page",
)
def get_cost_per_component_graph(formValues: dict, user: dict = Depends(validate_token)):
    try:
        julian_from = formValues['julStartMonth']
        julian_to = formValues['julEndMonth']
        registrations = list(
            map(lambda x: x["vehiclereg"], formValues["registrations"])
        )

        component_query = sql.SQL(
            """COPY(
                    select mapping, sum(amount) as cost
                    FROM fleet.maintenance
                    where (julian_month BETWEEN {julian_from} AND {julian_to}) and vehiclereg = any({registrations})              
                    group by mapping 
                    order by cost ASC
                            )TO STDOUT WITH CSV HEADER"""
        ).format(
                      julian_from=sql.Literal(julian_from),
            julian_to=sql.Literal(julian_to), registrations=sql.Literal(registrations)
        )

        response = exc_qrs_get_dfs_raw([component_query])[0].to_dict("records")
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )
    return response
