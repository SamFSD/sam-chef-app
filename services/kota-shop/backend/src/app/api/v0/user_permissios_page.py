import traceback
from fastapi import APIRouter, HTTPException, Depends
from .db_config import exc_qrs_get_dfs_raw
import json
from psycopg2 import sql
from .auth import validate_token
import time

users_router =  APIRouter()

@users_router.get("/get_permissions", description="get user permissions")
def get_permissions(user: dict = Depends(validate_token)):

    user_id = user['email']
    try:

        # first, get the users stored permissions with regards to divs, branches, veh types and order permissions
        permissions_query = sql.SQL(
            """COPY(
                    SELECT 
                        email,
                        first_name,
                        last_name,
                        permissions, 
                        can_view_users_logs
                    FROM 
                        fleet."users"
                    WHERE 
                        lower(email) = {user_id}
                        
                        ) TO STDOUT WITH CSV HEADER"""
        ).format(user_id=sql.Literal(user_id.lower()))
        vehs_and_models_query = sql.SQL(
            """COPY(
                    WITH branch_vehicles AS (
                SELECT 
                    branch_data ->> 'branch' AS branch,
                    jsonb_array_elements_text(branch_data -> 'veh_types') AS veh_type
                FROM 
                    jsonb_array_elements(
            (select permissions from fleet.users where email = {user_id})) AS outer_array
                    CROSS JOIN LATERAL jsonb_array_elements(outer_array -> 'branches') AS branch_data
            ), unique_model_maps AS (
                SELECT 
                    bv.branch,
                    jsonb_agg(DISTINCT v.make || ' ' || v.veh_model_map) AS unique_vehicle_model_maps
                FROM 
                    branch_vehicles bv
                    JOIN fleet.fleetlist v ON bv.branch = v.branch AND v.veh_type_map = bv.veh_type
                GROUP BY 
                    bv.branch
            )
            SELECT 
                bv.branch,
                jsonb_build_object(
                    'vehicles', jsonb_agg(
                        jsonb_build_object(
                            'fleet_no', v.fleet_no,
                            'vehiclereg', v.vehiclereg,
                            'veh_model_map', v.make || ' ' || v.veh_model_map,
                            'veh_type_map', v.veh_type_map
                        )
                    ),
                    'unique_vehicle_model_maps', uvm.unique_vehicle_model_maps
                ) AS branch_details
            FROM 
                branch_vehicles bv
                JOIN fleet.fleetlist v ON bv.branch = v.branch AND v.veh_type_map = bv.veh_type
                JOIN unique_model_maps uvm ON bv.branch = uvm.branch
            GROUP BY 
        bv.branch, uvm.unique_vehicle_model_maps) TO STDOUT WITH CSV HEADER"""
        ).format(user_id=sql.Literal(user_id.lower()))

        # get all supplier and maps per vehicle type
        supplier_and_maps_query = sql.SQL(
            """COPY(
                SELECT branch, json_agg(json_build_object('veh_type_map', veh_type_map, 'maps', maps, 'service_providers', service_providers)) as repairs
                FROM (
                    SELECT 
                        branch, 
                        veh_type_map, 
                        json_agg(distinct mapping) as maps, 
                        json_agg(distinct serviceprovider) as service_providers 
                    FROM fleet.maintenance
                    WHERE branch in (
                        SELECT DISTINCT jsonb_array_elements(permissions->'branches')->>'branch' AS branch
                        FROM (
                            SELECT jsonb_array_elements(permissions) AS permissions
                            FROM fleet.users 
                            WHERE email = {user_id}
                        ) AS subquery
                    )
                    AND veh_type_map in (
                        SELECT jsonb_array_elements_text(veh_types::jsonb) AS vehicle_type
                        FROM (
                            SELECT DISTINCT jsonb_array_elements(permissions->'branches')->>'veh_types' AS veh_types
                            FROM (
                                SELECT jsonb_array_elements(permissions) AS permissions
                                FROM fleet.users 
                                WHERE email = {user_id}
                            ) AS subquery
                        ) AS vehicle_types
                    )
                    GROUP BY branch, veh_type_map
                ) AS subquery
                GROUP BY branch) TO STDOUT WITH CSV HEADER"""
        ).format(user_id=sql.Literal(user_id.lower()))
        t = time.time()

        response = exc_qrs_get_dfs_raw(
            [permissions_query, vehs_and_models_query, supplier_and_maps_query]
        )
        print("1 Time taken: ", time.time() - t)
        t = time.time()

        main_permissions = response[0].to_dict("records")
        vehs_and_models = response[1]
        suppliers_and_maps = response[2]
        suppliers_and_maps["repairs"] = suppliers_and_maps["repairs"].apply(json.loads)
        suppliers_and_maps = suppliers_and_maps.to_dict("records")
        vehs_and_models["branch_details"] = vehs_and_models["branch_details"].apply(
            json.loads
        )
        # print("fffff", response)
        vehs_and_models = vehs_and_models.to_dict("records")
        print("2 Time taken: ", time.time() - t)

        # print('main')
        # print(main_permissions)
        # print('vehs')
        # print(vehs_and_models)
        # combine the vehicles selectable to the permissions object
        t = time.time()

        for user in main_permissions:
            permissions = json.loads(user["permissions"])
            for permission in permissions:
                for branch in permission["branches"]:
                    branch_name = branch["branch"]
                    # Find corresponding branch in veh_permissions
                    corresponding_branch = next(
                        (item for item in vehs_and_models if item["branch"] == branch_name),
                        None,
                    )
                    if corresponding_branch:
                        # Extract vehicles and unique vehicle models
                        branch_vehicles = corresponding_branch["branch_details"]["vehicles"]
                        unique_vehicle_models = corresponding_branch["branch_details"][
                            "unique_vehicle_model_maps"
                        ]
                        # Add to the main_permissions branch
                        branch["branch_vehicles"] = branch_vehicles
                        branch["unique_vehicle_models"] = unique_vehicle_models
            user["permissions"] = permissions
        print("3 Time taken: ", time.time() - t)
        t = time.time()

        # set the repair maps and suppliers to each branch in permissions
        for div in main_permissions[0]["permissions"]:
            for branch in div["branches"]:
                corresponding_branch = next(
                    (
                        item
                        for item in suppliers_and_maps
                        if item["branch"] == branch["branch"]
                    ),
                    None,
                )
                branch["repairs"] = (
                    corresponding_branch["repairs"] if corresponding_branch else None
                )
        print("4 Time taken: ", time.time() - t)
        # print(main_permissions)
    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"Error Details: {traceback.format_exc()}")
    # print(json.dumps(main_permissions))
    return main_permissions


@users_router.get(
    "/users",
    description="Get users for the users permission page",
    
)
def get_user_for_permission_page(user: dict = Depends(validate_token)):
    user_query = sql.SQL(
        """COPY (SELECT * FROM fleet.users
            
            
    ) TO STDOUT WITH CSV HEADER"""
    )

    response = exc_qrs_get_dfs_raw([user_query])[0].to_dict("records")
    return response


@users_router.get(
    "/users_divisions",
    description="Get users divisions for the users permission page",
    
)
def get_user_division(user: dict = Depends(validate_token)):
    division_query = sql.SQL(
        """COPY (select division, json_agg( distinct branch) as branch, json_agg(distinct veh_type_map) as vehicle_types
         from fleet.fleetlist
                group by division
    ) TO STDOUT WITH CSV HEADER"""
    )

    response = exc_qrs_get_dfs_raw([division_query])[0]
    response.branch = response.branch.apply(json.loads)
    response.vehicle_types = response.vehicle_types.apply(json.loads)

    return response.to_dict("records")


@users_router.get(
    "/users_branches",
    description="Get users branches for the users permission page",
    
)
def get_user_branches(division: str, user: dict = Depends(validate_token)):
    branch_query = sql.SQL(
        """COPY (SELECT distinct branch FROM fleet.maintenance
        where division = {division}
            
            
    ) TO STDOUT WITH CSV HEADER"""
    ).format(division=sql.Literal(division))

    response = exc_qrs_get_dfs_raw([branch_query])[0].to_dict("records")
    return response


@users_router.get(
    "/users_veh_types",
    description="Get users vehicle types for the users permission page",
    
)
def get_user_vehicle_types(branch: str, user: dict = Depends(validate_token)):
    veh_type_query = sql.SQL(
        """COPY (SELECT distinct veh_type_map FROM fleet.maintenance
        where branch = {branch}
            
            
    ) TO STDOUT WITH CSV HEADER"""
    ).format(branch=sql.Literal(branch))

    response = exc_qrs_get_dfs_raw([veh_type_query])[0].to_dict("records")
    return response


@users_router.post(
    "/add_new_user_user_table",
    description="add new user to users table",
)
def add_new_user_user_table(data: dict, user: dict = Depends(validate_token)):
    # print(data, "data being sent to database")
    # Check if all required keys are present in the 'data' dictionary
    key_mapping = {
        "first_name": "first_name",
        "last_name": "last_name",
        "email": "email",
        "permissions": "permissions",
    }

    required_keys = ["email", "first_name", "last_name", "permissions"]

    # Mapping keys for checking
    mapped_keys = [key_mapping.get(key, key) for key in required_keys]

    # Check for required keys
    if not all(key in data for key in mapped_keys):
        raise KeyError("Missing one or more required fields in data")

    # Use mapped keys to access values
    email = data[key_mapping["email"]]
    first_name = data[key_mapping["first_name"]]
    last_name = data[key_mapping["last_name"]]
    permissions = data[key_mapping["permissions"]]

    # permissions_json = json.dumps(permissions)

    query = sql.SQL(
        """
        COPY(INSERT INTO fleet.users (
            email, first_name, last_name, permissions
        )
        VALUES (
            {email}, {first_name}, {last_name}, {permissions}
        )
        RETURNING 'OK') TO STDOUT WITH CSV HEADER
    """
    ).format(
        email=sql.Literal(email),
        first_name=sql.Literal(first_name),
        last_name=sql.Literal(last_name),
        permissions=sql.Literal(json.dumps(permissions)),
    )
    # print(query)
    # query = sql.SQL(query)

    response = exc_qrs_get_dfs_raw([query])[0]
    # print("fffff", response)
    return response
