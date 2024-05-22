from fastapi import APIRouter, HTTPException, Depends
import traceback, json
from .db_config import exc_qrs_get_dfs_raw
from psycopg2 import sql
import traceback
from .form_class import FormValues
from .auth import validate_token
import pandas as pd

# from .form_model import FormModel

drivers_router = APIRouter()

@drivers_router.post(
    "/get_drivers_events_table",
    description="Get Drivers Events Table",
)
def get_drivers_events_table(formValues: dict, user: dict = Depends(validate_token)):
    # try:
    form = FormValues(formValues)
    # print("zzzz", form.registrations)
    monthly_cost_query = sql.SQL(
        """COPY(
        select 
            division, 
            vehiclereg,
            event_description,             
            event_start_date || ' ' || event_start_time as event_date,
            f_start_street || ' ' || f_start_suburb || ' ' || f_start_region as event_region,
            fleet_no,
            veh_type_map,
            veh_model_map, 
            julian_month, 
            asset_name,
            start_lat, start_lon,
            event_key,
            road_speed_limit,
            event_value || ' ' || measurement_units as event_values           
        from fleet.driving_events
            where 
                vehiclereg = any({registrations})
            and
                (julian_month BETWEEN {julian_from} AND {julian_to})
        )TO STDOUT WITH CSV HEADER"""
    ).format(
        julian_from=form.julStartMonth,
        julian_to=form.julEndMonth,
        registrations=form.registrations,
    )
    response = exc_qrs_get_dfs_raw([monthly_cost_query])[0].to_dict("records")
    # print("xxxxxx", response)
    # except Exception as e:
    #     print(f"An error occurred: {e}")
    #     raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response


@drivers_router.post("/get_drivers_stats_top_row", description="get drivers events stats top row")
def get_drivers_stats_top_row(formValues: dict, user: dict = Depends(validate_token)):
    try:
        formValues = FormValues(formValues)
        query = sql.SQL(
            """COPY(
            select 
                distinct vehiclereg,
                fleet_no,
                division, 
                branch,
                veh_type_map, 
                veh_make_map,
                sum ( case when event_description = 'Severe Impact' or event_description = 'Moderate Impact' or event_description = 'Impact' then 1 else 0 end) as impact_count,
                sum ( case when event_description = 'Acceleration' then 1 else 0 end) as acceleration_count,
                sum ( case when event_description = 'Braking' then 1 else 0 end) as braking_count, 
                sum ( case when event_description = 'Speeding' then 1 else 0 end) as overspeeding_count, 
                sum ( case when event_description = 'Cornering' then 1 else 0 end) as harsh_cornering_count,
                sum ( case when event_description = 'Idling' then 1 else 0 end) as idling_count
            from fleet.driving_events
                where 
                    vehiclereg = any({registrations}) 
                and  
                    (julian_month BETWEEN {julian_from} AND {julian_to})
            group by vehiclereg,fleet_no,division,branch,veh_type_map,veh_make_map
            )TO STDOUT WITH CSV HEADER"""
        ).format(
            julian_from=formValues.julStartMonth,
            julian_to=formValues.julEndMonth,
            registrations=formValues.registrations,
        )
        response = exc_qrs_get_dfs_raw([query])[0].to_dict("records")
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response


@drivers_router.post(
    "/get_events_details_pav_page",
    description="get driving events map",
)
def get_events_details_pav_page(formValues: dict, user: dict = Depends(validate_token)):
    try:
        form = FormValues(formValues)
        event_count_query = sql.SQL(
            """COPY(
            SELECT 
                *  
            FROM fleet.driving_events
                where
                    vehiclereg = {vehiclereg} 
                and
                    (julian_month BETWEEN {julian_from} AND {julian_to})
            )TO STDOUT WITH CSV HEADER"""
        ).format(
            julian_from=form.julStartMonth,
            julian_to=form.julEndMonth,
            vehiclereg=form.singleReg,
        )
        response = exc_qrs_get_dfs_raw([event_count_query])[0].to_dict("records")

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response


@drivers_router.post("/get_bi_scores", description="Get BI Scores")
def get_bi_scores(formValues: dict, user: dict = Depends(validate_token)):
    # get bi scores per vehicle per month
    # try:
    form = FormValues(formValues)
    bi_scores_query = sql.SQL(
        """COPY(
        SELECT 
            vehiclereg,
            julian_month,
            bi_scores,
            fleet_no,
            veh_type_map,
            veh_model_map
        FROM fleet.driving_score
            where
                (julian_month BETWEEN {julian_from} AND {julian_to})
            and
                 vehiclereg = any({vehiclereg})
        )TO STDOUT WITH CSV HEADER"""
    ).format(
        julian_from=form.julStartMonth,
        julian_to=form.julEndMonth,
        vehiclereg=form.registrations,
    )
    response = exc_qrs_get_dfs_raw([bi_scores_query])[0]

    ##get avg scores for each event across all returned records
    def parse_all_bi_scores(
        row,
    ):  # take each bi_scores json object from the df and add it to dictionary
        bi_scores = json.loads(row["bi_scores"])
        parsed_data = {}

        for key, value in bi_scores.items():
            if isinstance(value, dict):
                parsed_data[f"{key.lower().replace(' ', '_')}_count"] = value.get(
                    "count", 0
                )
                parsed_data[f"{key.lower().replace(' ', '_')}_score"] = value.get(
                    "score", 0
                )

        return parsed_data

    # Apply the function to each row and create a new DataFrame
    try:  # this will fail if there are no records returned
        all_bi_scores_parsed = response.apply(parse_all_bi_scores, axis=1)
        print("c")
        print(all_bi_scores_parsed)
        # create df tof all scores per vehiclereg to pull mean scores and totals counts from (drop the vehiclereg column)
        all_bi_scores_df = pd.DataFrame(all_bi_scores_parsed.tolist())

        print(all_bi_scores_df)
        # pull mean and sum only on numeric columns
        # get the mean across all _score columns
        numeric_df = all_bi_scores_df.select_dtypes(include=["number"])

        avg_all_scores = numeric_df.mean()
        total_all_counts = numeric_df.sum()
        # Calculate the average score and total count for each event type
        # avg_all_scores = all_bi_scores_df.mean()
        print(avg_all_scores)
        # total_all_counts = all_bi_scores_df.sum()
        print(total_all_counts)
        # per_veh_df = (
        #     all_bi_scores_df.groupby("vehiclereg")
        #     .mean()
        #     .reset_index()
        #     .to_dict("records")
        # )
    except Exception as e:
        print(f"An error occurred: {e}")
        avg_all_scores = {
            "total_score": 100,
            "acceleration_score": 100,
            "braking_score": 100,
            "cornering_score": 100,
            "speeding_score": 100,
            "idling_score": 100,  # added idling score
            "severe_impact_score": 100,
            "moderate_impact_score": 100,
            "impact_score": 100,
        }
        total_all_counts = {
            "total_count": 0,
            "acceleration_count": 0,
            "braking_count": 0,
            "cornering_count": 0,
            "speeding_count": 0,
            "idling_count": 0,  # added idling count
            "severe_impact_count": 0,
            "moderate_impact_count": 0,
            "impact_count": 0,
        }
        per_veh_df = []

    # df = all_bi_scores_df.to_dict("records")
    # except Exception as e:
    #     print(f"An error occurred: {e}")
    #     raise HTTPException(
    #         status_code=500, detail=f"Error Details: {traceback.format_exc()}"
    #     )
    return {
        "gauge_scores": [
            {
                "title": "Total",
                "value": avg_all_scores["total_score"],
                "count": total_all_counts["total_count"],
            },
            {
                "title": "Acceleration",
                "icon": "fa-tachometer-alt-fast",
                "value": avg_all_scores["acceleration_score"],
                "count": total_all_counts["acceleration_count"],
            },
            {
                "title": "Braking",
                "value": avg_all_scores["braking_score"],
                "count": total_all_counts["braking_count"],
            },
            {
                "title": "Cornering",
                "value": avg_all_scores["cornering_score"],
                "count": total_all_counts["cornering_count"],
            },
            {
                "title": "Speeding",
                "value": avg_all_scores["speeding_score"],
                "count": total_all_counts["speeding_count"],
            },
            {
                "title": "Idling",
                "value": avg_all_scores["idling_score"],
                "count": total_all_counts["idling_count"],
            },
            # {
            #     "title": "Impact - Severe",
            #     "value": avg_all_scores["severe_impact_score"],
            #     "count": total_all_counts["severe_impact_count"],
            # },
            # {
            #     "title": "Impact - Moderate",
            #     "value": avg_all_scores["moderate_impact_score"],
            #     "count": total_all_counts["moderate_impact_count"],
            # },
            {
                "title": "Impact",
                "value": round(
                    (
                        avg_all_scores["impact_score"]
                        + avg_all_scores["severe_impact_score"]
                        + avg_all_scores["moderate_impact_score"]
                    )
                    / 3,
                    2,
                ),
                "count": total_all_counts["impact_count"]
                + total_all_counts["severe_impact_count"]
                + total_all_counts["moderate_impact_count"],
            },
        ],
        # "scores_per_vehicles": per_veh_df,
    }


@drivers_router.post(
    "/get_filtered_events_details_pav_page",
    description="Get filtered driving events map",
)
def get_filtered_events_details_pav_page(title: str, user: dict = Depends(validate_token)):
    try:
        event_count_query = sql.SQL(
            """COPY(
            SELECT 
                *  
            FROM fleet.driving_events
                where
                    event_description = {title}
            )TO STDOUT WITH CSV HEADER"""
        ).format(
            title = sql.Literal(title)
        )
        response = exc_qrs_get_dfs_raw([event_count_query])[0].to_dict("records")

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response


@drivers_router.post(
    "/get_filtered_drivers_events_table",
    description="Get filtered Drivers Events Table",
)
def get_filtered_drivers_events_table(title: str, user: dict = Depends(validate_token)):
    try:
        monthly_cost_query = sql.SQL(
            """COPY(
            select 
                division, 
                vehiclereg,
                event_description,             
                event_start_date || ' ' || event_start_time as event_date,
                f_start_street || ' ' || f_start_suburb || ' ' || f_start_region as event_region,
                fleet_no,
                veh_type_map,
                veh_model_map, 
                julian_month, 
                asset_name,
                start_lat, start_lon,
                event_key,
                road_speed_limit,
                event_value || ' ' || measurement_units as event_values           
            from fleet.driving_events
                where 
                    event_description = {title}
                    limit 50
            )TO STDOUT WITH CSV HEADER"""
        ).format(
            title = sql.Literal(title)
        )
        response = exc_qrs_get_dfs_raw([monthly_cost_query])[0].to_dict("records")

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    return response
