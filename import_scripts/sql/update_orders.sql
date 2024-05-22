
--- update orders info

update fleet.orders set order_status = 'unprocessed' where order_status IS Null;

update fleet.orders a
set order_status = 'order_exception'
where a.order_no not in (select order_no from fleet.maintenance)
and order_status != 'deleted' 
and order_status is Null;

WITH UpdatedInvoices AS (
    SELECT
        fleet.orders.order_no,
        ARRAY_AGG(DISTINCT maintenance.invoice_no) AS updated_invoice_numbers
    FROM fleet.orders
    JOIN fleet.maintenance ON fleet.maintenance.order_no = fleet.orders.order_no
    GROUP BY fleet.orders.order_no
)

UPDATE fleet.orders
SET invoice_no = UpdatedInvoices.updated_invoice_numbers
FROM UpdatedInvoices
WHERE fleet.orders.order_no = UpdatedInvoices.order_no;

--update order invoice amounts
update fleet.orders
set invoice_amount = 0,
invoice_diff = 0;
update fleet.orders a
set invoice_amount = b.miles_amount from (select sum(amount) as miles_amount, order_no from  fleet.maintenance
group by order_no) b
where a.order_no = b.order_no;

update fleet.orders
set invoice_diff = invoice_amount- amount;