from psycopg2 import sql

from ..v0.db_config import exc_qrs_get_dfs_raw

def preprocess_api_call():
    queries = [
        # Update veh_type_map, veh_make_map, etc. in maintenance_cancelled
        sql.SQL(
            """UPDATE fleet.maintenance_cancelled
               SET veh_type_map = fleetlist.veh_type_map,
                   veh_make_map = fleetlist.make,
                   veh_model_map = fleetlist.veh_model_map,
                   contract_type = fleetlist.contract_type,
                   division = fleetlist.division,
                   branch = fleetlist.branch,
                   fleet_no = fleetlist.fleet_no
               FROM fleet.fleetlist
               WHERE maintenance_cancelled.vehiclereg = fleetlist.vehiclereg"""
        ),
        # Update contract_type in orders
        sql.SQL(
            """UPDATE fleet.orders
               SET contract_type = fleetlist.contract_type
               FROM fleet.fleetlist
               WHERE orders.vehiclereg = fleetlist.vehiclereg"""
        ),
        # Set distance to 0 for trailers in trip_data_daily
        sql.SQL(
            """UPDATE fleet.trip_data_daily
               SET distance = 0
               WHERE veh_type_map = 'Trailer'"""
        ),
        # Update some fields in fleetlist_raw based on fleetlist
        sql.SQL(
            """UPDATE fleet.fleetlist_raw
               SET division = fleetlist.division,
                   branch = fleetlist.branch,
                   veh_type_map = fleetlist.veh_type_map
               FROM fleet.fleetlist
               WHERE fleetlist_raw.vhclregistration = fleetlist.vehiclereg"""
        ),
        # Update some fields in fleetlist_external based on fleetlist
        sql.SQL(
            """UPDATE fleet.fleetlist_external
               SET division = fleetlist.division,
                   branch = fleetlist.branch,
                   veh_type_map = fleetlist.veh_type_map
               FROM fleet.fleetlist
               WHERE fleetlist_external.registration_number = fleetlist.vehiclereg"""
        ),
        # Update contract_start and contract_end in fleetlist based on fleetlist_raw
        sql.SQL(
            """UPDATE fleet.fleetlist
               SET contract_start = fleetlist_raw.startdate,
                   contract_end = fleetlist_raw.enddate
               FROM fleet.fleetlist_raw
               WHERE fleetlist_raw.vhclregistration = fleetlist.vehiclereg"""
        ),
        # Update veh_type_map to 'Consumables' where it's currently 'Undefined'
        sql.SQL(
            """UPDATE fleet.fleetlist
               SET veh_type_map = 'Consumables'
               WHERE veh_type_map = 'Undefined'"""
        ),
        # Insert into supplier_per_branch from maintenance
        sql.SQL(
            """INSERT INTO fleet.supplier_per_branch (division, branch, serviceprovider)
               SELECT division, branch, serviceprovider
               FROM fleet.maintenance
               WHERE division IS NOT NULL
               GROUP BY division, branch, serviceprovider
               ON CONFLICT DO NOTHING"""
        ),
        # Enable a trigger in orders
        sql.SQL(
            """ALTER TABLE fleet.orders ENABLE TRIGGER update_shoprite_txn"""
        ),
        # Update fleet_no_desc in fleetlist based on fleet_no_desc_map
        sql.SQL(
            """UPDATE fleet.fleetlist
               SET fleet_no_desc = fleet_no_desc_map.vehicle_type
               FROM fleet.fleet_no_desc_map
               WHERE LEFT(fleetlist.fleet_no, 2) = fleet_no_desc_map.prefix"""
        ),
        # Update fleet_no_desc for rigids, excluding generators
        sql.SQL(
            """UPDATE fleet.fleetlist
               SET fleet_no_desc = fleet_no_desc_map.vehicle_type
               FROM fleet.fleet_no_desc_map
               WHERE RIGHT(LEFT(fleetlist.fleet_no, 2), 1) != '0'
               AND LEFT(fleetlist.fleet_no, 1) = fleet_no_desc_map.prefix"""
        )
    ]

    try:
        for query in queries:
            exc_qrs_get_dfs_raw(query)
        return {"message": "Preprocessing completed successfully"}
    except Exception as e:
        return {"error": f"Failed to preprocess data: {e}"}
   
def update_fleet_data():
    queries = [
        # Update veh_type_map, veh_make_map, etc. in maintenance_cancelled
        sql.SQL(
            """UPDATE fleet.maintenance_cancelled
               SET veh_type_map = fleetlist.veh_type_map,
                   veh_make_map = fleetlist.make,
                   veh_model_map = fleetlist.veh_model_map,
                   contract_type = fleetlist.contract_type,
                   division = fleetlist.division,
                   branch = fleetlist.branch,
                   fleet_no = fleetlist.fleet_no
               FROM fleet.fleetlist
               WHERE maintenance_cancelled.vehiclereg = fleetlist.vehiclereg"""
        ),
        # Update contract_type in orders
        sql.SQL(
            """UPDATE fleet.orders
               SET contract_type = fleetlist.contract_type
               FROM fleet.fleetlist
               WHERE orders.vehiclereg = fleetlist.vehiclereg"""
        ),
        # Set distance to 0 for trailers in trip_data_daily
        sql.SQL(
            """UPDATE fleet.trip_data_daily
               SET distance = 0
               WHERE veh_type_map = 'Trailer'"""
        ),
        # Update some fields in fleetlist_raw based on fleetlist
        sql.SQL(
            """UPDATE fleet.fleetlist_raw
               SET division = fleetlist.division,
                   branch = fleetlist.branch,
                   veh_type_map = fleetlist.veh_type_map
               FROM fleet.fleetlist
               WHERE fleetlist_raw.vhclregistration = fleetlist.vehiclereg"""
        ),
        # Update some fields in fleetlist_external based on fleetlist
        sql.SQL(
            """UPDATE fleet.fleetlist_external
               SET division = fleetlist.division,
                   branch = fleetlist.branch,
                   veh_type_map = fleetlist.veh_type_map
               FROM fleet.fleetlist
               WHERE fleetlist_external.registration_number = fleetlist.vehiclereg"""
        ),
        # Update contract_start and contract_end in fleetlist based on fleetlist_raw
        sql.SQL(
            """UPDATE fleet.fleetlist
               SET contract_start = fleetlist_raw.startdate,
                   contract_end = fleetlist_raw.enddate
               FROM fleet.fleetlist_raw
               WHERE fleetlist_raw.vhclregistration = fleetlist.vehiclereg"""
        ),
        # Update veh_type_map to 'Consumables' where it's currently 'Undefined'
        sql.SQL(
            """UPDATE fleet.fleetlist
               SET veh_type_map = 'Consumables'
               WHERE veh_type_map = 'Undefined'"""
        ),
        # Insert into supplier_per_branch from maintenance
        sql.SQL(
            """INSERT INTO fleet.supplier_per_branch (division, branch, serviceprovider)
               SELECT division, branch, serviceprovider
               FROM fleet.maintenance
               WHERE division IS NOT NULL
               GROUP BY division, branch, serviceprovider
               ON CONFLICT DO NOTHING"""
        ),
        # Enable a trigger in orders
        sql.SQL(
            """ALTER TABLE fleet.orders ENABLE TRIGGER update_shoprite_txn"""
        ),
        # Update fleet_no_desc in fleetlist based on fleet_no_desc_map
        sql.SQL(
            """UPDATE fleet.fleetlist
               SET fleet_no_desc = fleet_no_desc_map.vehicle_type
               FROM fleet.fleet_no_desc_map
               WHERE LEFT(fleetlist.fleet_no, 2) = fleet_no_desc_map.prefix"""
        ),
        # Update fleet_no_desc for rigids, excluding generators
        sql.SQL(
            """UPDATE fleet.fleetlist
               SET fleet_no_desc = fleet_no_desc_map.vehicle_type
               FROM fleet.fleet_no_desc_map
               WHERE RIGHT(LEFT(fleetlist.fleet_no, 2), 1) != '0'
               AND LEFT(fleetlist.fleet_no, 1) = fleet_no_desc_map.prefix"""
        )
    ]

    try:
        for query in queries:
            exc_qrs_get_dfs_raw(query)
        return {"message": "Preprocessing completed successfully"}
    except Exception as e:
        return {"error": f"Failed to preprocess data: {e}"}

def update_julian_month_for_accrual_graph():
    queries = [
        sql.SQL(
            """UPDATE fleet.maintenance
               SET julian_month = NULL"""
        ),
        sql.SQL(
            """UPDATE fleet.maintenance AS m
               SET julian_month = j.selected_month
               FROM fleet.julian_cal AS j
               WHERE m.transdate BETWEEN j.jul_from_date AND j.jul_to_date"""
        ),
        sql.SQL(
            """UPDATE fleet.orders
               SET invoice_diff = invoice_amount - amount"""
        )
    ]

    try:
        for query in queries:
            exc_qrs_get_dfs_raw(query)
        return {"message": "Preprocessing completed successfully"}
    except Exception as e:
        return {"error": f"Failed to preprocess data: {e}"}

def update_daily_vehicles_trip():
    queries = [
        sql.SQL(
            """INSERT INTO fleet.trip_data_daily (date, vehiclereg, distance)
               SELECT DATE_TRUNC('day', tripstart), vehiclereg, SUM(distance)
               FROM fleet.trip_data
               GROUP BY vehiclereg, DATE_TRUNC('day', tripstart)
               ON CONFLICT DO NOTHING"""
        ),
        sql.SQL(
            """UPDATE fleet.trip_data_daily AS a
               SET veh_type_map = b.veh_type_map,
                   veh_make_map = b.make,
                   veh_model_map = b.veh_model_map,
                   division = b.division,
                   branch = b.branch,
                   contract_type = b.contract_type,
                   fleet_no = b.fleet_no
               FROM fleet.fleetlist AS b
               WHERE a.vehiclereg = b.vehiclereg"""
        ),
        sql.SQL(
            """UPDATE fleet.trip_data_daily
               SET julian_month = NULL"""
        ),
        sql.SQL(
            """UPDATE fleet.trip_data_daily AS m
               SET julian_month = j.selected_month
               FROM fleet.julian_cal AS j
               WHERE m.date BETWEEN j.jul_from_date AND j.jul_to_date"""
        ),
        sql.SQL(
            """UPDATE fleet.trip_data_daily AS m
               SET julian_month = j.selected_month
               FROM fleet.julian_cal AS j
               WHERE m.date BETWEEN j.jul_from_date AND j.jul_to_date"""
        ),
        sql.SQL(
            """UPDATE fleet.fleetlist AS a
               SET last_odo = b.end_odo,
                   last_odo_date = b.date
               FROM (
                   SELECT DISTINCT ON (vehiclereg) vehiclereg, date, end_odo
                   FROM fleet.trip_data_daily
                   ORDER BY vehiclereg, date DESC
               ) b
               WHERE a.vehiclereg = b.vehiclereg"""
        ),
        sql.SQL(
            """UPDATE fleet.maintenance
               SET veh_type_map = fleetlist.veh_type_map,
                   veh_make_map = fleetlist.make,
                   veh_model_map = fleetlist.veh_model_map,
                   contract_type = fleetlist.contract_type,
                   division = fleetlist.division,
                   branch = fleetlist.branch,
                   fleet_no = fleetlist.fleet_no
               FROM fleet.fleetlist
               WHERE maintenance.vehiclereg = fleetlist.vehiclereg"""
        ),
    ]

    try:
        for query in queries:
            exc_qrs_get_dfs_raw(query)
        return {"message": "Preprocessing completed successfully"}
    except Exception as e:
        return {"error": f"Failed to preprocess data: {e}"}


     # Fleetlist table updates

def update_fleetlist_tables():
    queries = [
        sql.SQL(
            """UPDATE fleet.fleetlist
               SET veh_model_map = map"""
        ),
        sql.SQL(
            """UPDATE fleet.fleetlist AS a
               SET veh_type_map = b.veh_type_map
               FROM fleet.type_map_per_reg AS b
               WHERE a.vehiclereg = b.vehiclereg"""
        ),
        sql.SQL(
            """UPDATE fleet.fleetlist AS a
               SET division = b.division
               FROM fleet.divisions_new AS b
               WHERE b.branch = a.branch"""
        ),
        sql.SQL(
            """UPDATE fleet.fleetlist
               SET fleet_no = vehiclereg
               WHERE fleet_no IS NULL"""
        ),
        sql.SQL(
            """UPDATE fleet.fleetlist AS a
               SET fleet_no = b.shoprite_fleet_no
               FROM fleet.fleet_no_by_reg AS b
               WHERE a.vehiclereg = b.vehiclereg"""
        ),
        sql.SQL(
            """UPDATE fleet.fleetlist AS a
               SET fleet_no = b.shoprite_fleet_no
               FROM fleet.fleet_no_by_reg AS b
               WHERE a.vehiclereg = b.vehiclereg"""
        ),
        sql.SQL(
            """UPDATE fleet.fleetlist
               SET fleet_no = vehiclereg
               WHERE fleet_no IS NULL"""
        ),
        sql.SQL(
            """UPDATE fleet.orders AS o
               SET fleet_no = b.shoprite_fleet_no
               FROM fleet.fleet_no_by_reg AS b
               WHERE o.vehiclereg = b.vehiclereg"""
        ),
        sql.SQL(
            """UPDATE fleet.fleetlist
               SET veh_model_map = map"""
        ),
        sql.SQL(
            """UPDATE fleet.fleetlist
               SET veh_model_map = map"""
        )
    ]

    try:
        for query in queries:
            exc_qrs_get_dfs_raw(query)
        return {"message": "Preprocessing completed successfully"}
    except Exception as e:
        return {"error": f"Failed to preprocess data: {e}"}

def update_julian_month_in_driving_events():
    queries = [
        sql.SQL(
            """UPDATE fleet.driving_events
               SET julian_month = NULL"""
        ),
        sql.SQL(
            """UPDATE fleet.driving_events AS de
               SET julian_month = j.selected_month
               FROM fleet.julian_cal AS j
               WHERE de.event_start_date BETWEEN j.jul_from_date AND j.jul_to_date"""
        ),
        sql.SQL(
            """UPDATE fleet.driving_events AS a
               SET veh_type_map = b.veh_type_map,
                   veh_make_map = b.make,
                   veh_model_map = b.veh_model_map,
                   division = b.division,
                   branch = b.branch,
                   fleet_no = b.fleet_no
               FROM fleet.fleetlist AS b
               WHERE a.vehiclereg = b.vehiclereg"""
        )
    ]

    try:
        for query in queries:
            exc_qrs_get_dfs_raw(query)
        return {"message": "Preprocessing completed successfully"}
    except Exception as e:
        return {"error": f"Failed to preprocess data: {e}"}

def update_orders_based_on_julian_month():
    queries = [
        sql.SQL(
            """UPDATE fleet.orders
               SET julian_month = NULL"""
        ),
        sql.SQL(
            """UPDATE fleet.orders AS m
               SET julian_month = j.selected_month
               FROM fleet.julian_cal AS j
               WHERE m.date BETWEEN j.jul_from_date AND j.jul_to_date"""
        ),
        sql.SQL(
            """UPDATE fleet.maintenance
               SET invoice_status = NULL"""
        ),
        sql.SQL(
            """UPDATE fleet.maintenance AS a
               SET invoice_status = 'invoice_exception'
               WHERE lower(a.order_no) NOT IN (SELECT lower(order_no) FROM fleet.orders)"""
        ),
        sql.SQL(
            """UPDATE fleet.maintenance AS a
               SET invoice_status = 'accrual'
               WHERE lower(a.order_no) IN (SELECT lower(order_no) FROM fleet.orders)
               AND invoice_no = 'not_invoiced'"""
        ),
        sql.SQL(
            """UPDATE fleet.maintenance AS a
               SET invoice_status = 'completed'
               WHERE lower(a.order_no) IN (SELECT lower(order_no) FROM fleet.orders)
               AND invoice_no <> 'not_invoiced'"""
        ),
        sql.SQL(
            """UPDATE fleet.orders AS a
               SET order_status = 'order_exception'
               WHERE lower(a.order_no) NOT IN (SELECT lower(order_no) FROM fleet.maintenance)
               AND order_status != 'deleted'
               AND order_status IS NULL"""
        ),
        sql.SQL(
            """WITH UpdatedInvoices AS (
                   SELECT fleet.orders.order_no, ARRAY_AGG(DISTINCT maintenance.invoice_no) AS updated_invoice_numbers
                   FROM fleet.orders
                   JOIN fleet.maintenance ON fleet.maintenance.order_no = fleet.orders.order_no
                   GROUP BY fleet.orders.order_no
               )
               UPDATE fleet.orders
               SET invoice_no = UpdatedInvoices.updated_invoice_numbers
               FROM UpdatedInvoices
               WHERE fleet.orders.order_no = UpdatedInvoices.order_no"""
        ),
        sql.SQL(
            """UPDATE fleet.orders
               SET invoice_amount = 0, invoice_diff = 0"""
        ),
        sql.SQL(
            """UPDATE fleet.orders AS a
               SET invoice_amount = b.miles_amount
               FROM (
                   SELECT SUM(amount) AS miles_amount, order_no
                   FROM fleet.maintenance
                   GROUP BY order_no
               ) b
               WHERE a.order_no = b.order_no"""
        )
    ]

    try:
        for query in queries:
            exc_qrs_get_dfs_raw(query)
        return {"message": "Preprocessing completed successfully"}
    except Exception as e:
        return {"error": f"Failed to preprocess data: {e}"}



   # --populate per asset cpk/costs table

def populate_per_assets_cost_cpk_table():
    queries = [
        sql.SQL(
            """INSERT INTO fleet.per_asset_summary (vehiclereg, julian_month, veh_type_map, veh_model_map, branch, division, component, total_distance, total_amount, total_cpk, total_savings)
               SELECT m.vehiclereg, j.selected_month AS julian_month, m.veh_type_map, m.veh_model_map, m.branch, m.division, NULL AS component, SUM(COALESCE(td.total_distance, 0)) AS total_distance, SUM(m.amount) AS total_amount,
               CASE WHEN SUM(COALESCE(td.total_distance, 0)) = 0 THEN 0 ELSE SUM(m.amount) / SUM(COALESCE(td.total_distance, 0)) END AS total_cpk, SUM(m.savings) AS total_savings
               FROM fleet.maintenance m
               JOIN fleet.julian_cal j ON m.julian_month = j.selected_month
               LEFT JOIN (
                   SELECT tdd.vehiclereg, j.selected_month AS julian_month, SUM(distance) AS total_distance
                   FROM fleet.trip_data_daily tdd
                   JOIN fleet.julian_cal j ON tdd.date >= j.jul_from_date AND tdd.date <= j.jul_to_date
                   GROUP BY tdd.vehiclereg, j.selected_month
               ) td ON m.vehiclereg = td.vehiclereg AND j.selected_month = td.julian_month
               GROUP BY m.vehiclereg, j.selected_month, m.veh_type_map, m.veh_model_map, m.branch, m.division"""
        ),
        sql.SQL(
            """UPDATE fleet.per_asset_summary AS pas
               SET component = (
                   SELECT jsonb_object_agg(
                       ma.mapping,
                       jsonb_build_object(
                           'amount', ma.amount,
                           'savings', ma.savings,
                           'cpk_percentage', CASE WHEN total_amount = 0 THEN 0 ELSE ma.amount / total_amount * 100 END
                       )
                   )
                   FROM MappingAggregates ma
                   WHERE pas.vehiclereg = ma.vehiclereg AND pas.julian_month = ma.julian_month
               )"""
        )
    ]

    try:
        for query in queries:
            exc_qrs_get_dfs_raw(query)
        return {"message": "Preprocessing completed successfully"}
    except Exception as e:
        return {"error": f"Failed to preprocess data: {e}"}

def maintenance_cancelled_table():
    queries = [
        sql.SQL(
            """UPDATE fleet.maintenance_cancelled SET component_cat = '' WHERE component_cat = '0'"""
        ),
        sql.SQL(
            """UPDATE fleet.maintenance_cancelled SET component_cat = '' WHERE component_cat IS NULL"""
        ),
        sql.SQL(
            """UPDATE fleet.maintenance_cancelled SET maintdescription = '' WHERE maintdescription = 'nan'"""
        ),
        sql.SQL(
            """UPDATE fleet.maintenance_cancelled SET mapping = txn_maps.mapping FROM fleet.txn_maps WHERE LOWER(maintenance_cancelled.veh_type_map || maintenance_cancelled.maintdescription || maintenance_cancelled.component_cat) = LOWER(txn_maps.concat)"""
        )
    ]
    try:
        for query in queries:
            exc_qrs_get_dfs_raw(query)
        return {"message": "Preprocessing completed successfully"}
    except Exception as e:
        return {"error": f"Failed to preprocess data: {e}"}

def dashboard_pre_processing():
    queries = [
        sql.SQL(
            """DELETE FROM fleet.dashboard"""
        ),
        sql.SQL(
            """INSERT INTO fleet.dashboard (division, branch, veh_type_map, month, amount, distance)
               SELECT m.division, m.branch, m.veh_type_map, TO_DATE(CONCAT(EXTRACT(YEAR FROM m.transdate), '-', EXTRACT(MONTH FROM m.transdate), '-01'), 'YYYY-MM-DD') AS month, SUM(m.amount) AS amount, SUM(t.distance) AS distance
               FROM fleet.maintenance m
               LEFT JOIN fleet.trip_data_daily t ON m.division = t.division AND m.branch = t.branch AND m.veh_type_map = t.veh_type_map AND TO_DATE(CONCAT(EXTRACT(YEAR FROM m.transdate), '-', EXTRACT(MONTH FROM m.transdate), '-01'), 'YYYY-MM-DD') = t.date
               GROUP BY m.division, m.branch, m.veh_type_map, month"""
        )
    ]
    try:
        for query in queries:
            exc_qrs_get_dfs_raw(query)
        return {"message": "Preprocessing completed successfully"}
    except Exception as e:
        return {"error": f"Failed to preprocess data: {e}"}

def update_month_cost_per_asset_table():
    queries = [
        sql.SQL(
            """DELETE FROM fleet.month_cost_per_asset"""
        ),
        sql.SQL(
            """INSERT INTO fleet.month_cost_per_asset (vehiclereg, fleet_no, branch, division, julian_month, amount, veh_type_map)
               SELECT vehiclereg, fleet_no, branch, division, julian_month, SUM(amount) AS amount, veh_type_map
               FROM fleet.maintenance
               WHERE julian_month IS NOT NULL
               GROUP BY vehiclereg, fleet_no, branch, division, julian_month, veh_type_map
               ON CONFLICT ON CONSTRAINT unique_constraint DO UPDATE SET amount = EXCLUDED.amount"""
        )
    ]
    try:
        for query in queries:
            exc_qrs_get_dfs_raw(query)
        return {"message": "Preprocessing completed successfully"}
    except Exception as e:
        return {"error": f"Failed to preprocess data: {e}"}

def shoprite_txn_temp_processing():
    queries = [
        sql.SQL(
            """UPDATE fleet.orders_temp a
               SET contract_type = b.contract_type
               FROM fleet.fleetlist b
               WHERE a.vehiclereg = b.vehiclereg"""
        ),
        sql.SQL(
            """UPDATE fleet.orders_temp
               SET julian_month = NULL"""
        ),
        sql.SQL(
            """UPDATE fleet.orders_temp AS m
               SET julian_month = j.selected_month
               FROM fleet.julian_cal AS j
               WHERE m.date BETWEEN j.jul_from_date AND j.jul_to_date"""
        )
    ]

    try:
        for query in queries:
            exc_qrs_get_dfs_raw(query)
        return {"message": "Preprocessing completed successfully"}
    except Exception as e:
        return {"error": f"Failed to preprocess data: {e}"}

def maintenance_table_update():
    queries = [
        sql.SQL(
            """UPDATE fleet.maintenance
               SET component_cat = ''
               WHERE component_cat = '0'"""
        ),
        sql.SQL(
            """UPDATE fleet.maintenance
               SET component_cat = ''
               WHERE component_cat IS NULL"""
        ),
        sql.SQL(
            """UPDATE fleet.maintenance
               SET maintdescription = ''
               WHERE maintdescription = 'nan'"""
        ),
        sql.SQL(
            """UPDATE fleet.maintenance AS m
               SET mapping = tm.mapping
               FROM fleet.txn_maps AS tm
               WHERE LOWER(m.veh_type_map || m.maintdescription || m.component_cat) = LOWER(tm.concat)"""
        )
    ]

    try:
        for query in queries:
            exc_qrs_get_dfs_raw(query)
        return {"message": "Preprocessing completed successfully"}
    except Exception as e:
        return {"error": f"Failed to preprocess data: {e}"}

def update_order_invoice_amounts():
    queries = [
        sql.SQL(
            """UPDATE fleet.orders_temp
               SET invoice_amount = 0, invoice_diff = 0"""
        ),
        sql.SQL(
            """UPDATE fleet.orders_temp AS o
               SET invoice_amount = m.miles_amount
               FROM (SELECT SUM(amount) AS miles_amount, order_no FROM fleet.maintenance GROUP BY order_no) AS m
               WHERE o.order_no = m.order_no"""
        ),
        sql.SQL(
            """UPDATE fleet.orders_temp
               SET invoice_diff = amount - invoice_amount"""
        ),
        sql.SQL(
            """UPDATE fleet.orders_temp AS a
               SET fleet_no = b.fleet_no
               FROM fleet.fleetlist AS b
               WHERE a.vehiclereg = b.vehiclereg"""
        ),
        sql.SQL(
            """UPDATE fleet.orders_temp
               SET julian_month = NULL"""
        ),
        sql.SQL(
            """UPDATE fleet.orders_temp AS m
               SET julian_month = j.selected_month
               FROM fleet.julian_cal AS j
               WHERE m.date BETWEEN j.jul_from_date AND j.jul_to_date"""
        )
    ]

    try:
        for query in queries:
            exc_qrs_get_dfs_raw(query)
        return {"message": "Preprocessing completed successfully"}
    except Exception as e:
        return {"error": f"Failed to preprocess data: {e}"}

 