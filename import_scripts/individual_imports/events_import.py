import glob, os
import pandas as pd
import psycopg2
import os
from ..db_con import connect_to_db

event_sql_file = "//home//admin//server//mcomm-neuronet//import_scripts//sql//event.sql"

temp_csv_file = '//tmp//Wesbank_Imports//tmp_import_csvs//event_temp.csv'

files = glob.glob(
        "//tmp//Wesbank_Imports//Detailed Event Report*.csv")


def delete_processed_event_data_file():
    for file in files:
        os.remove(file)

def import_events_data_files():
    total_events_df = pd.DataFrame()    
    print("Detailed events Report")
    conn = connect_to_db()
    cur = conn.cursor()

    for file in files:
        print(file)
        df = pd.read_csv(file)  
        
        df['division'] = None
        df['branch'] = None
        df['veh_type_map'] = None
        df['veh_make_map'] = None
        df['julian_month'] = '2020-01-01'
        df['veh_model_map'] = None
        df['fleet_no'] = None

        # Split the 'StartLatLong' column into two separate columns for latitude and longitude
        df[['start_lat', 'start_lon']] = df['StartLatLong'].str.split(' , ', expand=True)
        # remove all null event-key rows
        df.dropna(subset=['EventKey'], inplace=True)
        # Remove any commas and extra spaces from the 'start_lat' and 'start_lon' columns
        df['start_lat'] = df['start_lat'].str.replace(',', '').str.strip()
        df['start_lon'] = df['start_lon'].str.replace(',', '').str.strip()
        df['EventValue'] = df['EventValue'].str.replace(',', '.').str.replace(r'\s+', '', regex=True)
        #replace commma from start od and end odo and remopve spaces
        # df['StartOdo'] = df['StartOdo'].str.replace(',', '.').str.replace(' ', '').str.strip()
        # df['EndOdo'] = df['EndOdo'].str.replace(',', '.').str.replace(' ', '').str.strip()
        df['StartOdo'] = df['StartOdo'].str.replace(',', '.').str.replace(r'\s+', '', regex=True)
        df['EndOdo'] = df['EndOdo'].str.replace(',', '.').str.replace(r'\s+', '', regex=True)
        df['FuelUsed'] = df['FuelUsed'].str.replace(',', '.').str.replace(r'\s+', '', regex=True)
        df['DistanceCalculatedFromOdo'] = df['DistanceCalculatedFromOdo'].str.replace(',', '.').str.replace(r'\s+', '', regex=True)
        df['F_StartStreet'] = df['F_StartStreet'].str.replace('\'', '', regex=True)
        df['F_EndStreet'] = df['F_StartStreet'].str.replace('\'', '', regex=True)
        #replace nans with 0 timestamps
        df['TotalDuration'] = df['TotalDuration'].fillna('0:00:00')
        # Display the first few rows to verify the changes
        # print(df[['StartLatLong', 'start_lat', 'start_lon']].head())
        df = df[['AssetSiteName', 'ReportGroup', 'AssetName', 'AssetExtra', 'AssetID', 'FleetNumber', 'EventKey', 'EventDescription', 'EventType', 'EventStartDate', 'EventStartTime', 
                'EventEndDate', 'EventEndTime', 'TotalOccurs', 'EventValue', 'MeasurementUnits', 'RoadSpeedLimit', 'EventLocation', 'TotalDuration', 'StartOdo', 'EndOdo', 'F_StartStreet', 'F_StartSuburb', 'F_StartRegion',
                'F_EndStreet', 'F_EndSuburb', 'F_EndRegion', 'StartLocation', 'EndLocation', 'StartLatLong', 'EndLatLong', 'DistanceCalculatedFromOdo', 'julian_month', 'division', 'branch', 'veh_type_map', 
                'fleet_no', 'veh_make_map', 'veh_model_map', 'start_lat', 'start_lon']]
        total_events_df = pd.concat([total_events_df, df], ignore_index=True)       


    print(total_events_df)
    total_events_df.to_csv(temp_csv_file, index=False)
    temp_table_query = f"""
    copy temp.events_temp from '{temp_csv_file}' CSV HEADER;          
    """

    cur.execute(temp_table_query)

    with open(event_sql_file, 'r') as sql_file:
        cur.execute(sql_file.read())

    conn.commit()
    os.remove(temp_csv_file)
        # os.remove(file)
        # os.move(file, f'C://Users//Administrator//Desktop//mix dailies//processed//{os.path.basename(file)}"')
    print('done')
    conn.close()
