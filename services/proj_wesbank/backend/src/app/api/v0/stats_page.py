from fastapi import APIRouter, HTTPException, Depends
from .db_config import exc_qrs_get_dfs_raw
from loguru import logger
from psycopg2 import sql
import pandas as pd
import numpy as np
import traceback
from .form_class import FormValues
from .helpers import calculate_boxplot_stats
import asyncio
from .auth import validate_token

stats_router = APIRouter()
class SankeyData:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SankeyData, cls).__new__(cls)
            cls._instance.data = None
            cls._instance.queue = asyncio.Queue()
        return cls._instance

async def wait_for_sankey(sankey_data: SankeyData = Depends(lambda: SankeyData())):
    try:
        data = await asyncio.wait_for(sankey_data.queue.get(), timeout=10)
        return data
    except asyncio.TimeoutError:
        return None


@stats_router.post(
    "/stats_sankey",
    description='Retrieves the stats for the Sankey chart on the stats page'
)
async def stats_sankey(formValues: dict, singleAsset: bool, sankey_data: SankeyData = Depends(lambda: SankeyData()), user: dict = Depends(validate_token)):

    try:
        form = FormValues(formValues)
        if singleAsset:
            assets = form.singleReg 
        else:
            assets = sql.SQL('ANY({})').format(form.registrations)

        def sankey_format(df, trailers: bool):
            '''Formats a dataframe with columns ['vehicle', 'serviceprovider', 'mapping', 'amountmean', 'distancemean']
            \nIf trailer is true, distancemean is not used, and returns amount.
            \nIf trailer is false, returns CPK.'''
            names = []
            links = []
            # Iterate through each row in the DataFrame
            for index, row in df.iterrows():
                # Extract information from the row
                vehicle = row['vehicle']
                serviceprovider = row['serviceprovider']
                mapping = row['mapping']
                amount = row['amountmean']
                if not trailers:
                    distance = row['distancemean']

                # Add unique names to the list
                if vehicle not in names:
                    names.append(vehicle)
                if serviceprovider not in names:
                    names.append(serviceprovider)
                if mapping not in names:
                    names.append(mapping)

                # Calculate CPK (or use distance for trailers)
                if trailers:
                    value = amount
                else:
                    if distance > 0:
                        value = (amount * 100) / distance
                    else:
                        value = 0

                # Add links to the list
                links.append({'source': vehicle, 'target': serviceprovider, 'value': value})
                links.append({'source': serviceprovider, 'target': mapping, 'value': value})

            # Create the final data structure
            names = [{'name': name} for name in names]
            return names, links

        maint_veh = sql.SQL('''
        COPY(
        SELECT
            veh_make_map,
            veh_model_map,
            serviceprovider,
            mapping,
            SUM(amount) AS amount,
            julian_month
        FROM
            fleet.maintenance
        WHERE vehiclereg = {assets}
        AND branch = {branch}
        AND julian_month BETWEEN {julian_from} AND {julian_to}
        AND veh_model_map NOT LIKE '%TRAILER%'
        GROUP BY
            julian_month, veh_make_map, veh_model_map, serviceprovider, mapping
        ) TO STDOUT WITH CSV HEADER''').format(
            assets=assets,
            branch=form.singleBranch,
            julian_from=form.julStartMonth,
            julian_to=form.julEndMonth
            )

        trip = sql.SQL('''
        COPY(
        SELECT
            veh_model_map,
            julian_month,
            SUM(distance) AS distance
        FROM fleet.trip_data_daily
        WHERE vehiclereg = {assets}
        AND branch = {branch}
        AND julian_month BETWEEN {julian_from} AND {julian_to}
        GROUP BY veh_model_map, julian_month
        )TO STDOUT WITH CSV HEADER''').format(
            assets=assets,
            branch=form.singleBranch,
            julian_from=form.julStartMonth,
            julian_to=form.julEndMonth
            )

        maint_trailer = sql.SQL('''
        COPY(
        SELECT
            veh_make_map,
            veh_model_map,
            serviceprovider,
            mapping,
            SUM(amount) AS amount,
            julian_month
        FROM
            fleet.maintenance
        WHERE vehiclereg = {assets}
        AND branch = {branch}
        AND julian_month BETWEEN {julian_from} AND {julian_to}
        AND veh_model_map LIKE '%TRAILER%'
        GROUP BY
            julian_month, veh_make_map, veh_model_map, serviceprovider, mapping
        ) TO STDOUT WITH CSV HEADER''').format(
            assets=assets,
            branch=form.singleBranch,
            julian_from=form.julStartMonth,
            julian_to=form.julEndMonth
            )

        data = exc_qrs_get_dfs_raw([maint_veh, trip, maint_trailer])

        vehicles = data[0].merge(data[1], on=['veh_model_map', 'julian_month'])
        vehicles['cpk'] = (vehicles['amount'] * 100) / vehicles['distance']
        vehicles['vehicle'] = (vehicles['veh_make_map']) + ' ' + (vehicles['veh_model_map'].astype(str))
        vehicles.drop(columns=['veh_make_map', 'veh_model_map'], inplace=True)
        vehicles_cpk_pm = vehicles.groupby(['vehicle', 'serviceprovider', 'mapping'], as_index=False).agg({
            'distance': ['mean'],
            'amount': ['mean']
        }).reset_index()
        vehicles_cpk_pm.columns = [''.join(col).strip() for col in vehicles_cpk_pm.columns.values]

        trailers = data[2]
        trailers['vehicle'] = trailers['veh_make_map'] + ' ' + trailers['veh_model_map']
        trailers.drop(columns=['veh_make_map', 'veh_model_map'], inplace=True)
        trailers_amt_pm = trailers.groupby(['vehicle', 'serviceprovider', 'mapping'], as_index=False).agg({
            'amount': ['mean']
        }).reset_index()
        trailers_amt_pm.columns = [''.join(col).strip() for col in trailers_amt_pm.columns.values]

        vehicle_names, vehicle_links = sankey_format(vehicles_cpk_pm, False)
        trailer_names, trailer_links = sankey_format(trailers_amt_pm, True)
        
        sankey_data.data = vehicle_links
        await sankey_data.queue.put(sankey_data)

    except Exception as error:
        await sankey_data.queue.put(None)
        logger.error(f"Error occurred: {error}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return {'vehicle_names': vehicle_names, 'vehicle_links': vehicle_links, 'trailer_names': trailer_names, 'trailer_links': trailer_links}

@stats_router.post(
    "/top_row_overview",
    description='Retrieves avg cost and cpk per supplier, component and asset for stats top row overview'
)
async def top_row_overview(formValues: dict, sankey_data: SankeyData = Depends(wait_for_sankey), user: dict = Depends(validate_token)):

    if sankey_data:
        try:

            if len(sankey_data.data) > 0:
                result = {"vehicle": 0, "supplier": 0, "component": 0}
                counts = {"vehicle": set(), "supplier": set(), "component": set()}

                for entry in sankey_data.data:
                    source = entry["source"]
                    target = entry["target"]
                    value = entry["value"]

                    if source not in formValues["suppliers"]:
                        result["vehicle"] += value
                        counts["vehicle"].add(source)
                    elif source in formValues["suppliers"]:
                        result["supplier"] += value
                        counts["supplier"].add(source)

                    if target not in formValues["suppliers"]:
                        result["component"] += value
                        counts["component"].add(target)

                # Calculate averages
                for key in result:
                    if len(counts[key]) > 0:
                        result[key] /= len(counts[key])
            else:
                result = {"vehicle": 0, "supplier": 0, "component": 0}
        except Exception as error:
            logger.error(f"Error occurred: {error}")
            raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
        return result
    else:
        raise HTTPException(status_code=418, detail="Top Row Overview depends on Sankey Stats. Sankey Stats was not called, or it's data could not be accessed.")

@stats_router.post(
    "/supplier_boxplot",
    description='Retrieves data to draw a box+whisker plot for spend per supplier',
)
def supplier_boxplot(formValues: dict, user: dict = Depends(validate_token)):

    form = FormValues(formValues)

    query = sql.SQL("""
        COPY(
        SELECT
            serviceprovider,
            amount
        FROM
            fleet.maintenance
        WHERE vehiclereg = ANY({reg})
        AND branch = {branch}
        AND julian_month BETWEEN {julian_start} AND {julian_end}
        )TO STDOUT WITH CSV HEADER""").format(
            reg=form.registrations,
            julian_start=form.julStartMonth,
            julian_end=form.julEndMonth,
            branch=form.singleBranch
            )
    try:
        data = exc_qrs_get_dfs_raw([query])[0]
        boxplot = calculate_boxplot_stats(data, 'serviceprovider', 'amount')
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return boxplot

@stats_router.post(
    "/component_boxplot",
    description='Retrieves data to draw a box+whisker plot for spend per component'
)
def component_boxplot(formValues: dict, user: dict = Depends(validate_token)):

    form = FormValues(formValues)

    query = sql.SQL("""
        COPY(
        SELECT
            mapping,
            amount
        FROM
            fleet.maintenance
        WHERE vehiclereg = ANY({reg})
        AND branch = {branch}
        AND julian_month BETWEEN {julian_start} AND {julian_end}
        )TO STDOUT WITH CSV HEADER""").format(
            reg=form.registrations,
            julian_start=form.julStartMonth,
            julian_end=form.julEndMonth,
            branch=form.singleBranch
            )
    try:
        data = exc_qrs_get_dfs_raw([query])[0]
        boxplot = calculate_boxplot_stats(data, 'mapping', 'amount')
    except Exception as error:
        logger.error(f"Error occurred: {error}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return boxplot
