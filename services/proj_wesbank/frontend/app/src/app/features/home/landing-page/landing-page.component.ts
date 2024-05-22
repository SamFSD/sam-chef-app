import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { SmallFormService } from '../small-form-component/small-form.service';

import { Subject, takeUntil } from 'rxjs';
import { LandingService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent {
  private readonly onDestroy = new Subject<void>();

  selectedDivision!: string;
  selectedVehType!: string;

  landingPageformFilter: FormGroup = new FormGroup({});
  divisions!: [{ label: string; division: string }];
  selectedOptions: { [key: string]: string } = {};
  sankeyData: any;
  piData: any;
  supplierBarData: any;
  componentBarData: any;
  invoiceSatusBarData: any;
  // api property to unsubscribe to any api change

  constructor(
    private api: LandingService,
    private gs: GlobalService,
    private smallForm: SmallFormService
  ) {
    this.smallForm.formPage = 'extension';
    this.smallForm.formLayoutType.next('full-page');
    //remove all other componetn top rows
    this.gs.disableTopRows();
    // show top stats row
    this.gs.showLandingPageTop.next(true);

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
    //when small form is ready, get the values from it and call api
    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.callApi(this.smallForm.getFormValues());
        }
      });
  }

  //method the get the api data based on selected form filters
  callApi(form: any) {
    // pie charts api call to get the data for the pi charts
    this.api
      .sho002VehTypesV0Sho002VehTypesPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe((landingPageAssetTypes: any) => {
        this.piData = landingPageAssetTypes;
      });

    //api call that gets spend per supplier data
    this.api
      .getCostPerSupplierGraphV0GetCostPerSupplierGraphPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe((spendPerSupplier: any) => {
        this.supplierBarData = spendPerSupplier;
      });

    //api call that gets the spend per component data
    this.api
      .getCostPerComponentGraphV0GetCostPerComponentGraphPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe((spendPerComponent: any) => {
        this.componentBarData = spendPerComponent;
      });

    ///api call thats gets the status view graph
    this.api
      .sho002GetInvoiceDiffInvoiceStatusBarV0Sho002GetAccrualGraphNewPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe((res: any) => {
        this.invoiceSatusBarData = res;
      });
  }
}
