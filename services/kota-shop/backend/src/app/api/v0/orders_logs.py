
from datetime import datetime
from http.client import HTTPException
import traceback
from psycopg2 import sql
from .db_config import exc_qrs_get_dfs_raw, exec_query
import json
from typing import List

def get_orders_logs(order_no: str, user: str, action: str, prev_value: List[str]):
    try:        
        time = datetime.now()
        time = time.strftime("%Y-%m-%d %H:%M:%S")
        log_rows = sql.SQL("""
                COPY(
                SELECT *
                FROM fleet.orders
                WHERE order_no = {order_no}
                UNION
                SELECT *
                FROM fleet.orders_non_miles
                WHERE order_no = {order_no}
                ) TO STDOUT WITH CSV HEADER
            """).format(order_no=sql.Literal(order_no))
        res = exc_qrs_get_dfs_raw([log_rows])[0].to_dict("records")
        prev_value = json.dumps(res)
        log = sql.SQL("""
            INSERT INTO fleet.orders_logs (order_no, action, "user", time_of_action, previous_value)
            VALUES ({order_no}, {action}, {user}, {time}, {previous_value})
        """).format(
            order_no=sql.Literal(order_no),
            action=sql.Literal(action),
            user=sql.Literal(user),
            time=sql.Literal(time),
            previous_value=sql.Literal(prev_value))    
        exec_query(log)
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
   

    
