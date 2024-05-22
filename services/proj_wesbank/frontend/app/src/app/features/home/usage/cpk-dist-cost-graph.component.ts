import { Component } from '@angular/core';
import { GlobalService } from 'src/app/core/services/global.service';
import { SmallFormService } from '../small-form-component/small-form.service';
import { Subject, takeUntil } from 'rxjs';
import { smallForm } from '../small-form-component/small-form-interface';
import { UsageService } from 'src/app/core/api/api_service';

@Component({
  selector: 'app-cpk-dist-cost-graph',
  templateUrl: './cpk-dist-cost-graph.component.html',
  styleUrls: ['./cpk-dist-cost-graph.component.scss'],
})
export class CpkDistCostGraphComponent {
  private readonly onDestroy = new Subject<void>();
  isLoading: boolean = true;
  graphData: any;
  allTimeGraphData: any;
  perTypeUsageTableData: any;
  perAssetsTableData: any;

  constructor(
    private api: UsageService,
    private gs: GlobalService,
    private smallForm: SmallFormService
  ) {
    this.smallForm.formPage = 'extension';
    this.smallForm.formLayoutType.next('full-page');
    //remove all other componetn top rows
    this.gs.disableTopRows();
    // show top stats row
    this.gs.showCPKUsageTop.next(true);

    // hide component dropdown
    this.smallForm.showMappingDD.next(false);

    // hide supplier dropdown
    this.smallForm.showSupplierDD.next(false);

    //hide and show date selector
    this.smallForm.showDateSelectorDD.next(true);
    this.smallForm.showDateRangeSelector.next(false);
    // hide large form
    this.smallForm.showMake.next(false);
    this.gs.showFleetCardTop.next(false);
  }
  ngOnInit() {
    //get form values on init
    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.callApi(this.smallForm.getFormValues());
        }
      });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  callApi(form: smallForm) {
    this.isLoading = true;

    // api call thats gets the all time graph data
    this.api
      .sho002GetAllTimeCpkUsageGraphV0Sho002GetAllTimeCpkUsageGraphPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.allTimeGraphData = res.chart_data;
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
        complete: () => {},
      });

    // api call that gets per type usage table data
    this.api
      .sho002GetVehTypeUsageTableV0Sho002GetVehTypeUsageTablePost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.perTypeUsageTableData = res;
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
        complete() {},
      });

    /// api call that gets the per assets usage table
    this.api
      .sho002GetVehUsageTableV0Sho002GetVehUsageTablePost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.perAssetsTableData = res;
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
        complete() {},
      });
  }
}
