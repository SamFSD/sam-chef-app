from fastapi import APIRouter, Depends
from psycopg2 import sql
from ..v0.auth import validate_token
from .preprocessing_functions import update_julian_month_for_accrual_graph, update_daily_vehicles_trip,update_fleetlist_tables, update_julian_month_in_driving_events,update_orders_based_on_julian_month,populate_per_assets_cost_cpk_table,maintenance_cancelled_table, dashboard_pre_processing, update_month_cost_per_asset_table, shoprite_txn_temp_processing,preprocess_api_call,maintenance_table_update

preprocessing = APIRouter()

@preprocessing.get('/update_julian_month_for_accrual_graph', description = 'update julian month for txn accrual graph')
def update_julian_month_txn_table(user: dict = Depends(validate_token)):
    return update_julian_month_for_accrual_graph

@preprocessing.get('/update_trip_data_daily', description = 'update trip data daily')
def update_trip_data_table(user: dict = Depends(validate_token)):
    return update_daily_vehicles_trip()

@preprocessing.get('/update_fleetlist_table', description = 'update fleetlist table')
def update_fleetlist_table(user: dict = Depends(validate_token)):
    return update_fleetlist_tables()

@preprocessing.get('/update_julian_month_for_driving_events', description = 'update julian month in driving event')
def update_julian_month_for_driving_events(user: dict = Depends(validate_token)):
    return update_julian_month_in_driving_events()

@preprocessing.get('/update_orders_based_on_julian_month', description='update orders based on julian month')
def get_update_orders_per_julian_month(user: dict = Depends(validate_token)):
    return update_orders_based_on_julian_month


@preprocessing.get('/populate_per_assets_cost_cvpk_table', description = 'populate per asset cpk/costs table')
def per_assets_cost_cpk_table(user: dict = Depends(validate_token)):
    return populate_per_assets_cost_cpk_table()

@preprocessing.get('/preprocessing all', description="Preprocessing API")
def preprocessing_endpoint(user: dict = Depends(validate_token)):
    # call all pre processing 
    return preprocess_api_call()


@preprocessing.get('/maintenance_table_update', description = "Run Pre Processing to get Maintenance Table")
def get_maintenance_table_update(user: dict = Depends(validate_token)):
    return maintenance_table_update()



@preprocessing.get('/update_orders_invoice_amounts',
                    description = "Run Pre Processing to update orders invoice amounts")
def get_invoice_amounts_updates(user: dict = Depends(validate_token)):
    return update_order_invoice_amounts()


@preprocessing.get('/shoprite_txn_temp_processing',
                    description = "Run Pre Processing to update txn temp processing")
def get_shoprite_txn_temp_processing(user: dict = Depends(validate_token)):
    return shoprite_txn_temp_processing()


@preprocessing.get('/update_month_cost_per_asset_table', 
                   description = 'run pre processing to update cost per assets table')
def get_month_cost_per_assets_table(user: dict = Depends(validate_token)):
    return update_month_cost_per_asset_table()


@preprocessing.get('/dashboard_preprocessing', 
                   description = 'update dashboard table - preprocessing')
def get_dashboard_preprocessing(user: dict = Depends(validate_token)):
    return dashboard_pre_processing()

@preprocessing.get('/maintenance_update_cancelled_table', description = 'maintenance cancelled table')
def get_maintenance_cancelled_table(user: dict = Depends(validate_token)):
    return maintenance_cancelled_table
    

    
