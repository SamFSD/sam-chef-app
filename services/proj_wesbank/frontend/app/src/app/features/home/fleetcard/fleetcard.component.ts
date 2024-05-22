import { Component } from '@angular/core';
import { forkJoin, Subject, takeUntil, tap } from 'rxjs';
import { FuelCardPageService } from 'src/app/core/api/api_service/api/fuelCardPage.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { smallForm } from '../small-form-component/small-form-interface';
import { SmallFormService } from '../small-form-component/small-form.service';

@Component({
  selector: 'app-fleetcard',
  templateUrl: './fleetcard.component.html',
  styleUrls: ['./fleetcard.component.scss'],
})
export class FleetcardComponent {
  private readonly onDestroy = new Subject<void>();
  spendpercategory: any;
  descriptionandAmtData: any;
  fuelSpendGraph: any;
  fleetcardTopRow: any;
  fuelCpkAndCons: any;

  noData: string = 'No Data For Selected Filter';

  constructor(
    private gs: GlobalService,
    private smallForm: SmallFormService,
    private fleetcardApi: FuelCardPageService
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

  ngOnInit() {
    // subscribe to form changes and update
    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.getFleetCardData(this.smallForm.getFormValues());
        }
      });
  }

  getFleetCardData(form: smallForm) {
    this.fleetcardApi
      .fuelCardAndFuelDataV0FuelCardAndFuelDataPost(form)
      .subscribe({
        next: (data) => {
          this.fleetcardTopRow = data;
        },
        error: (err) => {
          this.gs.raiseError(err);
        },
        complete() {},
      });

    this.fleetcardApi.fuelSpendPerCatV0FuelSpendPerCatPost(form).subscribe({
      next: (data) => {
        this.spendpercategory = data.transaction;
        this.fuelSpendGraph = data.monthly_data;
      },
      error: (err) => {
        this.gs.raiseError(err);
      },
      complete() {},
    });

    this.fleetcardApi.getFcTransactionsV0GetFcTransactionsPost(form).subscribe({
      next: (data) => {
        this.fuelCpkAndCons = data;
      },
      error: (err) => {
        this.gs.raiseError(err);
      },
      complete() {},
    });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}
