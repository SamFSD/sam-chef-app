import { Component, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { FilterFormService } from 'src/app/core/api/api_service';
import { SmallFormService } from './small-form.service';

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatOption,
} from '@angular/material/core';

import { MomentDateAdapter } from '@angular/material-moment-adapter';
import {
  MatCalendarCellClassFunction
} from '@angular/material/datepicker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { GlobalService } from 'src/app/core/services/global.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatAccordion } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-small-form-component',
  templateUrl: './small-form-component.component.html',
  styleUrls: ['./small-form-component.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_DATE_FORMATS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class SmallFormComponentComponent {
  @ViewChild('allTypesSelected') allTypesSelected!: MatOption; // vehicle types
  @ViewChild('AllBranchSelected') AllBranchSelected!: MatOption; // branch
  @ViewChild('AllDivisionSelected') AllDivisionSelected!: MatCheckbox; // division
  @ViewChild('allSupplierSelected') allSupplierSelected!: MatOption; //supplier
  @ViewChild('allComponentsSelected') allComponentsSelected!: MatOption; //Component_map_dropdown
  @ViewChild('allSelectedVehicleMakes') allSelectedVehicleMakes!: MatOption; //vehicle make drop down
  @ViewChild('allSelectedVehicleRegs') allSelectedVehicleRegs!: MatOption; //vehicle registrations drop down
  @ViewChild(MatAccordion) accordion!: MatAccordion; 
  date: any;

  //api subscription
  private readonly onDestroy = new Subject<void>();

  ///experimenting with date ranges
  // Stores the selected start and end months
  selectedStartMonth: Date | null = null;
  selectedEndMonth: Date | null = null;

  // Function to determine the CSS class for each cell (used to highlight the selected months)
  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    // Only highligh dates in the 'month' view.
    if (view === 'month') {
      const date = cellDate.getDate();

      // Check if the date is within the selected range and apply a specific CSS class
      if (this.selectedStartMonth && this.selectedEndMonth) {
        const startMonth = new Date(
          this.selectedStartMonth.getFullYear(),
          this.selectedStartMonth.getMonth()
        );
        const endMonth = new Date(
          this.selectedEndMonth.getFullYear(),
          this.selectedEndMonth.getMonth(),
          this.getDaysInMonth(
            this.selectedEndMonth.getFullYear(),
            this.selectedEndMonth.getMonth()
          )
        );
        return cellDate >= startMonth && cellDate <= endMonth
          ? 'example-custom-date-class'
          : '';
      }
    }

    return '';
  };

  // Utility method to get the number of days in a month
  private getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  // Method to set the start or end month based on user selection
  setMonth(
    normalizedMonth: Date,
    datepicker: { close: () => void },
    isStart: boolean
  ) {
    const ctrlValue = new Date(normalizedMonth);
    ctrlValue.setDate(1);
    if (isStart) {
      this.selectedStartMonth = ctrlValue;
    } else {
      this.selectedEndMonth = ctrlValue;
    }
    datepicker.close();
  }
  //remove?
  // setMonthRange(
  //   monthOfTheYear: moment.Moment,
  //   datepicker: MatDatepicker<moment.Moment>
  // ) {
  //   const ctrlValue = this.date.value!;
  //   ctrlValue.month(monthOfTheYear.month());
  //   this.date.setValue(ctrlValue);
  //   datepicker.close();
  // }

  // showSmallForm: boolean = false; //directive to control the form visibility in other components
  // date range picker
  showDateRange: boolean = false;

  formattedMonth!: any;
  showMaintenanceMaps: boolean = false;
  showSuppliers: boolean = false;
  shshowAsstsCols: boolean = true;
  showAsstsCols: boolean = true;
  maintenanceMaps: any;
  showSuppBar: boolean = false;
  showDateSelector: boolean = true;
  selectedVehType!: string;
  showVehiclesTypes: boolean = true;
  isLoading: boolean = false;

  showScatterPlotGraph: boolean = false;
  // small form dropdowns
  vehTypes: { veh_type_map: string; unit_count: number }[] = [
    { veh_type_map: '', unit_count: 0 },
  ];
  supplier!: any;
  branches!: any;
  divisions!: any;
  components!: any;
  vehicleMake: any;

  julianToDay: any;
  julianFromDay: any;
  isDivisionChosen: boolean = false;
  isBranchChosen: boolean = false;
  isVheTypeChosen: boolean = false;

  // landingPageFilterForm: FormGroup = new FormGroup({});
  isSelected: any;
  apiSub: any;

  constructor(
    public smallForm: SmallFormService,
    private snackBar: MatSnackBar,
    private gs: GlobalService,
    private api: FilterFormService,
    public route: Router,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.snackBar.open('Setting User Permissions. Please Wait...', '', {
      duration: 4000,
    });

    //subscribe to alert when form is done loading/set
    this.smallForm.formDataLoaded$.subscribe((loaded: boolean) => {
      if (loaded) {
        this.snackBar.dismiss();
      }
    });
    //initialise loading form data in form service
    this.smallForm.initialiseForm().subscribe();
  }

  // Close Dialog
  closeDialog() {
    this.dialog.closeAll();
  }

  // Close accordion on submit button click
  closeAccordion() {
    this.accordion.closeAll();
  }

  // *****************  DATE RANGE SELECTOR ON CERTAIN COMPONENTs(?) ***************** //
  private formatDate(dateString: string): string {
    // Use moment to format the date
    const date = moment(dateString, 'MM-DD-YYYY');
    return date.isValid() ? date.format('YYYY-MM-DD') : '';
  }
  dateRangeChange(startDate: HTMLInputElement, endDate: HTMLInputElement) {

    const formattedStartDate = this.formatDate(startDate.value);
    const formattedEndDate = this.formatDate(endDate.value);
  }
  // ******************************************************************************* //

  //multi select for the supplier types
  getSupplierType(form: any) {
    this.api
      .sho002GetSupplierDropdownPerDivAndBranchV0Sho002GetSupplierDropdownPerDivAndBranchGet(
        form.julFromDate,
        form.julToDate,
        form.division.toString(),
        form.branch.toString(),
        form.vehicleType.toString()
      )
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (suppliers: any) => {
          this.isLoading = false;
          this.supplier = suppliers;
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
        complete: () => { },
      });
  }

  ngOnDestroy() {
    this.onDestroy.next(), this.onDestroy.complete();
  }

  onAllTypesSelected() {
    if (this.allTypesSelected.selected) {
      this.smallForm.form.controls['vehicleType'].patchValue(['all_veh_types']);
    }
  }

  onTypeSelected() {
    if (this.allTypesSelected.selected) {
      this.allTypesSelected.deselect();
    }
  }

  onAllDivisionSelected() {
    if (this.AllDivisionSelected.checked) {
      this.smallForm.form.controls['division'].setValue(['full_fleet']);
    }
  }

  onDivisionSelected() {
    if (this.AllDivisionSelected.checked) {
      this.AllDivisionSelected.setDisabledState(true);
    }
  }

  onAllBranchSelected() {
    if (this.AllBranchSelected.selected) {
      this.smallForm.form.controls['branch'].patchValue(['all_branches']);
    }
  }

  onBranchSelected() {
    if (
      this.AllBranchSelected.selected &&
      this.smallForm.formPage != 'orders'
    ) {
      this.AllBranchSelected.deselect();
    }
  }

  onAllSupplierSelected() {
    if (this.allSupplierSelected.selected) {
      this.smallForm.form.controls['supplier'].patchValue(['all_suppliers']);
    }
  }

  onSupplierSelected() {
    if (this.allSupplierSelected.selected) {
      this.allSupplierSelected.deselect();
    }
  }

  onAllComponentsSelected() {
    if (this.allComponentsSelected.selected) {
      this.smallForm.form.controls['components'].patchValue([
        'veh_model_map',
      ]);
    }
  }

  onComponentsSelected() {
    this.allComponentsSelected.deselect();
  }

  onAllVehicleMakeSelected() {
    if (this.allSelectedVehicleMakes.selected) {
      this.smallForm.form.controls['veh_model_map'].patchValue([...this.smallForm.allowedRepairMaps]);
    } else {
      this.smallForm.form.controls['veh_model_map'].patchValue([]);
    }
  }

  onVehicleMakeSelected() {
    this.allSelectedVehicleMakes.deselect();
  }

  /// vehicle registration drop down 
  onAllVehicleRegsSelected() {
    if (this.allSelectedVehicleRegs.selected) {
      this.smallForm.form.controls['registrations'].patchValue([...this.smallForm.allowedVehicles]);
    } else {
      this.smallForm.form.controls['registrations'].patchValue([]);
    }
  }
  
  onVehicleRegSelected() {
    this.allSelectedVehicleRegs.deselect();
  }
}
