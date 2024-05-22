import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxEchartsModule } from 'ngx-echarts';
import { ToTabZARPipe } from 'src/app/core/pipes/to-tab-zar.pipe';
import { MaterialModule } from 'src/app/material.module';
import { GraphSkeletonComponent } from 'src/app/notifications/graph-skeleton/graph-skeleton.component';
import { SkeletonComponent } from 'src/app/notifications/skeleton/skeleton.component';
import { TabulatorModule } from 'src/app/tabulator.module';
import { ComponentCostPerSupplierGraphComponent } from './component-details/component-cost-per-supplier-graph/component-cost-per-supplier-graph.component';
import { ComponentCostPerVehTypeGraphComponent } from './component-details/component-cost-per-veh-type-graph/component-cost-per-veh-type-graph.component';
import { ComponentDetailedInvoiceTableComponent } from './component-details/component-detailed-invoice-table/component-detailed-invoice-table.component';
import { ComponentDetailsComponent } from './component-details/component-details.component';
import { ComponentOdoScatterComponent } from './component-details/component-odo-scatter/component-odo-scatter.component';
import { CompCpkYtdGraphComponent } from './component-details/component-row-top/comp-cpk-ytd-graph/comp-cpk-ytd-graph.component';
import { ComponentCostPerAssetPopupTableComponent } from './component-details/component-row-top/component-cost-per-asset-popup-table/component-cost-per-asset-popup-table.component';
import { ComponentRowTopComponent } from './component-details/component-row-top/component-row-top.component';
import { PerComponentSpendYtdComponent } from './component-details/per-component-spend-ytd/per-component-spend-ytd.component';
import { DashboardGraphsComponent } from './dashboard/dashboard-graphs/dashboard-graphs.component';
import { DashboardGuagesComponent } from './dashboard/dashboard-guages/dashboard-guages.component';
import { DashboardTablesComponent } from './dashboard/dashboard-tables/dashboard-tables.component';
import { DashboardTopRowComponent } from './dashboard/dashboard-top-row/dashboard-top-row.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FleetCountTableComponent } from './dashboard/fleet-count-table/fleet-count-table.component';
import { DashStddevPopupComponent } from './dashboard/stddeviation/dash-stddev-popup/dash-stddev-popup.component';
import { StddeviationComponent } from './dashboard/stddeviation/stddeviation.component';
import { BranchComponentCpkBarsComponent } from './division-detailed/branch-component-cpks/branch-component-cpk-bars/branch-component-cpk-bars.component';
import { BranchComponentCpksComponent } from './division-detailed/branch-component-cpks/branch-component-cpks.component';
import { ComponentCostsHolderComponent } from './division-detailed/component-costs-holder/component-costs-holder.component';
import { DivisionDetailedComponent } from './division-detailed/division-detailed.component';
import { DivisionQuickStatsComponent } from './division-detailed/division-quick-stats/division-quick-stats.component';
import { HeaderStatsComponent } from './division-detailed/header-stats/header-stats.component';
import { SupplierOverviewComponent } from './division-detailed/supplier-overview/supplier-overview.component';
import { BranchDistPodiumComponent } from './division-detailed/usage-holder/branch-dist-podium/branch-dist-podium.component';
import { UsageHolderComponent } from './division-detailed/usage-holder/usage-holder.component';
import { DowntimeComponent } from './downtime/downtime.component';
import { DtEndPopupComponent } from './downtime/dt-end-popup/dt-end-popup.component';
import { DtPopupComponent } from './downtime/dt-popup/dt-popup.component';
import { BiGuagesComponent } from './driving-events/bi-guages/bi-guages.component';
import { DrivingEventsTableComponent } from './driving-events/driving-events-table/driving-events-table.component';
import { DrivingEventsTopComponent } from './driving-events/driving-events-top/driving-events-top.component';
import { DrivingEventsComponent } from './driving-events/driving-events.component';
import { DriversEventsMapsComponent } from './driving-events/events-maps/drivers-events-maps.component';
import { ExpirationsTopRowComponent } from './expirations/expirations-top-row/expirations-top-row.component';
import { ExpirationsPopuTableComponent } from './expirations/expirations-top-row/upcoming-expirations/expirations-popup-table/expirations-popu-table.component';
import { UpcomingExpirationsComponent } from './expirations/expirations-top-row/upcoming-expirations/upcoming-expirations.component';
import { ExpirationsComponent } from './expirations/expirations.component';
import { VehContractExpirationsTableComponent } from './expirations/veh-contract-expirations-table/veh-contract-expirations-table.component';
import { VehLicenseExpirationsTableComponent } from './expirations/veh-license-expirations-table/veh-license-expirations-table.component';
import { FeatureRoutingModule } from './feature-routing.module';
import { FleetcardTopRowComponent } from './fleetcard/fleetcard-top-row/fleetcard-top-row.component';
import { FleetcardComponent } from './fleetcard/fleetcard.component';
import { FuelCpkAndConsuptionsComponent } from './fleetcard/fuel-cpk-and-consuptions/fuel-cpk-and-consuptions.component';
import { FuelSpendAndConsumptionComponent } from './fleetcard/fuel-spend-and-consumption/fuel-spend-and-consumption.component';
import { FuelSpendPerMonthGraphComponent } from './fleetcard/fuel-spend-per-month-graph/fuel-spend-per-month-graph.component';
import { SpendPerSupCategoryComponent } from './fleetcard/spend-per-sup-category/spend-per-sup-category.component';
import { FleetlistComponent } from './fleetlist/fleetlist.component';
import { VehicleCountComponent } from './fleetlist/vehicle-count/vehicle-count.component';
import { HomeComponent } from './home.component';
import { InfoPopupComponent } from './info-popup/info-popup.component';
import { AccrualsInvoicesComponent } from './invoice-status-view/accruals-invoices/accruals-invoices.component';
import { CompletedInvoicesComponent } from './invoice-status-view/completed-invoices/completed-invoices.component';
import { InvoiceExceptionsComponent } from './invoice-status-view/invoice-exceptions/invoice-exceptions.component';
import { InvoiceStatusSankeyComponent } from './invoice-status-view/invoice-status-sankey/invoice-status-sankey.component';
import { InvoiceStatusTopRowComponent } from './invoice-status-view/invoice-status-top-row/invoice-status-top-row.component';
import { InvoiceStatusViewComponent } from './invoice-status-view/invoice-status-view.component';
import { OrdersExceptionsComponent } from './invoice-status-view/orders-exceptions/orders-exceptions.component';
import { InvoiceTableComponent } from './invoice-table/invoice-table.component';
import { ComponentBarComponent } from './landing-page/component-bar/component-bar.component';
import { InvoiceStatusBarComponent } from './landing-page/invoice-status-bar/invoice-status-bar.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { StatsInfoPopupComponent } from './landing-page/stats-row-top/stats-info-popup/stats-info-popup.component';
import { SupplierBarComponent } from './landing-page/supplier-bar/supplier-bar.component';
import { VehicleCountPieComponent } from './landing-page/vehicle-count-pie/vehicle-count-pie.component';
import { DownloadPopupComponent } from './orders/download-popup/download-popup.component';
import { InvoicePopupComponent } from './orders/invoice-popup/invoice-popup.component';
import { OrdersPageHolderComponent } from './orders/orders-page-holder/orders-page-holder.component';
import { OrdersPopupComponent } from './orders/orders-popup/orders-popup.component';
import { OrdersTopRowComponent } from './orders/orders-top-row/orders-top-row.component';
import { OrdersComponent } from './orders/orders.component';
import { AvgTripDistRankerComponent } from './overview-dash/branch-holder/avg-trip-dist-ranker/avg-trip-dist-ranker.component';
import { BranchHolderComponent } from './overview-dash/branch-holder/branch-holder.component';
import { ComponentCostRankerComponent } from './overview-dash/branch-holder/component-cost-ranker/component-cost-ranker.component';
import { ContractExpireyRankerComponent } from './overview-dash/branch-holder/contract-expirey-ranker/contract-expirey-ranker.component';
import { CpkModelRankerComponent } from './overview-dash/branch-holder/cpk-model-ranker/cpk-model-ranker.component';
import { CpkRankerComponent } from './overview-dash/branch-holder/cpk-ranker/cpk-ranker.component';
import { DistanceRankerComponent } from './overview-dash/branch-holder/distance-ranker/distance-ranker.component';
import { PiChartComponent } from './overview-dash/branch-holder/pi-chart/pi-chart.component';
import { TotalCostsRankerComponent } from './overview-dash/branch-holder/total-costs-ranker/total-costs-ranker.component';
import { VehlicExpireyRankerComponent } from './overview-dash/branch-holder/vehlic-expirey-ranker/vehlic-expirey-ranker.component';
import { OverviewDashComponent } from './overview-dash/overview-dash.component';
import { AssetUsageComponent } from './per-asset-view/asset-usage/asset-usage.component';
import { PavComponentSummaryComponent } from './per-asset-view/pav-component-summary/pav-component-summary.component';
import { PavSupplierSummaryComponent } from './per-asset-view/pav-supplier-summary/pav-supplier-summary.component';
import { PavTopRowComponent } from './per-asset-view/pav-top-row/pav-top-row.component';
import { PavUsageSummaryComponent } from './per-asset-view/pav-usage-summary/pav-usage-summary.component';
import { CostsPodiumComponent } from './per-asset-view/per-asset-heading/costs-podium/costs-podium.component';
import { PerAssetHeadingComponent } from './per-asset-view/per-asset-heading/per-asset-heading.component';
import { PerAssetViewComponent } from './per-asset-view/per-asset-view.component';
import { RadarChartComponent } from './per-asset-view/radar-chart/radar-chart.component';
import { VehicleStatsComponent } from './per-asset-view/vehicle-stats/vehicle-stats.component';
import { CpkPerModelAndVehTypeComponent } from './repair-type-info/cpk-per-model-and-veh-type/cpk-per-model-and-veh-type.component';
import { GraphSpendPerCarPerMonthComponent } from './repair-type-info/graph-spend-per-car-per-month/graph-spend-per-car-per-month.component';
import { RepairTypeInfoComponent } from './repair-type-info/repair-type-info.component';
import { RepairTypeTopComponent } from './repair-type-info/repair-type-top/repair-type-top.component';
import { TotalSpendPerSupPerCatComponent } from './repair-type-info/total-spend-per-sup-per-cat/total-spend-per-sup-per-cat.component';
import { CpkPerCatComponent } from './repair-type-info/veh-cost/cpk-per-cat/cpk-per-cat.component';
import { ReportDownloadsComponent } from './report-downloads/report-downloads.component';
import { MonthpickerComponent } from './small-form-component/monthpicker/monthpicker.component';
import { SmallFormComponentComponent } from './small-form-component/small-form-component.component';
import { StatsComponentBoxComponent } from './stats/stats-component-box/stats-component-box.component';
import { StatsSankeyComponent } from './stats/stats-sankey/stats-sankey.component';
import { StatsSupplierBoxComponent } from './stats/stats-supplier-box/stats-supplier-box.component';
import { StatsTopRowComponent } from './stats/stats-top-row/stats-top-row.component';
import { StatsComponent } from './stats/stats.component';
import { ComponentTableComponent } from './supplier-component/component-table/component-table.component';
import { SupplierComponentComponent } from './supplier-component/supplier-component.component';
import { SupplierInvoiceTableComponent } from './supplier-component/supplier-invoice-table/supplier-invoice-table.component';
import { SupplierSankeyComponent } from './supplier-component/supplier-sankey/supplier-sankey.component';
import { SpendPerTypeBarComponent } from './supplier-component/supplier-top-row/spend-per-type-bar/spend-per-type-bar.component';
import { SupplierTopRowComponent } from './supplier-component/supplier-top-row/supplier-top-row.component';
import { VehTypeTableComponent } from './supplier-component/veh-type-table/veh-type-table.component';
import { TestComponentComponent } from './test-component/test-component.component';
import { AllTimeGraphComponent } from './usage/all-time-graph/all-time-graph.component';
import { CpkDistCostGraphComponent } from './usage/cpk-dist-cost-graph.component';
import { OneMonthGraphComponent } from './usage/one-month-graph/one-month-graph.component';
import { PerAssetUsageTableComponent } from './usage/usage-top-row/per-asset-usage-table/per-asset-usage-table.component';
import { PerTypeUsageTableComponent } from './usage/usage-top-row/per-type-usage-table/per-type-usage-table.component';
import { UsageTopRowComponent } from './usage/usage-top-row/usage-top-row.component';
import { UserPermissionDisplayComponent } from './user-permissions/user-permission-display/user-permission-display.component';
import { UserPermissionsComponent } from './user-permissions/user-permissions.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { FilterFormComponent } from 'src/app/core/components/filter-form/filter-form.component';


@NgModule({
  declarations: [
    ToTabZARPipe,
    RepairTypeInfoComponent,
    FleetcardComponent,
    OrdersPageHolderComponent,
    OrdersTopRowComponent,
    UserPermissionDisplayComponent,
    UserPermissionsComponent,
    StatsInfoPopupComponent,
    MonthpickerComponent,
    DashboardComponent,
    DashboardTablesComponent,
    DashboardGuagesComponent,
    DashboardTopRowComponent,
    ComponentDetailsComponent,
    ComponentCostPerSupplierGraphComponent,
    ComponentCostPerVehTypeGraphComponent,
    ComponentDetailedInvoiceTableComponent,
    ComponentOdoScatterComponent,
    ComponentRowTopComponent,
    PerComponentSpendYtdComponent,
    SupplierComponentComponent,
    SupplierSankeyComponent,
    SupplierComponentComponent,
    SupplierTopRowComponent,
    SpendPerTypeBarComponent,
    SupplierInvoiceTableComponent,
    ComponentTableComponent,
    VehTypeTableComponent,
    OrdersPopupComponent,
    OrdersComponent,
    InfoPopupComponent,
    VehicleCountComponent,
    HomeComponent,
    SkeletonComponent,
    GraphSkeletonComponent,
    TabulatorDemoComponent,
    FilterFormComponent,
    OverviewDashComponent,
    InvoiceStatusTopRowComponent,
    FleetlistComponent,
    PerAssetViewComponent,
    PerAssetHeadingComponent,
    AssetUsageComponent,
    RadarChartComponent,
    CostsPodiumComponent,
    InvoiceTableComponent,
    BranchHolderComponent,
    PiChartComponent,
    CpkRankerComponent,
    DistanceRankerComponent,
    ComponentCostRankerComponent,
    TotalCostsRankerComponent,
    CpkModelRankerComponent,
    AvgTripDistRankerComponent,
    ContractExpireyRankerComponent,
    VehlicExpireyRankerComponent,
    DivisionDetailedComponent,
    BranchComponentCpksComponent,
    BranchComponentCpkBarsComponent,
    DivisionQuickStatsComponent,
    HeaderStatsComponent,
    SupplierOverviewComponent,
    UsageHolderComponent,
    BranchDistPodiumComponent,
    ComponentCostsHolderComponent,
    LandingPageComponent,
    SupplierBarComponent,
    ComponentBarComponent,
    CpkDistCostGraphComponent,

    VehicleCountPieComponent,
    SmallFormComponentComponent,
    InvoiceStatusBarComponent,
    InvoiceStatusViewComponent,
    AccrualsInvoicesComponent,
    CompletedInvoicesComponent,
    InvoiceExceptionsComponent,
    OrdersExceptionsComponent,
    ReportDownloadsComponent,
    CompCpkYtdGraphComponent,
    ComponentCostPerAssetPopupTableComponent,
    InvoiceStatusSankeyComponent,
    OneMonthGraphComponent,
    AllTimeGraphComponent,
    UsageTopRowComponent,
    PerTypeUsageTableComponent,
    PerAssetUsageTableComponent,
    ExpirationsComponent,
    ExpirationsTopRowComponent,
    VehLicenseExpirationsTableComponent,
    VehContractExpirationsTableComponent,
    UpcomingExpirationsComponent,
    ExpirationsPopuTableComponent,
    StddeviationComponent,
    FleetCountTableComponent,
    DownloadPopupComponent,
    PavComponentSummaryComponent,
    PavSupplierSummaryComponent,
    VehicleStatsComponent,
    PavUsageSummaryComponent,
    TestComponentComponent,
    DashboardGraphsComponent,
    PavTopRowComponent,

    InvoicePopupComponent,
    DriversEventsMapsComponent,
    DashStddevPopupComponent,
    StatsComponent,
    StatsTopRowComponent,
    StatsSankeyComponent,
    StatsSupplierBoxComponent,
    StatsComponentBoxComponent,
    FleetcardTopRowComponent,
    SpendPerSupCategoryComponent,
    FuelCpkAndConsuptionsComponent,
    FuelSpendAndConsumptionComponent,
    FuelSpendPerMonthGraphComponent,
    RepairTypeTopComponent,
    TotalSpendPerSupPerCatComponent,
    CpkPerModelAndVehTypeComponent,
    CpkPerCatComponent,
    GraphSpendPerCarPerMonthComponent,
    DowntimeComponent,
    DtPopupComponent,
    DtEndPopupComponent,
    WelcomeComponent,
    DrivingEventsComponent,
    BiGuagesComponent,
    DrivingEventsTopComponent,
    DrivingEventsTableComponent,
    // DriverBiScoresTableComponent,
  ],
  imports: [
    AgGridModule,
    MatAutocompleteModule,
    MaterialModule,
    CommonModule,
    RouterModule,
    NgxEchartsModule.forRoot({ echarts: () => import('echarts') }),
    ReactiveFormsModule,
    FormsModule,
    FeatureRoutingModule,
    NgApexchartsModule,
    BrowserAnimationsModule,
    TabulatorModule,
  ],
  exports: [
    FleetcardTopRowComponent,
    SmallFormComponentComponent,
    StatsTopRowComponent,
    InvoiceStatusTopRowComponent,
    UsageTopRowComponent,
    ExpirationsTopRowComponent,
    SupplierTopRowComponent,
    ComponentRowTopComponent,
    VehicleCountComponent,
    DashboardTopRowComponent,
    PavTopRowComponent,
    OrdersTopRowComponent,
  ],
})
export class FeaturesModule {}
