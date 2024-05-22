import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { BehaviorSubject } from 'rxjs';
import {
  DateManagementService,
  DowntimeTrackerService,
  FilterFormService,
  OrdersService,
} from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';

@Component({
  selector: 'app-dt-popup',
  templateUrl: './dt-popup.component.html',
  styleUrls: ['./dt-popup.component.scss'],
})
export class DtPopupComponent {
  targetTable: string = 'orders';

  @ViewChild('picker', { static: true }) picker!: ElementRef;
  @ViewChild('endPicker', { static: true }) endPicker!: ElementRef;
  formTitle: string = 'Create Downtime Record';
  branchTitle: string = '';
  isMilesOrders: boolean = true;

  newOrderSlider: boolean = true;

  milesValue: boolean = true;
  toggleText: string = 'Miles Order';

  newOrderFormToggleText: string = '';

  //hard coded form drop downs to populate per selected veh reg
  contractTypes: any[] = [];
  repair_type: any[] = [];

  allBranchRegistrations: any[] = [];
  vehicleDetails: any;
  newOrderNumber: any;
  currentDate: Date = new Date();
  selectedDate: any;
  disableSelect = new FormControl(false);
  //Julian month based on selected date
  julianMonth: any;

  // dropdown values for suppliers
  allBranchesSuppliers: any[] = [];

  //auto complete
  filteredSuppliers: any[] = [];
  filteredMapping: any[] = [];
  filteredRegistration: any[] = [];
  filteredFleetNumbers: any[] = [];

  //all vehicles assigned to this branch
  allBranchVehs: any;

  //selected vehicle reg
  selectedReg: string = '';
  //selected fleet no
  selectedFleetNo: string = '';
  //object of the selected veh (either via fleet_no or reg
  selectedVehicle: any;
  //add or edit new data
  addRecord: string = 'Add Downtime Record';
  editRecord: string = 'Edit Record';
  updatedOrder: string = 'Update Order';

  dtFormGroup = new FormGroup({
    date: new FormControl(new Date(), [Validators.required]),
    end_date: new FormControl(null, [Validators.required]),
    veh_type_map: new FormControl({ value: '', disabled: true }),
    vehiclereg: new FormControl('', [Validators.required]),
    branch: new FormControl({ value: '', disabled: true }, [
      Validators.required,
    ]),
    odo: new FormControl(0, [
      Validators.required,
      Validators.pattern('^[0-9]*$'),
    ]),
    fleet_no: new FormControl('', [
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9 -]*$'),
    ]),
    service_provider: new FormControl('', [Validators.required]),
    reason: new FormControl('', [Validators.required]),
    uid: new FormControl(''),
  });
  apiSub: any;
  allMappingDropDown: any;
  router: any;
  allBranchFleetNumbers: any[] = [];
  editedOrderData: any = {};
  userToken: any;
  user: any;

  ///create a subject that i can next in here for the orders save button
  orderDataSubject = new BehaviorSubject<any>(null);

  constructor(
    private apiOrders: OrdersService,
    private apiFilter: FilterFormService,
    private apiDt: DowntimeTrackerService,
    private apiDate: DateManagementService,
    public dialogRef: MatDialogRef<DtPopupComponent>,
    @Inject(MAT_DIALOG_DATA)
    public inputData: {
      isEditMode: boolean;
      selectedBranch: any;
      selectedRowData: any;
    },
    private snackBar: MatSnackBar,
    private gs: GlobalService,
    private route: Router,
    private auth: AuthService
  ) {
    this.auth.idTokenClaims$.subscribe((userToken) => {
      this.userToken = userToken;
      this.user = userToken?.email;
    });
  }

  ngOnInit() {
    //new order form slide toggle
    this.newOrderFormToggleText = 'slide to enter vehicle registration';
    this.dtFormGroup.controls['vehiclereg'].disable();

    if (this.inputData.isEditMode && this.inputData.selectedRowData) {
      //if pop up opens in edit mode patch form values with row to edit

      this.patchEditFormValues();
    } else {
      // if in creation mode
    }

    //form value changes the date on new order

    //get suppliers for the selected branch
    this.apiFilter
      .getOrderSuppliersPerBranchV0GetOrderSuppliersPerBranchGet(
        this.inputData.selectedBranch
      )
      .subscribe((res: any) => {
        this.allBranchesSuppliers = res;
      });

    // get list of vehicles (reg, fleet_no, contract_type and veh_type_map).  If selected vvehicle (on submit) is not in this list, we will raise error
    this.apiOrders
      .getVehicleDetailsPerSelectedBranchV0GetVehicleDetailsPerSelectedBranchGet(
        this.inputData.selectedBranch
      )
      .subscribe({
        next: (results) => {
          this.allBranchVehs = results;
          this.allBranchFleetNumbers = results.map((veh: any) => veh.fleet_no);
          this.allBranchRegistrations = results.map(
            (veh: any) => veh.vehiclereg
          );
        },
        error: (error) => {},
        complete: () => {},
      });

    this.dtFormGroup.controls.vehiclereg.valueChanges.subscribe(
      (selectedReg: any) => {
        if (selectedReg) {
          const isVehicleregFound = this.allBranchRegistrations.some(
            (x: any) => x.toLowerCase() === selectedReg.toLowerCase()
          );

          if (isVehicleregFound) {
            this.selectedVehicle = this.allBranchVehs.find(
              (veh: any) => veh.vehiclereg === selectedReg
            );
            this.dtFormGroup.patchValue(
              {
                fleet_no: this.selectedVehicle.fleet_no,
                veh_type_map: this.selectedVehicle.veh_type_map,
              },
              {
                emitEvent: false,
              }
            );
            this.selectedReg = selectedReg;
          } else {
            this.selectedReg = '';
            // this.newOrdersForm.controls.fleet_no.setValue(null),
            this.clearVehicleDetails();
          }
        }
      }
    );
    // if fleet no changes, set filtered fleet nos for the dropdown as per user input. Once fleet no is selected, set vehicle reg and veh_type and contract_type of the selected vehicle
    this.dtFormGroup.controls.fleet_no.valueChanges.subscribe(
      (selectedFleetNo: any) => {
        if (selectedFleetNo) {
          const isFleetNoFound = this.allBranchFleetNumbers.some(
            (x: any) => x.toLowerCase() === selectedFleetNo.toLowerCase()
          );

          if (isFleetNoFound) {
            this.selectedVehicle = this.allBranchVehs.find(
              (veh: any) => veh.fleet_no === selectedFleetNo
            );
            this.selectedFleetNo = selectedFleetNo;
            this.dtFormGroup.patchValue(
              {
                vehiclereg: this.selectedVehicle.vehiclereg,
                veh_type_map: this.selectedVehicle.veh_type_map,
              },
              {
                emitEvent: false,
              }
            );
          }
        } else {
          this.selectedFleetNo = '';
          this.dtFormGroup.controls.vehiclereg.setValue(null),
            this.clearVehicleDetails();
        }
      }
    );
  }

  onSlideChangeVehicleOrFleetNo(event: MatSlideToggleChange) {
    this.newOrderSlider = event.checked;
    if (event.checked) {
      this.newOrderFormToggleText = 'slide to enter vehicle registration';
      this.dtFormGroup.controls.fleet_no.setValue('');
      this.dtFormGroup.controls.vehiclereg.setValue('');
      this.dtFormGroup.controls['vehiclereg'].disable();
      this.dtFormGroup.controls['fleet_no'].enable();
    } else {
      this.newOrderFormToggleText = 'slide to enter fleet number';
      this.dtFormGroup.controls.vehiclereg.setValue('');
      this.dtFormGroup.controls.fleet_no.setValue('');
      this.dtFormGroup.controls['fleet_no'].disable();
      this.dtFormGroup.controls['vehiclereg'].enable();
    }
  }

  //clears the vehicle details
  clearVehicleDetails() {
    this.dtFormGroup.patchValue({
      veh_type_map: null,
    });
  }

  //auto complete functions
  filteredRegistrationDropdown(event: any): void {
    const input = event.target.value;
    this.filteredRegistration = this.allBranchRegistrations.filter((reg: any) =>
      reg.toUpperCase().includes(input.toUpperCase())
    );
  }

  filteredSuppliersDropDowns(event: any): void {
    const input = event.target.value;
    this.filteredSuppliers = this.allBranchesSuppliers.filter((supplier: any) =>
      supplier.service_provider.toUpperCase().includes(input.toUpperCase())
    );
  }

  filteredFleetNumberDropdown(event: any): void {
    const input = event.target.value;
    this.filteredFleetNumbers = this.allBranchFleetNumbers.filter(
      (fleetNo: any) => fleetNo.toUpperCase().includes(input.toUpperCase())
    );
  }

  selectedRegDropDown(event: MatAutocompleteSelectedEvent): void {
    // const selectedReg = event.option.value;
  }

  selectedSupplierDropDown(event: MatAutocompleteSelectedEvent): void {
    // const selectedSupplier = event.option.value;
  }
  selectedMappingDropDown(event: MatAutocompleteSelectedEvent): void {
    // const selectedMapping = event.option.value;
  }
  selectedFleetNumberDropDown(event: MatAutocompleteSelectedEvent): void {
    // const selectedFleetNumber = event.option.value;
  }

  chosenMonthHandler(event: any, dp: any) {
    dp.close();
    const originalDate = new Date();
    const year = originalDate.getFullYear();
    const month = (originalDate.getMonth() + 1).toString().padStart(2, '0');
    const day = originalDate.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
  }

  createRecord(form: any) {
    this.apiDt.addDtV0AddDtPost(form).subscribe({
      next: () => {
        this.orderDataSubject.next(form);
        this.snackBar.open('Record Created Successfully!', 'Close', {
          duration: 2000,
        });
        this.dialogRef.close();
      },
      error: (err: any) => {
        this.gs.raiseError(err);
      },
      complete: () => {},
    });
  }

  updateRecord(form: any) {
    this.apiDt.updateDtGridV0UpdateDtGridPost(form).subscribe({
      next: () => {
        this.orderDataSubject.next(form);
        this.snackBar.open('Record Updated Successfully!', 'Close', {
          duration: 2000,
        });
        this.dialogRef.close();
      },
      error: (err: any) => {
        this.gs.raiseError(err);
      },
      complete: () => {},
    });
  }

  saveOrder() {
    //if we editing an existing order
    if (this.inputData.isEditMode && this.inputData.selectedRowData) {
      const formValues: { [key: string]: any } = this.dtFormGroup.value;
      const date = new Date(String(this.dtFormGroup.controls.date.value));
      const eDate = new Date(String(this.dtFormGroup.controls.end_date.value));
      const startDate = new Intl.DateTimeFormat('en-ZA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);
      const endDate = new Intl.DateTimeFormat('en-ZA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(eDate);
      //set values not collected in form for non miles orders
      formValues['branch'] = this.inputData.selectedBranch;
      formValues['vehiclereg'] = this.dtFormGroup.controls.vehiclereg.value;
      formValues['fleet_no'] = this.dtFormGroup.controls.fleet_no.value;
      formValues['start_date'] = startDate;
      formValues['est_end_date'] = endDate;
      formValues['supplier'] = this.dtFormGroup.controls.service_provider.value;
      this.updateRecord(formValues);
      //if we are creating a new order
    } else {
      //if creating new order
      const formValues: { [key: string]: any } = this.dtFormGroup.value;
      const date = new Date(String(this.dtFormGroup.controls.date.value));
      const eDate = new Date(String(this.dtFormGroup.controls.end_date.value));
      const startDate = new Intl.DateTimeFormat('en-ZA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);
      const endDate = new Intl.DateTimeFormat('en-ZA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(eDate);
      //set values not collected in form for non miles orders
      formValues['branch'] = this.inputData.selectedBranch;
      formValues['vehiclereg'] = this.dtFormGroup.controls.vehiclereg.value;
      formValues['fleet_no'] = this.selectedFleetNo;
      formValues['start_date'] = startDate;
      formValues['est_end_date'] = endDate;
      formValues['supplier'] = this.dtFormGroup.controls.service_provider.value;
      //IF THE VEHICLE REG AND (OR) FLEET NUMBER IS FOUND IN THE POSSIBLE DROPDOWN VALUES
      try {
        formValues['type'] = this.selectedVehicle.veh_type_map;
        formValues['make'] = 'test';
        formValues['model'] = this.selectedVehicle.veh_model_map;

        this.createRecord(formValues);
        this.dialogRef.close();
      } catch (err) {
        this.snackBar.open(
          'Please select a valid registration or fleet number for this branch.',
          '',
          {
            duration: 2000,
            panelClass: ['red-snackbar'],
          }
        );
      }
    }
  }

  //when the modal opens in edit mode, this component receives data of row to edit.  Patch these cvalues into the form to edit
  patchEditFormValues() {
    this.dtFormGroup.patchValue({
      date: this.inputData.selectedRowData.start_date,
      vehiclereg: this.inputData.selectedRowData.vehiclereg,
      branch: this.inputData.selectedRowData.branch,
      odo: this.inputData.selectedRowData.odo,
      fleet_no: this.inputData.selectedRowData.fleet_no,
      service_provider: this.inputData.selectedRowData.supplier,
      reason: this.inputData.selectedRowData.reason,
      end_date: this.inputData.selectedRowData.est_end_date,
      uid: this.inputData.selectedRowData.uid,
    });
  }

  ngOnDestroy() {
    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }
  }
}
