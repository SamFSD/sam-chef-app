import { Component } from '@angular/core';
import { PerAssetsViewService } from 'src/app/core/api/api_service';
import { PavSelectorService } from '../pav-selector.service';
import { Subject, takeUntil } from 'rxjs';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { GlobalService } from 'src/app/core/services/global.service';

@Component({
  selector: 'app-vehicle-stats',
  templateUrl: './vehicle-stats.component.html',
  styleUrls: ['./vehicle-stats.component.scss'],
})
export class VehicleStatsComponent {
  formValue: any;
  constructor(
    private api: PerAssetsViewService,
    private pavForm: PavSelectorService,
    private gs: GlobalService,
    private smallForm: SmallFormService,
  ) { }

  private readonly onDestroy = new Subject<void>();

  vehiclereg: string = '';
  fleetNo: string = '';
  make: string = '';
  model: string = '';
  type: string = '';
  branch: string = '';
  contractDur: string = '';
  licenseExp: string = '';
  completed: string = 'R 0.00';
  invoiceException: string = 'R 0.00';
  accrual: string = 'R 0.00';
  orderException: string = 'R 0.00';
  period: string = '';
  component: string = 'all_components';
  isLoading: boolean = true;

  ngOnInit() {
    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.callApi();
        }
      })
  }


  callApi() {
    this.api
      .getPavVehicleStatsV0GetPavVehicleStatsPost(
        this.smallForm.getFormValues()
      )
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.vehiclereg = res.vehiclereg;
          this.fleetNo = res.fleet_no;
          this.make = res.make;
          this.model = res.model;
          this.type = res.type;
          this.branch = res.branch;
          this.contractDur = res.contract_duration;
          this.licenseExp = res.license_expiration;
          this.isLoading = false;
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
        complete: () => { },
      });
    this.api
      .getPavInvoiceStatusV0GetPavInvoiceStatusPost(
        this.smallForm.getFormValues()
      )
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          if (res[0].completed_invoice != '') {
            this.completed = 'R ' + res[0].completed_invoice.toString();
          } else this.completed = 'R 0.00';
          if (res[0].invoice_exception != '') {
            this.invoiceException =
              'R ' + res[0].invoice_exception.toString();
          } else this.invoiceException = 'R 0.00';
          if (res[0].accruals != '') {
            this.accrual = 'R ' + res[0].accruals.toString();
          } else this.accrual = 'R 0.00';
          if (res[0].orders_exception != '') {
            this.orderException = 'R ' + res[0].orders_exception.toString();
          } else this.orderException = 'R 0.00';
          this.isLoading = false
        },
        error: (err: any) => {
          this.gs.raiseError(err)
        },
        complete: () => { },
      });




  }
  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}
//I changed something, compile again you fuck
