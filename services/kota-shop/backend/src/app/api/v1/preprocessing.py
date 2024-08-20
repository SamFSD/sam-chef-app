import traceback
from fastapi import APIRouter,HTTPException, status
from fastapi.responses import PlainTextResponse
from psycopg2 import sql
import os

from ..v0.db_config import exc_qrs_get_dfs_raw


########### Files Path declaration using os ##########
current_dir = os.path.dirname(os.path.realpath(__file__))

#### all the sql files ##########
update_trip_date_tables = os.path.join(current_dir, 'update_trip_data_table.sql')
maintenance_table_update = os.path.join(current_dir, 'maintenance_table_update.sql')
update_fleet_orders = os.path.join(current_dir, 'update_fleet_orders.sql')
update_fleetlist_tables = os.path.join(current_dir, 'update_fleetlist_table.sql')
update_julian_month_in_driving_events = os.path.join(current_dir, 'update_driving_events_table.sql')
supplier_per_branch_from_maint = os.path.join(current_dir, 'update_supplier_per_branch_table.sql')
populate_per_assets_cost_cpk_table = os.path.join(current_dir, 'update_assets_summary_table.sql')
dashboard_pre_processing = os.path.join(current_dir, 'update_dashboard_table.sql')
update_month_cost_per_asset_table = os.path.join(current_dir, 'update_month_cost_per_assets_table.sql')



preprocessing = APIRouter()

# @preprocessing.get('/update_all_tables', description = 'Update all tables')
# def run_all_preprocessing():   
       

########## Pre Processing functions to update fleet orders table  ##############
def execute_update_maintenance_sql():
    try:         
        with open(maintenance_table_update, 'w') as sql_file:        
            exc_qrs_get_dfs_raw([sql_file.read()])
    except Exception as e:
        print(f"An error occurred: {e}")
        return HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return PlainTextResponse("Updated Maintenance Table Successfully", status_code=200)

########## Pre Processing functions to update dashboard table  ##############
def execute_update_dashboard_sql():
    try:         
        with open(dashboard_pre_processing, 'w') as sql_file:        
            exc_qrs_get_dfs_raw([sql_file.read()])
    except Exception as e:
        print(f"An error occurred: {e}")
        return HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return PlainTextResponse("Updated Dashboard Table Successfully", status_code=200)

########## Pre Processing functions to update fleet orders table  ##############
def execute_update_fleetlist_sql():
    try:         
        with open(update_fleetlist_tables, 'w') as sql_file:        
            exc_qrs_get_dfs_raw([sql_file.read()])
    except Exception as e:
        print(f"An error occurred: {e}")
        return HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return PlainTextResponse("Updated fleetlist Table Successfully", status_code=200)

########## Pre Processing functions to update fleet orders table  ##############
def execute_update_fleet_orders_sql():
    try:         
        with open(update_fleet_orders, 'w') as sql_file:        
            exc_qrs_get_dfs_raw([sql_file.read()])
    except Exception as e:
        print(f"An error occurred: {e}")
        return HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return PlainTextResponse("Updated fleet orders Table Successfully", status_code=200)

##############################################################################
########## Pre Processing endpoint to update maintenance table  ##############
##############################################################################
@preprocessing.get('/update_maintenance_tables', description='update maintenance tables')
def update_maintenance_tables():
    return execute_update_maintenance_sql()

##############################################################################
########## Pre Processing endpoint to update fleetlist table    ##############
##############################################################################
@preprocessing.get('/update_fleetlist_table', description='update fleetlist table')
def update_fleetlist_table():
    return execute_update_fleetlist_sql()

###############################################################################  
########## Pre Processing endpoint to update fleet orders table  ##############
###############################################################################
@preprocessing.get('/update_fleet_orders_tables', description='update fleet orders tables')
def update_fleet_orders_tables():
    return execute_update_fleet_orders_sql()

###############################################################################  
########## Pre Processing endpoint to update dashboard table  ##############
###############################################################################
@preprocessing.get('/update_dashboard_tables', description='update dashboard tables')
def update_dashboard_tables():
    return execute_update_fleet_orders_sql()






    
