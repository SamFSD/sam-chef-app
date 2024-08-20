DELETE FROM fleet.month_cost_per_asset;

INSERT INTO fleet.month_cost_per_asset (vehiclereg, fleet_no, branch, division, julian_month, amount, veh_type_map)
SELECT vehiclereg, fleet_no, branch, division, julian_month, SUM(amount) AS amount, veh_type_map
FROM fleet.maintenance
WHERE julian_month IS NOT NULL
GROUP BY vehiclereg, fleet_no, branch, division, julian_month, veh_type_map
ON CONFLICT ON CONSTRAINT unique_constraint DO UPDATE SET amount = EXCLUDED.amount;
