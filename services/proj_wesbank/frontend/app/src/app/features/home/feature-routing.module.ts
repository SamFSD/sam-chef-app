import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@auth0/auth0-angular';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ComponentBarComponent } from './landing-page/component-bar/component-bar.component';
import { ReportDownloadsComponent } from './report-downloads/report-downloads.component';
import { CpkDistCostGraphComponent } from './usage/cpk-dist-cost-graph.component';
import { HomeComponent } from './home.component';
import { OrdersComponent } from './orders/orders.component';
import { InvoiceStatusViewComponent } from './invoice-status-view/invoice-status-view.component';
import { AccrualsInvoicesComponent } from './invoice-status-view/accruals-invoices/accruals-invoices.component';
import { CompletedInvoicesComponent } from './invoice-status-view/completed-invoices/completed-invoices.component';
import { InvoiceExceptionsComponent } from './invoice-status-view/invoice-exceptions/invoice-exceptions.component';
import { OrdersExceptionsComponent } from './invoice-status-view/orders-exceptions/orders-exceptions.component';
import { OverviewDashComponent } from './overview-dash/overview-dash.component';
import { PerAssetViewComponent } from './per-asset-view/per-asset-view.component';
import { FleetlistComponent } from './fleetlist/fleetlist.component';
import { DivisionDetailedComponent } from './division-detailed/division-detailed.component';
import { ExpirationsComponent } from './expirations/expirations.component';
import { SupplierComponentComponent } from './supplier-component/supplier-component.component';
import { ComponentDetailsComponent } from './component-details/component-details.component';
import { UserPermissionsComponent } from './user-permissions/user-permissions.component';
import { TestComponentComponent } from './test-component/test-component.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { StatsComponent } from './stats/stats.component';
import { FleetcardComponent } from './fleetcard/fleetcard.component';
import { RepairTypeInfoComponent } from './repair-type-info/repair-type-info.component';
import { DowntimeComponent } from './downtime/downtime.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { DrivingEventsComponent } from './driving-events/driving-events.component';


const routes: Routes = [
  // { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
  {
    path: '',
    component: WelcomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'repair-types',
    component: RepairTypeInfoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'driving-event',
    component: DrivingEventsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'users',
    component: UserPermissionsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'Fleetcard',
    component: FleetcardComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'Component',
    component: ComponentBarComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'reports',
    component: ReportDownloadsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'usage',
    component: CpkDistCostGraphComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'home',
    component: LandingPageComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'expirations',
    component: ExpirationsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'orders/:type',
    component: OrdersComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'invoice-status-view',
    component: InvoiceStatusViewComponent,
    canActivate: [AuthGuard],

    children: [
      {
        path: 'accruals-invoices',
        component: AccrualsInvoicesComponent,
      },
      {
        path: 'completed-invoices',
        component: CompletedInvoicesComponent,
      },
      {
        path: 'invoice-exceptions',
        component: InvoiceExceptionsComponent,
      },
      {
        path: 'orders-exceptions',
        component: OrdersExceptionsComponent,
      },
    ],
  },
  {
    path: 'branch-overview',
    component: OverviewDashComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'fleetlist',
    component: FleetlistComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'viewasset',
    component: PerAssetViewComponent,
    canActivate: [AuthGuard],
  },

  // { path: 'Branch-Details', component: BranchDetailsComponent },
  {
    path: 'viewdivision/:divisionName',
    component: DivisionDetailedComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'component-details',
    component: ComponentDetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'supplier',
    component: SupplierComponentComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'stats',
    component: StatsComponent,
    canActivate: [AuthGuard],
  },
  { path: 'downtime', component: DowntimeComponent, canActivate: [AuthGuard] },

  { path: 'test', component: TestComponentComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeatureRoutingModule {}
