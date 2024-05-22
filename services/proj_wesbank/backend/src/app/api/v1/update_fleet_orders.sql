ALTER TABLE fleet.orders ENABLE TRIGGER update_shoprite_txn;

UPDATE fleet.orders
SET contract_type = fleetlist.contract_type
FROM fleet.fleetlist
WHERE orders.vehiclereg = fleetlist.vehiclereg;

UPDATE fleet.orders
SET invoice_diff = invoice_amount - amount;

UPDATE fleet.orders AS o
SET fleet_no = b.shoprite_fleet_no
FROM fleet.fleet_no_by_reg AS b
WHERE o.vehiclereg = b.vehiclereg;

UPDATE fleet.orders
SET julian_month = NULL;

UPDATE fleet.orders AS m
SET julian_month = j.selected_month
FROM fleet.julian_cal AS j
WHERE m.date BETWEEN j.jul_from_date AND j.jul_to_date;


UPDATE fleet.orders AS a
SET order_status = 'order_exception'
WHERE lower(a.order_no) NOT IN (SELECT lower(order_no) FROM fleet.maintenance)
AND order_status != 'deleted'
AND order_status IS NULL;

WITH UpdatedInvoices AS (
SELECT fleet.orders.order_no, ARRAY_AGG(DISTINCT maintenance.invoice_no) AS updated_invoice_numbers
FROM fleet.orders
JOIN fleet.maintenance ON fleet.maintenance.order_no = fleet.orders.order_no
GROUP BY fleet.orders.order_no);

UPDATE fleet.orders
SET invoice_no = UpdatedInvoices.updated_invoice_numbers
FROM UpdatedInvoices
WHERE fleet.orders.order_no = UpdatedInvoices.order_no;

UPDATE fleet.orders
SET invoice_amount = 0, invoice_diff = 0;

UPDATE fleet.orders AS a
SET invoice_amount = b.miles_amount
FROM (
SELECT SUM(amount) AS miles_amount, order_no
FROM fleet.maintenance
GROUP BY order_no
) b
WHERE a.order_no = b.order_no;

UPDATE fleet.orders_temp a
SET contract_type = b.contract_type
FROM fleet.fleetlist b
WHERE a.vehiclereg = b.vehiclereg;

UPDATE fleet.orders_temp
SET julian_month = NULL;

UPDATE fleet.orders_temp AS m
SET julian_month = j.selected_month
FROM fleet.julian_cal AS j
WHERE m.date BETWEEN j.jul_from_date AND j.jul_to_date;

UPDATE fleet.orders_temp
SET invoice_amount = 0, invoice_diff = 0;

UPDATE fleet.orders_temp AS o
SET invoice_amount = m.miles_amount
FROM (SELECT SUM(amount) AS miles_amount, order_no FROM fleet.maintenance GROUP BY order_no) AS m
WHERE o.order_no = m.order_no;

UPDATE fleet.orders_temp
SET invoice_diff = amount - invoice_amount;

UPDATE fleet.orders_temp AS a
SET fleet_no = b.fleet_no
FROM fleet.fleetlist AS b
WHERE a.vehiclereg = b.vehiclereg;

UPDATE fleet.orders_temp
SET julian_month = NULL;

UPDATE fleet.orders_temp AS m
SET julian_month = j.selected_month
FROM fleet.julian_cal AS j
WHERE m.date BETWEEN j.jul_from_date AND j.jul_to_date;


UPDATE fleet.trip_data_daily
SET distance = 0
WHERE veh_type_map = 'Trailer';

UPDATE fleet.fleetlist_raw
SET division = fleetlist.division,
branch = fleetlist.branch,
veh_type_map = fleetlist.veh_type_map
FROM fleet.fleetlist
WHERE fleetlist_raw.vhclregistration = fleetlist.vehiclereg;

Update some fields in fleetlist_external based on fleetlist
UPDATE fleet.fleetlist_external
SET division = fleetlist.division,
branch = fleetlist.branch,
veh_type_map = fleetlist.veh_type_map
FROM fleet.fleetlist
WHERE fleetlist_external.registration_number = fleetlist.vehiclereg;

Update contract_start and contract_end in fleetlist based on fleetlist_raw
UPDATE fleet.fleetlist
SET contract_start = fleetlist_raw.startdate,
contract_end = fleetlist_raw.enddate
FROM fleet.fleetlist_raw
WHERE fleetlist_raw.vhclregistration = fleetlist.vehiclereg;

UPDATE fleet.fleetlist
SET veh_type_map = 'Consumables'
WHERE veh_type_map = 'Undefined';

INSERT INTO fleet.supplier_per_branch (division, branch, serviceprovider)
SELECT division, branch, serviceprovider
FROM fleet.maintenance
WHERE division IS NOT NULL
GROUP BY division, branch, serviceprovider
ON CONFLICT DO NOTHING;

ALTER TABLE fleet.orders ENABLE TRIGGER update_shoprite_txn;

UPDATE fleet.fleetlist
SET fleet_no_desc = fleet_no_desc_map.vehicle_type
FROM fleet.fleet_no_desc_map
WHERE LEFT(fleetlist.fleet_no, 2) = fleet_no_desc_map.prefix;

UPDATE fleet.fleetlist
SET fleet_no_desc = fleet_no_desc_map.vehicle_type
FROM fleet.fleet_no_desc_map
WHERE RIGHT(LEFT(fleetlist.fleet_no, 2), 1) != '0'
AND LEFT(fleetlist.fleet_no, 1) = fleet_no_desc_map.prefix;
