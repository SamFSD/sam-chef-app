import glob, os
import pandas as pd
import psycopg2
import os
from ..db_con import connect_to_db

temp_csv_file = '//tmp//Wesbank_Imports//tmp_import_csvs//trip_temp.csv'

input_files = glob.glob(
        "//tmp//Wesbank_Imports//Daily Trip Report*.csv")

trip_sql_file = (
    "//home//admin//server//mcomm-neuronet//import_scripts//sql//trip_data.sql"
)

def delete_processed_trip_data_files():
    for file in input_files:
        os.remove(file)


def import_trip_data_files():
    total_df = pd.DataFrame()    
    print("hello")
    conn = connect_to_db()
    cur = conn.cursor()
    print('ok')
    for file in input_files:
        print(file)
        df = pd.read_csv(file, delimiter=',')
        df['julian_month'] = '2020-01-01'
        
        # Replace commas with periods, remove all kinds of spaces, and convert to float
        df['TotalDistanceTravelled'] = df['TotalDistanceTravelled'].str.replace(',', '.').str.replace(r'\s', '', regex=True).astype(float)
        df['start_odo'] = df['StartOdoMeter'].str.replace(',', '.').str.replace(r'\s', '', regex=True).astype(float)
        df['end_odo'] = df['EndOdoMeter'].str.replace(',', '.').str.replace(r'\s', '', regex=True).astype(float)
        df['first_trip_start_time'] = df['FirstTripStartTime']
        df['last_trip_end_time'] = df['LastTripEndTime']
        df['driving_time_percentage'] = df['DrivingTimePercentage'].str.replace('%', '').astype(float)
        df['standing_time_percentage'] = df['standingTimePercentage'].str.replace('%', '').astype(float)
        df['idle_time_percentage'] = df['IdleTimePercentage'].str.replace('%', '').astype(float)
        df['total_driving_time'] = df['TotalDrivingTime']
        df['total_standing_time'] = df['TotalStandingTime']
        df['total_duration'] = df['TotalDuration']
        df['total_idle_time'] = df['TotalIdleTime']
        df['parking_time'] = df['ParkingTime']
        df['total_engine_hours'] = df['TotalEngineHours']
        df['average_speed'] = df['AverageSpeed'].str.replace(',', '.').str.replace(r'\s', '', regex=True).astype(float)
        df['max_speed'] = df ['MaxSpeed'].str.replace(',', '.').str.replace(r'\s', '', regex=True).astype(float)
        df['number_of_trips'] = df['NumberOfTrips']

        df[['vehicle_type_map', 'branch', 'division', 'contract_type', 'veh_make_map', 'veh_model_map', 'fleet_no' ]] = 'Unknown'
        df = df[['Date', 'AssetExtra', 'TotalDistanceTravelled','vehicle_type_map', 'branch', 'division', 'contract_type', 'veh_make_map', 'veh_model_map',  'julian_month', 'fleet_no', 'start_odo', 'end_odo', 
                'first_trip_start_time', 'last_trip_end_time', 'driving_time_percentage', 'standing_time_percentage', 'idle_time_percentage', 'total_driving_time', 'total_standing_time', 'total_duration', 'total_idle_time', 
                'parking_time', 'total_engine_hours', 'average_speed', 'max_speed', 'number_of_trips']]
        total_df = pd.concat([total_df, df], ignore_index=True)
       
    print(total_df)
    total_df.to_csv(temp_csv_file, index=False)

    temp_table_query = f"""
    copy temp.trip_temp from '{temp_csv_file}' CSV HEADER;          
    """  

    cur.execute(temp_table_query)

    with open(trip_sql_file, 'r') as sql_file:
        cur.execute(sql_file.read())

    conn.commit()
    os.remove(temp_csv_file)
        # os.remove(file)
        # os.move(file, f'C://Users//Administrator//Desktop//mix dailies//processed//{os.path.basename(file)}"')
    print('done')
    conn.close()


# if __name__ == 'main':

# import_trip_data_files()
#
# getmails()
