-- UPDATE fleet.maintenance SET component_cat = '' WHERE component_cat = '0';

-- UPDATE fleet.maintenance SET component_cat = '' WHERE component_cat IS NULL;

-- UPDATE fleet.maintenance SET maintdescription = '' WHERE maintdescription = 'nan';

-- UPDATE fleet.maintenance AS m SET mapping = tm.mapping FROM fleet.txn_maps AS tm
-- WHERE LOWER(m.veh_type_map || m.maintdescription || m.component_cat) = LOWER(tm.concat);

-- UPDATE fleet.maintenance_cancelled SET veh_type_map = fleetlist.veh_type_map,
-- veh_make_map = fleetlist.make, veh_model_map = fleetlist.veh_model_map,
-- contract_type = fleetlist.contract_type, division = fleetlist.division,
-- branch = fleetlist.branch, fleet_no = fleetlist.fleet_no
-- FROM fleet.fleetlist WHERE maintenance_cancelled.vehiclereg = fleetlist.vehiclereg;


-- UPDATE fleet.maintenance_cancelled SET component_cat = '' WHERE component_cat = '0';

-- UPDATE fleet.maintenance_cancelled SET component_cat = '' WHERE component_cat IS NULL;

-- UPDATE fleet.maintenance_cancelled SET maintdescription = '' WHERE maintdescription = 'nan';

-- UPDATE fleet.maintenance_cancelled SET mapping = txn_maps.mapping FROM fleet.txn_maps WHERE LOWER(maintenance_cancelled.veh_type_map || maintenance_cancelled.maintdescription || maintenance_cancelled.component_cat) = LOWER(txn_maps.concat);

UPDATE fleet.maintenance SET julian_month = NULL;

-- UPDATE fleet.maintenance AS m SET julian_month = j.selected_month FROM fleet.julian_cal AS j
-- WHERE m.transdate BETWEEN j.jul_from_date AND j.jul_to_date;

-- UPDATE fleet.maintenance SET invoice_status = NULL;

-- UPDATE fleet.maintenance AS a SET invoice_status = 'invoice_exception'
-- WHERE lower(a.order_no) NOT IN (SELECT lower(order_no) FROM fleet.orders);

-- UPDATE fleet.maintenance AS a SET invoice_status = 'accrual'
-- WHERE lower(a.order_no) IN (SELECT lower(order_no) FROM fleet.orders)
-- AND invoice_no = 'not_invoiced';

-- UPDATE fleet.maintenance AS a SET invoice_status = 'completed' WHERE lower(a.order_no) IN (SELECT lower(order_no) FROM fleet.orders)
-- AND invoice_no <> 'not_invoiced';

-- UPDATE fleet.maintenance SET veh_type_map = fleetlist.veh_type_map, veh_make_map = fleetlist.make,
-- veh_model_map = fleetlist.veh_model_map, contract_type = fleetlist.contract_type,
-- division = fleetlist.division, branch = fleetlist.branch,
-- fleet_no = fleetlist.fleet_no FROM fleet.fleetlist
-- WHERE maintenance.vehiclereg = fleetlist.vehiclereg;


