import { Component, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LandingService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { StatsInfoPopupComponent } from './stats-info-popup/stats-info-popup.component';

@Component({
  selector: 'app-stats-row-top',
  templateUrl: './stats-row-top.component.html',
  styleUrls: ['./stats-row-top.component.scss'],
})
export class StatsRowTopComponent {
  @Output() selectedckpSummary: string = '';

  private readonly onDestroy = new Subject<void>();
  //api subscription.  USe to cancel any api calls when user changes form values
  apiSubscription: any;
  //spinner status
  isLoading: boolean = true;

  showAsstsCols: boolean = true;
  totalAssetCount: string = '0';
  totalCosts: string = '0';
  totalBilledCosts: string = '0';
  totalFixedCosts: string = '0';
  totalSaving: string = '0';
  oplCount: number = 0;
  fmlCount: number = 0;
  mmCount: number = 0;
  varOplCosts: string = '0';
  varOplCPK: string = '';
  fixedOplCosts: string = '0';
  fixedOplCPK: string = '0';
  varMmCosts: string = '0';
  varMmCPK: string = '0';
  fixedMmCosts: string = '0';
  fixedMmCPK: string = '0';
  varFmlCPK: string = '0';
  varFmlCosts: string = '0';
  fixedFmlCPK: string = '0';
  fixedFmlCosts: string = '0';
  varBilledCPK: number = 0;
  fixedBilledCPK: string = '0';
  varTotalCPK: string = '0';
  fixedTotalCPK: string = '0';
  totalCPK: string = '0';
  totalDistance: string = '0';
  invvoiceExceptionTotal: string = '0';
  selectedVehType!: string;
  externalOrdersTotal: string = '0';

  constructor(
    private smallForm: SmallFormService,
    private api: LandingService,
    private gs: GlobalService,
    private smallFormService: SmallFormService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    //????
    this.smallForm.showAssetsCols.subscribe((showAsstsCols) => {
      this.showAsstsCols = showAsstsCols;
    });

    //when small form is ready, get the values from it and call api
    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.callApi(this.smallFormService.getFormValues());
        }
      });
  }

  //   import { Subject, Subscription, takeUntil, take } from 'rxjs';
  //  this.api
  //   .getYourData()
  //   .pipe(take(1))
  //   .subscribe({))

  callApi(form: any) {
    this.selectedVehType = form.vehicleType;

    this.isLoading = true;

    this.api
      .sho002LandingStatsV0Sho002LandingPageStatsRowPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (response: any) => {
          // I set var opl costs and cpk to zero, add that to the MM var costs
          this.totalAssetCount = response[0].total_count;
          this.oplCount = response[0].opl_count;
          this.fmlCount = response[0].fml_count;
          this.mmCount = response[0].mm_count;
          this.totalDistance = this.gs.toKM(response[0].total_distance);
          this.fixedMmCosts = this.gs.toZAR(response[0].mm_fixed_cost);
          this.fixedMmCPK = response[0].mm_fixed_cpk.toFixed();
          this.fixedFmlCosts = this.gs.toZAR(response[0].fml_fixed_cost);
          this.fixedFmlCPK = response[0].fml_fixed_cpk.toFixed();

          // this.varOplCosts = this.gs.toZAR(response[0].opl_billed_cost);

          this.fixedOplCosts = this.gs.toZAR(response[0].opl_fixed_cost);
          // this.varOplCPK = (response[0].opl_billed_cpk * 100).toFixed();

          this.fixedOplCPK = response[0].opl_fixed_cpk.toFixed();
          this.fixedTotalCPK = response[0].total_fixed_cpk.toFixed();

          this.totalSaving = this.gs.toZAR(
            response[0].total_savings.toFixed(2)
          );
          this.totalFixedCosts = this.gs.toZAR(
            response[0].total_fixed_cost.toFixed(2)
          );
          this.externalOrdersTotal = this.gs.toZAR(
            response[0].external_orders_total.toFixed(2)
          );

          /////////////// changed to add yellow to billed costs and remove red from fixed costs /////////////
          this.totalCosts = this.gs.toZAR(response[0].total_costs.toFixed(2));
          this.totalCPK = response[0].total_cpk.toFixed();
          this.varMmCosts = this.gs.toZAR(response[0].mm_billed_cost);
          this.varFmlCosts = this.gs.toZAR(response[0].fml_billed_cost);
          this.varFmlCPK = response[0].fml_billed_cpk.toFixed();
          this.varMmCPK = response[0].mm_billed_cpk.toFixed();
          this.totalBilledCosts = this.gs.toZAR(
            response[0].total_billed_costs.toFixed(2)
          );
          this.varOplCosts = this.gs.toZAR('0');
          this.varOplCPK = (0).toFixed();
          this.varTotalCPK = response[0].total_billed_cpk.toFixed();
          this.invvoiceExceptionTotal = this.gs.toZAR(
            response[0].invoice_exception_total.toFixed(2)
          );
          //remove spinner when api is done
          this.isLoading = false;
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
        complete: () => {},
      });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  //when bubble ( mat chip) route to a diffent page
  onChipClick(chipType: string) {
    this.router.navigate(['/cost-details', chipType]);
  }

  //  when fixed cost clicked navigate to orders page
  onChipVariableCost(chipType: string) {
    this.router.navigate(['/orders', chipType]);
  }

  infoPopup() {
    // TODO
    const dialogRef = this.dialog.open(StatsInfoPopupComponent, {
      width: '880px',
      hasBackdrop: true, // Ensure backdrop is enabled
      disableClose: false, // Ensure clicking outside closes the dialog
    });
  }
}
