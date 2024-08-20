INSERT INTO fleet.per_asset_summary (vehiclereg, julian_month, veh_type_map, veh_model_map, branch, division, component, total_distance, total_amount, total_cpk, total_savings)
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
GROUP BY m.vehiclereg, j.selected_month, m.veh_type_map, m.veh_model_map, m.branch, m.division;

UPDATE fleet.per_asset_summary AS pas
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
);
