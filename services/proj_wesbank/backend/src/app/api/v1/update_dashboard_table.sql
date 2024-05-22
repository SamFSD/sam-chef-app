DELETE FROM fleet.dashboard;

INSERT INTO fleet.dashboard (division, branch, veh_type_map, month, amount, distance)
SELECT m.division, m.branch, m.veh_type_map, TO_DATE(CONCAT(EXTRACT(YEAR FROM m.transdate), '-', EXTRACT(MONTH FROM m.transdate), '-01'), 'YYYY-MM-DD') AS month, SUM(m.amount) AS amount, SUM(t.distance) AS distance
FROM fleet.maintenance m
LEFT JOIN fleet.trip_data_daily t ON m.division = t.division AND m.branch = t.branch AND m.veh_type_map = t.veh_type_map AND TO_DATE(CONCAT(EXTRACT(YEAR FROM m.transdate), '-', EXTRACT(MONTH FROM m.transdate), '-01'), 'YYYY-MM-DD') = t.date
GROUP BY m.division, m.branch, m.veh_type_map, month;
