

--set julian months
update temp.maintenance_temp set julian_month = Null;
UPDATE temp.maintenance_temp AS m
SET julian_month = j.selected_month
FROM fleet.julian_cal AS j
WHERE m.transdate BETWEEN j.jul_from_date AND j.jul_to_date;

---map txns
update temp.maintenance_temp set component_cat = '' where component_cat = '0';
update temp.maintenance_temp set component_cat = '' where component_cat is Null;
update temp.maintenance_temp set maintdescription = '' where maintdescription = 'nan';
update temp.maintenance_temp set mapping = txn_maps.mapping
from fleet.txn_maps
where LOWER(maintenance_temp.veh_type_map || maintenance_temp.maintdescription || maintenance_temp.component_cat) = LOWER(txn_maps.concat);


------ if we need to map cancelled txns

-- update temp.maintenance_cancelled set component_cat = '' where component_cat = '0';
-- update temp.maintenance_cancelled set component_cat = '' where component_cat is Null;
-- update temp.maintenance_cancelled set maintdescription = '' where maintdescription = 'nan';
-- update temp.maintenance_cancelled set mapping = txn_maps.mapping
-- from fleet.txn_maps
-- where LOWER(maintenance_cancelled.veh_type_map || maintenance_cancelled.maintdescription || maintenance_cancelled.component_cat) = LOWER(txn_maps.concat);

 --map vehicle infor to txns to txns
update temp.maintenance_temp
set
    veh_type_map = fleetlist.veh_type_map, 
    veh_make_map = fleetlist.make, 
    veh_model_map = fleetlist.veh_model_map, 
    contract_type = fleetlist.contract_type, 
    division = fleetlist.division,
    branch = fleetlist.branch
from
    fleet.fleetlist
where
    temp.maintenance_temp.vehiclereg = fleetlist.vehiclereg;

---set invoice status'
update temp.maintenance_temp set invoice_status = Null;
update temp.maintenance_temp a
set invoice_status = 'invoice_exception'
where a.order_no not in (select order_no from fleet.orders);

update temp.maintenance_temp a
set invoice_status = 'accrual'
where a.order_no in (select order_no from fleet.orders)
and invoice_no = 'not_invoiced';

update temp.maintenance_temp a
set invoice_status = 'completed'
where a.order_no in (select order_no from fleet.orders)
and invoice_no <> 'not_invoiced';
