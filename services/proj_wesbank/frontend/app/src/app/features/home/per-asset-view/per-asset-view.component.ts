import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { GlobalService } from 'src/app/core/services/global.service';
import { TabFormatService } from 'src/app/core/services/tab-format.service';
import { SmallFormService } from '../small-form-component/small-form.service';


@Component({
  selector: 'app-per-asset-view',
  templateUrl: './per-asset-view.component.html',
  styleUrls: ['./per-asset-view.component.scss'],
})
export class PerAssetViewComponent {
  formValue: any;
  formValues: any;
  panelOpenState: boolean = false;
  isSingleReg: boolean = true;

  @Input() drivingEventsDetails: any;
  constructor(
    private gs: GlobalService,
    public smallForm: SmallFormService,
    private tabService: TabFormatService
  ) {
    this.smallForm.formPage = 'pav';
    this.smallForm.formLayoutType.next('full-page');
    this.smallForm.showMappingDD.next(true);
    this.smallForm.showSupplierDD.next(true);
  }

  private readonly onDestroy = new Subject<void>();
  @Input() data: any;

  assetID: string = '';
  summaryData: any[] = [];
  assetFound: boolean = false;
  vehicle: any;
  fleet: any;
  vehicleComponentMonthData: any[] = [];
  vehicleComponentMonth: any;
  selectedMonth!: string;
  julianToDay: any;
  julianFromDay: any;
  currentPeriod: any;
  currentComponent: any;
  components!: any;
  periods: any[] = ['All Time', 'Financial Year to Date', 'Current Month'];
  assetFilterForm: FormGroup = new FormGroup({
    periodFilter: new FormControl('Financial Year to Date'),
    componentFilter: new FormControl('all_components'),
  });
  eventData: any;

  ngOnInit() {
    // console.log(this.formValue, 'whats in here');
    this.gs.showSmallForm.next(true);
    this.gs.disableTopRows();
    this.gs.showPavTopRow.next(true);
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
    this.smallForm.formPage = 'general';
    this.smallForm.showMappingDD.next(false);
    this.smallForm.showSupplierDD.next(false);
  }
}
