import traceback
from .db_config import exc_qrs_get_dfs_raw,  exec_query
from .helpers import fin_year_start
import pandas as pd
from psycopg2 import sql
import json
from sqlite3 import IntegrityError
from .form_class import FormValues
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends
from .auth import validate_token

dt_router = APIRouter()

@dt_router.post(
    "/add_dt",
    description='Add a downtime event'
)
def add_dt(data: dict, user: dict = Depends(validate_token)):
    try:
        fleet_no = data["fleet_no"]
        vehiclereg = data["vehiclereg"]
        branch = data["branch"]
        supplier = data["supplier"]
        odo = data["odo"]
        reason = data["reason"]
        start_date = data["start_date"]
        est_end_date = data["est_end_date"]

        query = sql.SQL(f"""
            INSERT INTO fleet.downtime (
                fleet_no, vehiclereg, branch, supplier, odo, reason, start_date, est_end_date
                )
            VALUES (
                '{fleet_no}', '{vehiclereg}', '{branch}', '{supplier}', '{odo}', '{reason}', '{start_date}', '{est_end_date}' 
            )
            """)
        log_event('create', user=user['email'])
        exec_query(query)
        updateFromFleetlist(vehiclereg)

    except Exception as e:
        print(f'An error occurred: {e}')
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )
    
@dt_router.post("/get_dt_grid", description="Downtime grid")
def get_dt_grid(formValues: dict, user: dict = Depends(validate_token)):
    form = FormValues(formValues)
    try:
        query = sql.SQL(
            """COPY(SELECT * FROM fleet.downtime
                    WHERE branch = {branch}
                    AND start_date BETWEEN (SELECT jul_from_date FROM fleet.julian_cal WHERE selected_month = {from_date}) AND (SELECT jul_to_date FROM fleet.julian_cal WHERE selected_month = {to_date})
                    ) TO STDOUT WITH CSV HEADER""").format(branch=form.singleBranch, from_date=form.julStartMonth, to_date=form.julEndMonth)

        results = exc_qrs_get_dfs_raw([query])[0].to_dict('records')
        processed_data = []
        current_date = datetime.now()
        for row in results:
            start_date = datetime.strptime(row['start_date'], '%Y-%m-%d')
            end_date = datetime.strptime(row.get('end_date', ''), '%Y-%m-%d') if row.get('end_date') else None
            est_end_date = datetime.strptime(row['est_end_date'], '%Y-%m-%d')
            
            # Compute status
            status = 'Active' if end_date and end_date <= current_date else 'Inactive'
            
            # Compute downtime
            if end_date:
                downtime = (end_date - start_date).days
            else:
                downtime = (datetime.now() - start_date).days
            
            # Compute remaining
            remaining = (est_end_date - start_date).days
            
            processed_row = {
                'fleet_no': row['fleet_no'],
                'vehiclereg': row['vehiclereg'],
                'status': status,
                'type': row['type'],
                'make': row['make'],
                'model': row['model'],
                'supplier': row['supplier'],
                'odo': row['odo'],
                'reason': row['reason'],
                'start_date': row['start_date'],
                'est_end_date': row['est_end_date'],
                'end_date': row.get('end_date', ''),
                'downtime': downtime,
                'remaining': remaining,
                'uid': row['uid'],
            }
            processed_data.append(processed_row)
        return processed_data
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )
    
@dt_router.post('/update_dt_grid', description='Updates an entry in the downtime grid')
def update_dt_grid(data: dict, user: dict = Depends(validate_token)):
    try:
        fleet_no = data["fleet_no"]
        vehiclereg = data["vehiclereg"]
        branch = data["branch"]
        supplier = data["supplier"]
        odo = data["odo"]
        reason = data["reason"]
        start_date = data["start_date"]
        est_end_date = data["est_end_date"]
        uid = data["uid"]

        query = sql.SQL(f"""
            UPDATE fleet.downtime
            SET
                fleet_no = '{fleet_no}',
                vehiclereg = '{vehiclereg}',
                branch = '{branch}',
                supplier = '{supplier}',
                odo = '{odo}',
                reason = '{reason}',
                start_date = '{start_date}',
                est_end_date = '{est_end_date}'
            WHERE
                uid = '{uid}'
                """)
        log_event('update', uid, user['email'])
        exec_query(query)
        updateFromFleetlist(vehiclereg, uid)
    except IntegrityError as e:
        if "Error occurred" in str(e):
            raise HTTPException(
                status_code=400,
                detail={"error_code": "400", "message": "Double Check The record"},
            )
        else:
            raise HTTPException(
                status_code=400,
                detail={"error_code": "400", "message": "Double Check The record"},
            )

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )
    
@dt_router.post("/end_dt_record", description='Adds final end date to a downtime record')
def end_dt_record(uid: str, date: str, user: dict = Depends(validate_token)):
    try:
        
        query = sql.SQL(f"""
            UPDATE fleet.downtime
            SET end_date = '{date}'
            WHERE uid = '{uid}'""")
        log_event('finalize', uid, user['email'])
        exec_query(query)
    except IntegrityError as e:
        if "Error occurred" in str(e):
            raise HTTPException(
                status_code=400,
                detail={"error_code": "400", "message": "Double Check The record"},
            )
        else:
            raise HTTPException(
                status_code=400,
                detail={"error_code": "400", "message": "Double Check The record"},
            )

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )
    
def updateFromFleetlist(vehiclereg: str, uid: str = None):
    if uid:
        query = sql.SQL(f"""
            UPDATE fleet.downtime AS d
            SET
                make = fl.make,
                model = fl.veh_model_map,
                type = fl.veh_type_map
            FROM fleet.fleetlist AS fl
            WHERE d.vehiclereg = fl.vehiclereg
            AND d.uid = '{uid}'
            """)
    else:
        query = sql.SQL(f"""
            UPDATE fleet.downtime AS d
            SET
                make = fl.make,
                model = fl.veh_model_map,
                type = fl.veh_type_map
            FROM fleet.fleetlist AS fl
            WHERE d.vehiclereg = fl.vehiclereg
            """)
    
    try:
        exec_query(query)
    except IntegrityError as e:
        if "Error occurred" in str(e):
            raise HTTPException(
                status_code=400,
                detail={"error_code": "400", "message": "Double Check The record"},
            )
        else:
            raise HTTPException(
                status_code=400,
                detail={"error_code": "400", "message": "Double Check The record"},
            )

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )
    
def log_event(action: str = ('create', 'update', 'finalize'), uid: str = None, user: str = None):
    match action:
        case 'create':
            uid = get_next_uid()
            query = sql.SQL(f"""
                INSERT INTO fleet.dt_logs (
                uid, action, "user", datetime)
                VALUES (
                '{uid}', 'create', '{user}', '{datetime.now()}'
                )""")
        case 'update':
            prev_values = get_prev_values(uid)
            query = sql.SQL(f"""
                INSERT INTO fleet.dt_logs (
                uid, action, "user", datetime, previous_value)
                VALUES (
                '{uid}', 'update', '{user}', '{datetime.now()}', '{prev_values}'
                )""")
        case 'finalize':
            query = sql.SQL(f"""
                INSERT INTO fleet.dt_logs (
                uid, action, "user", datetime)
                VALUES (
                '{uid}', 'finalize', '{user}', '{datetime.now()}'
                )""")
    try:    
        exec_query(query)
    except IntegrityError as e:
        if "Error occurred" in str(e):
            raise HTTPException(
                status_code=400,
                detail={"error_code": "400", "message": "Double Check The record"},
            )
        else:
            raise HTTPException(
                status_code=400,
                detail={"error_code": "400", "message": "Double Check The record"},
            )

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )
    
def get_next_uid():
    query = sql.SQL("COPY(SELECT nextval('fleet.downtime_uid_seq')) TO STDOUT WITH CSV HEADER")
    try:
        uid = exc_qrs_get_dfs_raw([query])[0].to_dict('records')[0]
        return uid['nextval']
    except IntegrityError as e:
        if "Error occurred" in str(e):
            raise HTTPException(
                status_code=400,
                detail={"error_code": "400", "message": "Double Check The record"},
            )
        else:
            raise HTTPException(
                status_code=400,
                detail={"error_code": "400", "message": "Double Check The record"},
            )

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )

def get_prev_values(uid: str):
    query = sql.SQL(f"COPY(SELECT * FROM fleet.downtime WHERE uid = '{uid}') TO STDOUT WITH CSV HEADER")
    try:
        res = exc_qrs_get_dfs_raw([query])[0].to_dict('records')[0]
        return json.dumps(res)
    except IntegrityError as e:
        if "Error occurred" in str(e):
            raise HTTPException(
                status_code=400,
                detail={"error_code": "400", "message": "Double Check The record"},
            )
        else:
            raise HTTPException(
                status_code=400,
                detail={"error_code": "400", "message": "Double Check The record"},
            )

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error Details: {traceback.format_exc()}"
        )