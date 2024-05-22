UPDATE temp.trip_temp 
SET distance = 0
WHERE veh_type_map = 'Trailer';


UPDATE temp.trip_temp  AS a
SET veh_type_map = b.veh_type_map,
veh_make_map = b.make,
veh_model_map = b.veh_model_map,
division = b.division,
branch = b.branch,
contract_type = b.contract_type,
fleet_no = b.fleet_no
FROM fleet.fleetlist AS b
WHERE a.vehiclereg = b.vehiclereg;


UPDATE temp.trip_temp 
SET julian_month = NULL;


UPDATE temp.trip_temp  AS m
SET julian_month = j.selected_month
FROM fleet.julian_cal AS j
WHERE m.date BETWEEN j.jul_from_date AND j.jul_to_date;


--insert from temp table into main table
insert into fleet.trip_data_daily (
    select * from temp.trip_temp
) on conflict do nothing;

--clear out temp table
delete from temp.trip_temp;