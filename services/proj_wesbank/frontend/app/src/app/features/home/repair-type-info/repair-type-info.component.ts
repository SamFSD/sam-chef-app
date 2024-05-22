import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { RepairsPageService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { smallForm } from '../small-form-component/small-form-interface';
import { SmallFormService } from '../small-form-component/small-form.service';

@Component({
  selector: 'app-repair-type-info',
  templateUrl: './repair-type-info.component.html',
  styleUrls: ['./repair-type-info.component.scss'],
})
export class RepairTypeInfoComponent {
  private readonly onDestroy = new Subject<void>();
  repairTypesTopRowData: any;
  cpkPerModel: any;
  spendPerSupplier: any;
  repairTypeAndCounts: any;
  isLoading: boolean = true;

  constructor(
    private gs: GlobalService,
    private smallForm: SmallFormService,
    private repairsApi: RepairsPageService
  ) {
    this.smallForm.formPage = 'extension';
    this.smallForm.formLayoutType.next('full-page');
    //remove all other componetn top rows
    this.gs.disableTopRows();

    //show small form dates select
    this.smallForm.showDateSelectorDD.next(true);
    this.smallForm.showDateRangeSelector.next(false);
    this.smallForm.showMake.next(false);

    // hide component dropdown
    this.smallForm.showMappingDD.next(false);

    //hide supplier dropdown
    this.smallForm.showSupplierDD.next(false);
  }

  ngOnInit(): void {
    // subscribe to form changes and update
    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.isLoading = true;
          this.getRepairTypesData(this.smallForm.getFormValues());
        }
      });
  }
  getRepairTypesData(form: smallForm) {
    this.isLoading = true;
    /// api call to get repair types top row summary
    this.repairsApi
      .getRepairTypesDataV0GetRepairTypesDataPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (data) => {
          // console.log(data, 'data');
          this.repairTypesTopRowData = data;
        },
        error: (err) => {
          this.gs.raiseError(err);
        },
        complete() {},
      });

    /// this api get the cpk per model
    this.repairsApi
      .getCpkPerModelV0GetCpkPerModelPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (data) => {
          this.cpkPerModel = data;
        },
        error: (err) => {
          this.gs.raiseError(err);
        },
        complete() {},
      });

    /// this api call gets the supplier spend per category
    this.repairsApi
      .getSpendPerSupplierCategoryV0GetSpendPerSupplierCategoryPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (data) => {
          // console.log(data, 'data');

          this.spendPerSupplier = data;
        },
        error: (err) => {
          this.gs.raiseError(err);
        },
        complete() {},
      });

    //get repair types and counts for the past 12 month
    this.repairsApi
      .getRepairTypesAndCountsForThePast12MonthV0GetRepairTypesAndCountsForThePast12MonthPost(
        form
      )
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (data) => {
          // console.log(data, 'data');

          this.repairTypeAndCounts = data;
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
