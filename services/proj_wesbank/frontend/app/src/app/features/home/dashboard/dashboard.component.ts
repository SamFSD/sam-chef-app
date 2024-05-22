import { Component, ViewChild } from '@angular/core';
import { GlobalService } from 'src/app/core/services/global.service';
import { SmallFormService } from '../small-form-component/small-form.service';
import { DashboardTopRowComponent } from './dashboard-top-row/dashboard-top-row.component';
import { DashboardService } from 'src/app/core/api/api_service';
import { Subject, takeUntil } from 'rxjs';
import { smallForm } from '../small-form-component/small-form-interface';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  @ViewChild(DashboardTopRowComponent)
  topRowCompoonent!: DashboardTopRowComponent;
  private readonly onDestroy = new Subject<void>();
  fleetCountTableData: any;
  commercialData: any;
  passengerData: any;
  stdDevData: any;

  constructor(
    private gs: GlobalService,
    private smallForm: SmallFormService,
    private api: DashboardService
  ) {
    this.smallForm.formPage = 'extension';
    this.smallForm.formLayoutType.next('full-page');
    //remove all other componetn top rows
    this.gs.disableTopRows();

    // show top dashboard row
    this.gs.showDashboardTopRow.next(true);
    this.gs.showFleetCardTop.next(false);

    //show small form dates select
    this.smallForm.showDateSelectorDD.next(true);
    this.smallForm.showMappingDD.next(false);
    this.smallForm.showSupplierDD.next(false);
    this.smallForm.showDateRangeSelector.next(false);
    this.smallForm.showMake.next(false);
  }

  ngOnInit() {
    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.callApi(this.smallForm.getFormValues());
        }
      });
  }

  callApi(form: smallForm) {
    /// the api that gets the fleet count dashboard table
    this.api
      .getFleetCountV0GetFleetCountPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        complete: () => {},
        error: (err: any) => {
          this.gs.raiseError(err);
        },
        next: (data) => {
          this.commercialData = data.commercial;
          this.passengerData = data.passenger;
        },
      });

    // the api that gets std dav table
    this.api
      .calculateOutliersV0CalculateOutliersPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.stdDevData = res;
        },
        error: (err) => {
          this.gs.raiseError(err);
        },
      });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}
