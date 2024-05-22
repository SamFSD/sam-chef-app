import psycopg2 as pg
import io
from psycopg2 import sql
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()  

db = {
    'db': os.getenv('db'),
    'user': os.getenv('user'),
    'pass': os.getenv('pass'),
    'host': os.getenv('host'),
    'port': os.getenv('port')
}

def connect_to_db():
    con = pg.connect(
      database=db["db"],
        user=db["user"],
        password=db["pass"],
        host=db["host"],
        port=db["port"],
    )
    
    return con