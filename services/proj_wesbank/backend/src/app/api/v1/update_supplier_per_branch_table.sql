INSERT INTO fleet.supplier_per_branch (division, branch, serviceprovider)
SELECT division, branch, serviceprovider
FROM fleet.maintenance
WHERE division IS NOT NULL
GROUP BY division, branch, serviceprovider
ON CONFLICT DO NOTHING;