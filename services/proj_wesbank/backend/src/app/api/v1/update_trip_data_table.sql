
INSERT INTO fleet.trip_data_daily (date, vehiclereg, distance)
SELECT DATE_TRUNC('day', tripstart), vehiclereg, SUM(distance)
FROM fleet.trip_data
GROUP BY vehiclereg, DATE_TRUNC('day', tripstart)
ON CONFLICT DO NOTHING;

UPDATE fleet.trip_data_daily AS t
SET distance = 0
FROM fleet.trip_data_daily AS t2
WHERE t.vehiclereg = t2.vehiclereg
AND t2.veh_type_map = 'Trailer';

UPDATE fleet.trip_data_daily AS a
SET veh_type_map = b.veh_type_map,
veh_make_map = b.make,
veh_model_map = b.veh_model_map,
division = b.division,
branch = b.branch,
contract_type = b.contract_type,
fleet_no = b.fleet_no
FROM fleet.fleetlist AS b
WHERE a.vehiclereg = b.vehiclereg;

UPDATE fleet.trip_data_daily
SET julian_month = NULL;

UPDATE fleet.trip_data_daily AS m
SET julian_month = j.selected_month
FROM fleet.julian_cal AS j
WHERE m.date BETWEEN j.jul_from_date AND j.jul_to_date;
