UPDATE fleet.driving_events
SET julian_month = NULL;

UPDATE fleet.driving_events AS de
SET julian_month = j.selected_month
FROM fleet.julian_cal AS j
WHERE de.event_start_date BETWEEN j.jul_from_date AND j.jul_to_date;

UPDATE fleet.driving_events AS a
SET veh_type_map = b.veh_type_map,
veh_make_map = b.make,
veh_model_map = b.veh_model_map,
division = b.division,
branch = b.branch,
fleet_no = b.fleet_no
FROM fleet.fleetlist AS b
WHERE a.vehiclereg = b.vehiclereg;
