####### Function that gets the DB connection ###############

from typing import List, Dict, Any
import pandas as pd
import psycopg2 as pg
import io
from psycopg2 import sql
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()  

##### connections params #####
db = {
    'db': os.getenv('db'),
    'user': os.getenv('user'),
    'pass': os.getenv('pass'),
    'host': os.getenv('host'),
    'port': os.getenv('port')
}


def exc_qrs_get_dfs_raw(query_list: List[str]) -> List[pd.DataFrame]:
    """Excute the list of queries as sql and returns dataframes all in their native types

    :param str query_list: list of sql strings
    :param enum db: which db to use eg: `db="MFA")` or `db="QRS")`
    """

    con = None
    response = []
    # try:
    # con = pg.connect(**db.value.dict())
    con = pg.connect(    
        database=db["db"],
        user=db["user"],
        password=db["pass"],
        host=db["host"],
        port=db["port"],
    )
    cur = con.cursor()
    for query in query_list:
        store = io.StringIO()
        cur.copy_expert(query, store)
        store.seek(0)
        df = pd.read_csv(store, na_filter=False)
        response.append(df)
    con.commit()
    cur.close()
    if con:
        con.close()

    return response

  ###### this is for orders inserts ####### 
def exec_query(query):
    con = pg.connect(
      database=db["db"],
        user=db["user"],
        password=db["pass"],
        host=db["host"],
        port=db["port"],
    )

    cur = con.cursor()
    cur.execute(query)
    con.commit()
    cur.close()
    if con:
        con.close()


 ### return db connection #####
def return_connection():
     return pg.connect(
        database=db["db"],
        user=db["user"],
        password=db["pass"],
        host=db["host"],
        port=db["port"],)
        