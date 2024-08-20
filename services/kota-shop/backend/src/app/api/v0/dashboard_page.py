from fastapi import APIRouter, HTTPException, Depends
from .db_config import exc_qrs_get_dfs_raw
from datetime import datetime
from loguru import logger
from psycopg2 import sql
from .helpers import (
    div_branch_type_filter_check,
    get_financial_years,
    fin_year_start
)
import pandas as pd
import numpy as np
import traceback
from .form_class import FormValues
import time
from .auth import validate_token


dashboard_page_router = APIRouter()


@dashboard_page_router.post(
    "/get_dash_cost_savings_mileage",
    description="Gets costs for financial year to date",
)
def get_dash_cost_savings_mileage(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form = FormValues(formValues)
        date_fytd = sql.SQL('>= {julian_from}').format(julian_from=form.finYearStart)
        date_curr = sql.SQL('BETWEEN {julian_from} AND {julian_to}').format(
            julian_from=form.julStartMonth,
            julian_to=form.julEndMonth
        )
        query = sql.SQL(
            """
            COPY(
                        WITH MaintenanceSummary AS (
                SELECT
                    to_char(julian_month::date, 'Month') as julian_month,
                    SUM(amount) AS amount,
                    SUM(savings) AS savings
                FROM
                    fleet.maintenance
                WHERE
                    julian_month {date_cond}
                    AND vehiclereg = ANY({reg})
                GROUP BY
                    julian_month
            ),
            TripDataSummary AS (
                SELECT
                    to_char(julian_month::date, 'Month') as julian_month,
                    SUM(distance) as mileage
                FROM
                    fleet.trip_data_daily
                WHERE
                    julian_month {date_cond}
                    AND vehiclereg = ANY({reg})
                GROUP BY
                    julian_month
            )
            SELECT
                COALESCE(MaintenanceSummary.julian_month, TripDataSummary.julian_month) as julian_month,
                COALESCE(MaintenanceSummary.amount, 0) as amount,
                COALESCE(MaintenanceSummary.savings, 0) as savings,
                COALESCE(TripDataSummary.mileage, 0) as mileage
            FROM
                MaintenanceSummary
            FULL OUTER JOIN TripDataSummary ON MaintenanceSummary.julian_month = TripDataSummary.julian_month
            )TO STDOUT WITH CSV HEADER
        """
        )
        fytd = query.format(
            date_cond=date_fytd,
            reg=form.registrations,
        )
        current = query.format(
            date_cond=date_curr,
            reg=form.registrations,
        )
        result = exc_qrs_get_dfs_raw([fytd, current])
        res_fytd = result[0].to_dict("records")
        res_curr = result[1].to_dict("records")
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return {"fytd": res_fytd, "current": res_curr}


@dashboard_page_router.post(
    "/sho002_get_most_and_least_expensive_assets_without_date",
    description="Get most and least expensive assets without date",
)
def sho002_get_most_and_least_expensive_assets_without_date(
    formValues: dict, user: dict = Depends(validate_token)
):
    try:
        form_values = FormValues(formValues)
        query = sql.SQL(
            """COPY (
                SELECT vehiclereg, fleet_no, , SUM(amount) AS amount, branch, division, veh_type_map
                FROM fleet.month_cost_per_asset
                WHERE veh_type_map <> 'Consumables' and vehiclereg = any({registrations})  
                GROUP BY vehiclereg, fleet_no, branch, division, veh_type_map
                ORDER BY amount DESC
            ) TO STDOUT WITH CSV HEADER """
        ).format(
           registrations=form_values.registrations,
        )
        response = exc_qrs_get_dfs_raw([query])[0].to_dict("records")
        df = pd.DataFrame(response)
        top_n_rows = df.head(100) #changed this as we are now only showing top 100 as per client request
        bottom_n_rows = df.tail(10)
        top_n_records = top_n_rows.to_dict("records")
        bottom_n_records = bottom_n_rows.to_dict("records")

    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return {"top_n_rows": top_n_records, "bottom_n_rows": bottom_n_records}


@dashboard_page_router.post(
    "/sho002_get_most_and_least_expensive_assets",
    description="Get most and least expensive assets",
)
def sho002_get_most_and_least_expensive_assets(
    formValues: dict, user: dict = Depends(validate_token)
):
    try:
        form_values = FormValues(formValues)
        query = sql.SQL(
            """COPY (
                SELECT vehiclereg, fleet_no, branch, division, julian_month, SUM(amount) AS amount, veh_type_map
                FROM fleet.month_cost_per_asset
                WHERE veh_type_map <> 'Consumables' AND julian_month BETWEEN {julian_from} AND {julian_to}
                    and vehiclereg = any({registrations})  
                GROUP BY vehiclereg, fleet_no, branch, division, julian_month, veh_type_map
                ORDER BY amount DESC
            ) TO STDOUT WITH CSV HEADER """
        ).format(
            julian_from=form_values.julStartMonth,
            julian_to=form_values.julEndMonth,
            registrations=form_values.registrations,
        )
        response = exc_qrs_get_dfs_raw([query])[0].to_dict("records")
        df = pd.DataFrame(response)
        top_n_rows = df.head(100)  #changed this as we are now only showing top 100 as per client request
        bottom_n_rows = df.tail(10)
        top_n_records = top_n_rows.to_dict("records")
        bottom_n_records = bottom_n_rows.to_dict("records")

    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return {"top_n_rows": top_n_records, "bottom_n_rows": bottom_n_records}


@dashboard_page_router.post(
    "/get_historic_km_per_month",
    description="Retrieves kilometers for selected month, and same month in prior years",
)
def get_historic_km_per_month(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form_values = FormValues(formValues)
        month = form_values.julMonth
        current_year = datetime.strptime({month}, "%Y-%m-%d")
        prev_year = datetime(
            current_year.year - 1, current_year.month, current_year.day
        )
        very_prev_year = datetime(
            current_year.year - 2, current_year.month, current_year.day
        )

        query = sql.SQL(
            """
        COPY(SELECT
	SUM(CASE WHEN month = {current_year} THEN distance END) as current_year,
	SUM(CASE WHEN month = {prev_year} THEN distance END) as prev_year,
	SUM(CASE WHEN month = {very_prev_year} THEN distance END) as very_prev_year
	
	FROM fleet.dashboard
    where vehiclereg = any({registrations})  

        ) TO STDOUT WITH CSV HEADER"""
        ).format(
            current_year=sql.Literal(current_year),
            prev_year=sql.Literal(prev_year),
            very_prev_year=sql.Literal(very_prev_year),
            month=form_values.julMonth,
             registrations=form_values.registrations,

        )

        results = exc_qrs_get_dfs_raw([query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return results


@dashboard_page_router.post(
    "/get_historic_cost_per_month",
    description="Retrieves cost for selected month, and same month in prior years",
)
def get_historic_cost_per_month(
    formValues: dict, user: dict = Depends(validate_token)
):
    try:
        registrations = list(map(lambda x: x["vehiclereg"], formValues["registrations"]))
        month = formValues["month"]
        current_year = datetime.strptime(month, "%Y-%m-%d")
        prev_year = datetime(
            current_year.year - 1, current_year.month, current_year.day
        )
        very_prev_year = datetime(
            current_year.year - 2, current_year.month, current_year.day
        )

        query = sql.SQL(
            """
            COPY(SELECT
        SUM(CASE WHEN month = {current_year} THEN amount END) as current_year,
        SUM(CASE WHEN month = {prev_year} THEN amount END) as prev_year,
        SUM(CASE WHEN month = {very_prev_year} THEN amount END) as very_prev_year
        
        FROM fleet.dashboard
        WHERE vehiclereg = any({registrations})  
            ) TO STDOUT WITH CSV HEADER"""
        ).format(
            current_year=sql.Literal(current_year),
            prev_year=sql.Literal(prev_year),
            very_prev_year=sql.Literal(very_prev_year),
             month=sql.Literal(month),
            registrations=sql.Literal(registrations),
        )

        results = exc_qrs_get_dfs_raw([query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return results


@dashboard_page_router.post(
    "/get_month_dist_vs_fytd",
    description="Gets selected month costs vs avg of all other months for financial year to date",
)
def get_month_dist_vs_fytd(formValues: dict, user: dict = Depends(validate_token)):
    try:
        registrations = list(map(lambda x: x["vehiclereg"], formValues["registrations"]))
        month = formValues["month"]
        julian_from = formValues['julStartMonth']
        julian_to = formValues['julEndMonth']

        fin_years = get_financial_years(month)
        fin_year_start = fin_years["current_financial_year"]["start_date"]
        avg_ytd = sql.SQL(
            """COPY(
            SELECT
                SUM(CASE WHEN MONTH = {end} THEN distance END) AS distance,
                    ROUND(CASE 
            WHEN COUNT(DISTINCT(month)) > 1 
            THEN SUM(CASE WHEN month < {end} THEN distance END) / (COUNT(DISTINCT(month)) - 1)
            ELSE SUM(CASE WHEN month > {end} THEN distance END)
        END, 2) as avg_distance
        FROM fleet.dashboard
        WHERE julian_month BETWEEN {julian_from} AND {julian_to}
                    and vehiclereg = any({registrations}) 
      ) TO STDOUT WITH CSV HEADER
        """
        ).format(
            start=sql.Literal(fin_year_start),
            end=sql.Literal(month),
            julian_from=sql.Literal(julian_from),
            julian_to=sql.Literal(julian_to),
            registrations=sql.Literal(registrations),
        )

        results = exc_qrs_get_dfs_raw([avg_ytd])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")

    return results


@dashboard_page_router.post(
    "/assets_dashboard_top_row_api",
    description="Assets top row api",
)
def assets_dashboard_top_row_api(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form = FormValues(formValues)

        # print(division, branch, veh_type)
        all_time_query = sql.SQL(
            """COPY (
            SELECT mcpa.vehiclereg, fl.fleet_no, SUM(amount) AS amount, fl.branch, fl.division, fl.veh_type_map, fl.contract_type, round(fl.last_odo) as last_odo
            FROM fleet.month_cost_per_asset mcpa
            LEFT JOIN fleet.fleetlist fl on mcpa.vehiclereg = fl.vehiclereg
            WHERE fl.veh_type_map <> 'Consumables' 
                and fl.vehiclereg = any({registrations}) 
                and fl.vehiclereg NOT LIKE 'CONS%'
            GROUP BY mcpa.vehiclereg, fl.fleet_no, fl.branch, fl.division, fl.veh_type_map, fl.contract_type, fl.last_odo
            ORDER BY amount DESC
        ) TO STDOUT WITH CSV HEADER """
        ).format(registrations=form.registrations)
        # all_time_query = sql.SQL(
        #     """COPY (
        #     SELECT DISTINCT
        #         m.vehiclereg,
        #         fleet_no,
        #         x.amount,
        #         branch,
        #         division,
        #         veh_type_map
        #     FROM
        #         fleet.maintenance m
        #     LEFT JOIN (
        #         SELECT
        #             vehiclereg,
        #             SUM(amount) AS amount
        #         FROM
        #             fleet.maintenance
        #         GROUP BY
        #             vehiclereg
        #     ) x ON x.vehiclereg = m.vehiclereg
        #     WHERE
        #         veh_type_map <> 'Consumables'
        #         AND m.vehiclereg = ANY({registrations})
        #         AND m.vehiclereg NOT LIKE 'CONS%'
        #         AND x.amount > 0
        #     ORDER BY
        #         x.amount DESC
        # ) TO STDOUT WITH CSV HEADER """
        # ).format(registrations=form.registrations)

        selected_month_query = sql.SQL(
            """COPY ( 
            SELECT mcpa.vehiclereg, fl.fleet_no, SUM(amount) AS amount, fl.branch, fl.division, fl.veh_type_map, fl.contract_type, round(fl.last_odo) as last_odo
            FROM fleet.month_cost_per_asset mcpa
            LEFT JOIN fleet.fleetlist fl on mcpa.vehiclereg = fl.vehiclereg
            WHERE fl.veh_type_map <> 'Consumables' 
                and fl.vehiclereg = any({registrations}) 
                and fl.vehiclereg NOT LIKE 'CONS%'
            AND julian_month BETWEEN {julian_from} AND {julian_to}
            GROUP BY mcpa.vehiclereg, fl.fleet_no, fl.branch, fl.division, fl.veh_type_map, fl.contract_type, fl.last_odo
            ORDER BY amount DESC
        ) TO STDOUT WITH CSV HEADER """
        ).format(
            registrations=form.registrations,
            julian_from=form.julStartMonth,
            julian_to=form.julEndMonth,
        )

        # selected_month_query = sql.SQL(
        #     """COPY (
        # SELECT DISTINCT
        #     m.vehiclereg,
        #     fleet_no,
        #     x.amount,
        #     branch,
        #     division,
        #     veh_type_map
        # FROM
        #     fleet.maintenance m
        # LEFT JOIN (
        #     SELECT
        #         vehiclereg,
        #         SUM(amount) AS amount
        #     FROM
        #         fleet.maintenance
        #     WHERE
        #         julian_month BETWEEN {julian_from} AND {julian_to}
        #     GROUP BY
        #         vehiclereg
        # ) x ON x.vehiclereg = m.vehiclereg
        # WHERE
        #     veh_type_map <> 'Consumables'
        #     AND m.vehiclereg = ANY({registrations})
        #     AND m.vehiclereg NOT LIKE 'CONS%'
        #     AND julian_month BETWEEN {julian_from} AND {julian_to}
        #     AND x.amount > 0
        # ORDER BY
        #     x.amount DESC
        # ) TO STDOUT WITH CSV HEADER """
        # ).format(
        #     registrations=form.registrations,
        #     julian_from=form.julStartMonth,
        #     julian_to=form.julEndMonth,
        # )

        query_list = [all_time_query, selected_month_query]

        results = exc_qrs_get_dfs_raw(query_list)

        all_time_top_df = (
            results[0].head(100).fillna(0)
        )  # changed this from 10 to 100 as we are now only showing top 100 as per client request
        # all_time_bottom_df = results[0].tail(10)[::-1]

        selected_month_top_df = (
            results[1].head(100).fillna(0)
        )  # changed this from 10 to 100 as we are now only showing top 100 as per client request
        selected_month_top_df["last_odo"].replace("", pd.NA, inplace=True)
        all_time_top_df["last_odo"].replace("", pd.NA, inplace=True)

        # Fill NA/NaN values in the 'last_odo' column with 0
        selected_month_top_df["last_odo"].fillna(0, inplace=True)
        all_time_top_df["last_odo"].fillna(0, inplace=True)
        
        all_time_top = all_time_top_df.to_dict("records")
        selected_month_top = selected_month_top_df.to_dict("records")

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return {
        "top_10_all_time": all_time_top,
        "top_10_selected_month": selected_month_top,
    }



@dashboard_page_router.post(
    "/get_fleet_count",
    description="Gets count of vehicles in fleetlist according to fleet no mapping",
)
def get_fleet_count(formValues: dict, user: dict = Depends(validate_token)):
    try:
        division = formValues["division"]
        branch = formValues["branch"]
        commercial_query = sql.SQL(
            """
        COPY(
            SELECT
                vehicle_type,
                prefix,
                COALESCE(veh_count, 0) AS veh_count
            FROM fleet.fleet_no_desc_map
                LEFT JOIN (
                    SELECT fleet_no_desc,
                        COUNT(*) AS veh_count
            FROM 
                fleet.fleetlist
            WHERE 
                division = ANY({division})
            AND 
                branch = ANY({branch})
                    GROUP BY fleet_no_desc
                ) AS fleetlist_count ON fleetlist_count.fleet_no_desc = fleet.fleet_no_desc_map.vehicle_type
            ORDER BY veh_count DESC
            )TO STDOUT WITH CSV HEADER
        """
        ).format(branch=sql.Literal(branch), division=sql.Literal(division))

        passenger_query = sql.SQL("""
        COPY(
        SELECT
            description,
            COUNT(*) AS count
        FROM
            fleet.fleetlist
        WHERE
            veh_type_map IN ('Passenger Car', 'Light Commercial Vehicle')
        AND
            division = ANY({division})
        AND 
            branch = ANY({branch})
        GROUP BY
            description
        ORDER BY
            "count" DESC
        ) TO STDOUT WITH CSV HEADER
                            """).format(branch=sql.Literal(branch), division=sql.Literal(division))
        results = exc_qrs_get_dfs_raw([commercial_query, passenger_query])
        commercial = results[0].to_dict("records")
        passenger = results[1].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")

    return {"commercial": commercial, "passenger": passenger}

@dashboard_page_router.post(
    "/calculate_outliers",
    description='Calculates statistical outliers in cost/repair count for vehicles in a selection'
)
def calculate_outliers(formValues: dict, user: dict = Depends(validate_token)):

    def filter_rows(df):
        '''Local to dashboard outliers API call. Checks the standard deviations for amount and transaction count in the df, and returns rows where std dev > 2'''
        return df[(df['sum'] > df['amount_pm'] + (df['amount_pm_std'] * 2)) | (df['count'] > df['transactions'] + (df['transactions_std'] * 2))]
    
    form = FormValues(formValues)
    registrations = list(
            map(lambda x: x["vehiclereg"], formValues["registrations"])
        )

    maint_query = sql.SQL("""
        COPY(
        SELECT
            vehiclereg AS reg,
            fleet_no,
            veh_type_map AS type,
            veh_make_map as make,
            veh_model_map AS model,
            amount,
            julian_month
        FROM 
            fleet.maintenance
                    ) TO STDOUT WITH CSV HEADER""")
    
    jul_query = sql.SQL("""
        COPY(
        SELECT
            selected_month
        FROM
            fleet.julian_cal
        WHERE
            selected_month BETWEEN {jul_start} AND {jul_end}
        ) TO STDOUT WITH CSV HEADER""").format(
            jul_start=form.julStartMonth,
            jul_end=form.julEndMonth
        )
    julian_months = exc_qrs_get_dfs_raw([jul_query])[0]['selected_month'].to_list()
    data = exc_qrs_get_dfs_raw([maint_query])[0]

    #Filter by reg and julian months
    cost_pm = data.groupby(['reg', 'julian_month', 'fleet_no', 'type', 'make', 'model'])['amount'].agg(['sum', 'count']).reset_index()
    filtered_data = cost_pm[cost_pm['reg'].isin(registrations)]
    filtered_data = filtered_data[filtered_data['julian_month'].isin(julian_months)]
    
    #Get lists of all selected types and models, calculate avgs and std devs from those
    selected_types = filtered_data['type'].tolist()
    selected_models = filtered_data['model'].tolist()
    type = cost_pm[cost_pm['type'].isin(selected_types)].groupby(['type', 'julian_month']).agg({
        'sum': ['mean'],
        'count': ['mean']
        }).reset_index()
    type.columns = [''.join(col).strip() for col in type.columns.values]

    model = cost_pm[cost_pm['model'].isin(selected_models)].groupby(['make', 'model', 'julian_month']).agg({
        'sum': ['mean'],
        'count': ['mean']
        }).reset_index()
    model.columns = [''.join(col).strip() for col in model.columns.values]

    # Rename columns for clarity
    type.columns = ['type', 'julian_month', 'amount_pm', 'transactions']
    model.columns = ['make', 'model', 'julian_month', 'amount_pm', 'transactions']


    type_avg = type.groupby('type').agg({
        'amount_pm': ['mean', 'std'],
        'transactions': ['mean', 'std']
    }).reset_index()
    type_avg.columns = ['_'.join(col).strip() for col in type_avg.columns.values]
    type_avg.columns = ['type', 'amount_pm', 'amount_pm_std', 'transactions', 'transactions_std']
    model_avg = model.groupby(['make', 'model']).agg({
        'amount_pm': ['mean', 'std'],
        'transactions': ['mean', 'std']
    }).reset_index()
    model_avg.columns = ['_'.join(col).strip() for col in model_avg.columns.values]
    model_avg.columns = ['make', 'model', 'amount_pm', 'amount_pm_std', 'transactions', 'transactions_std']

    #Merge vehicle dfs into comparison dfs
    veh_vs_type = filtered_data.merge(type_avg, on=['type'])
    veh_vs_model = filtered_data.merge(model_avg, on=['make', 'model'])

    #Filter to only outliers
    results_type = filter_rows(veh_vs_type)
    results_model = filter_rows(veh_vs_model)

    #Merge all this stupid shit into one DF 
    results = results_model.merge(results_type, on =['reg', 'fleet_no', 'type', 'make', 'model'], suffixes=('', '_type'))
    results = results.sort_values(by='sum', ascending=False)
    #Drop redundant columns from the merge
    results.drop(columns=['sum_type', 'count_type', 'julian_month_type'], inplace=True)

    return results.replace(np.nan, None).to_dict("records")

@dashboard_page_router.post(
    "/get_fleet_card_costs",
    description="Gets costs for fleet card for financial year to date",
)
def get_fleet_card_costs(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form = FormValues(formValues)
        date_fytd = sql.SQL('>= {julian_from}').format(julian_from=form.finYearStart)
        date_curr = sql.SQL('BETWEEN {julian_from} AND {julian_to}').format(
            julian_from=form.julStartMonth,
            julian_to=form.julEndMonth
        )
        query = sql.SQL(
            """
            COPY(
                SELECT 
                    TO_CHAR(julian_month::date, 'Month') AS julian_month,
                    SUM(CASE WHEN transaction_type = 'TOLL' THEN transaction_cost ELSE 0 END) AS toll_cost,
                    SUM(CASE WHEN transaction_type = 'FUEL' THEN transaction_cost ELSE 0 END) AS fuel_cost
                FROM 
                    fleet.fleet_card
                WHERE 
                    julian_month {date_cond}
                    AND vehiclereg = ANY({reg})
                GROUP BY 
                    julian_month
            )TO STDOUT WITH CSV HEADER
        """
        )
        fytd = query.format(
            date_cond=date_fytd,
            reg=form.registrations,
        )

        current = query.format(
            date_cond=date_curr,
            reg=form.registrations,
        )
        result = exc_qrs_get_dfs_raw([fytd, current])
        res_fytd = result[0].to_dict("records")
        res_curr = result[1].to_dict("records")
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return {"fytd": res_fytd, "current": res_curr}