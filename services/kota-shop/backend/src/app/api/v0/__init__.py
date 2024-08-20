"""Routes for the V1 API"""

from fastapi import APIRouter

from app.api.v0 import repair_types_page,fuelcard_page,drivers_events_page, helpers,filter_form_populations, date_management_page, per_asset_view_page,cpk_summary_page, invoice_status_view,fleetlist_page,components_page, dashboard_page, expirations_page, landing_page, orders_page,reports,suppliers_page,usage_page, user_permissios_page, stats_page, downtime

from app.api.v1 import preprocessing
v0_router = APIRouter(prefix="/v0")




v0_router.include_router(dashboard_page.dashboard_page_router,tags=["dashboard"])
v0_router.include_router(landing_page.landing_page_router, tags=["landing"])
v0_router.include_router(components_page.components_router, tags=["components"])
v0_router.include_router(expirations_page.expirations_page_router,tags=["expirations"])
v0_router.include_router(fleetlist_page.fleetlist_page_router,tags=["fleetlist"])
v0_router.include_router(orders_page.orders_router, tags=["orders"])
v0_router.include_router(suppliers_page.suppliers_page_router, tags=["suppliers"])
v0_router.include_router(usage_page.usage_page_router, tags=["usage"])
v0_router.include_router(reports.reports_router,  tags=["reports"])
v0_router.include_router(user_permissios_page.users_router, tags=["user permissions"])
v0_router.include_router(invoice_status_view.invoice_status, tags=["invoice status"])
v0_router.include_router(cpk_summary_page.cpks_charts_graphs_router, tags=["cpks charts and graphs"])
v0_router.include_router(per_asset_view_page.assets_view_router, tags = ["per assets view"])
v0_router.include_router(date_management_page.date_management_router, tags = ["date management"])
v0_router.include_router(filter_form_populations.filter_form, tags = ["filter form"])
v0_router.include_router(drivers_events_page.drivers_router, tags = ["drivers events"])
v0_router.include_router(stats_page.stats_router, tags = ["Stats Page"])
v0_router.include_router(fuelcard_page.fuel_card_router, tags = ["FuelCard Page"])
v0_router.include_router(repair_types_page.repair_router, tags = ["Repairs Page"])
v0_router.include_router(downtime.dt_router, tags=["Downtime Tracker"])

### Pre Processing - Please run with caution!!!!
v0_router.include_router(preprocessing.preprocessing, tags=["Pre Processing Apis"])

#### FROM HELPER FILE ###########
# from services.proj_wesbank.backend.src.app.api.v0 import do_not_delete_queries
v0_router.include_router(helpers.helper_func, tags = ["Helper"])