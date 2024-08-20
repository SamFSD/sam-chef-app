import traceback
from .db_config import exc_qrs_get_dfs_raw
from psycopg2 import sql
from fastapi import APIRouter,HTTPException, Depends
from .auth import validate_token


date_management_router = APIRouter()

@date_management_router.get(
    "/get_julian_month",
    description="Gets Julian month for a single given date",
 
)
def get_julian_month(date: str, user: dict = Depends(validate_token)):
    try:

        query = """
            COPY(
            SELECT selected_month, jul_from_date, jul_to_date FROM fleet.julian_cal
            WHERE '{date}' BETWEEN jul_from_date AND jul_to_date
            ) TO STDOUT WITH CSV HEADER
            """.format(
            date=date
        )
        query = sql.SQL(query)
        response = exc_qrs_get_dfs_raw([query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response
# //get julian month range. returns from date, to date and from/to julian months for a given two months
@date_management_router.get(
    "/get_julian_month_range",
    description="Gets Julian month for a single given date",
 
)
def get_julian_month_range(from_month: str, to_month: str, user: dict = Depends(validate_token)):
    try:
        query = sql.SQL(
            """
            COPY(
            select min(jul_from_date) as jul_start_date, max(jul_to_date) as jul_end_date, min(selected_month) as jul_start_month, max(selected_month) as jul_end_month from (    SELECT selected_month, jul_from_date, jul_to_date FROM fleet.julian_cal
            WHERE ({from_month} BETWEEN jul_from_date AND jul_to_date)
            or ({to_month} BETWEEN jul_from_date AND jul_to_date)
            order by selected_month asc) x
            
            ) TO STDOUT WITH CSV HEADER
            """
        ).format(from_month=sql.Literal(from_month), to_month=sql.Literal(to_month))

        response = exc_qrs_get_dfs_raw([query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}") 
    return response

@date_management_router.get(
    "/sho002_get_julian_data",
    description="get julian from date and julian to date from selected month",
 
)
def sho002_get_julian_data(month: str, user: dict = Depends(validate_token)):
    try:
        julian_query = sql.SQL(
            """COPY(
                            SELECT 
                            jul_to_date,
                            jul_from_date 
                            from fleet.julian_cal
                            where selected_month = {month}
                            ) TO STDOUT WITH CSV HEADER"""
        ).format(month=sql.Literal(month))
        response = exc_qrs_get_dfs_raw([julian_query])[0]
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response.to_dict("records")

