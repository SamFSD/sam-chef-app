UPDATE fleet.fleetlist_raw
SET division = fleetlist.division,
branch = fleetlist.branch,
veh_type_map = fleetlist.veh_type_map
FROM fleet.fleetlist
WHERE fleetlist_raw.vhclregistration = fleetlist.vehiclereg;

UPDATE fleet.fleetlist_external
SET division = fleetlist.division,
branch = fleetlist.branch,
veh_type_map = fleetlist.veh_type_map
FROM fleet.fleetlist
WHERE fleetlist_external.registration_number = fleetlist.vehiclereg;

UPDATE fleet.fleetlist
SET contract_start = fleetlist_raw.startdate,
contract_end = fleetlist_raw.enddate
FROM fleet.fleetlist_raw
WHERE fleetlist_raw.vhclregistration = fleetlist.vehiclereg;

UPDATE fleet.fleetlist
SET veh_type_map = 'Consumables'
WHERE veh_type_map = 'Undefined';

UPDATE fleet.fleetlist
SET fleet_no_desc = fleet_no_desc_map.vehicle_type
FROM fleet.fleet_no_desc_map
WHERE LEFT(fleetlist.fleet_no, 2) = fleet_no_desc_map.prefix;

UPDATE fleet.fleetlist
SET fleet_no_desc = fleet_no_desc_map.vehicle_type
FROM fleet.fleet_no_desc_map
WHERE RIGHT(LEFT(fleetlist.fleet_no, 2), 1) != '0'
AND LEFT(fleetlist.fleet_no, 1) = fleet_no_desc_map.prefix;

UPDATE fleet.fleetlist AS a
SET last_odo = b.end_odo,
last_odo_date = b.date
FROM (
SELECT DISTINCT ON (vehiclereg) vehiclereg, date, end_odo
FROM fleet.trip_data_daily
ORDER BY vehiclereg, date DESC
) b
WHERE a.vehiclereg = b.vehiclereg;

UPDATE fleet.fleetlist
SET veh_model_map = map;

UPDATE fleet.fleetlist AS a
SET veh_type_map = b.veh_type_map
FROM fleet.type_map_per_reg AS b
WHERE a.vehiclereg = b.vehiclereg;

UPDATE fleet.fleetlist AS a
SET division = b.division
FROM fleet.divisions_new AS b
WHERE b.branch = a.branch;

UPDATE fleet.fleetlist
SET fleet_no = vehiclereg
WHERE fleet_no IS NULL;

UPDATE fleet.fleetlist AS a
SET fleet_no = b.shoprite_fleet_no
FROM fleet.fleet_no_by_reg AS b
WHERE a.vehiclereg = b.vehiclereg;

UPDATE fleet.fleetlist AS a
SET fleet_no = b.shoprite_fleet_no
FROM fleet.fleet_no_by_reg AS b
WHERE a.vehiclereg = b.vehiclereg;

UPDATE fleet.fleetlist
SET fleet_no = vehiclereg
WHERE fleet_no IS NULL;


UPDATE fleet.fleetlist
SET veh_model_map = map;

UPDATE fleet.fleetlist
SET veh_model_map = map;
