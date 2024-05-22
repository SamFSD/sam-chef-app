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
  FilterFormService,
  OrdersService,
} from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';

interface DropdownItem {
  fleet_no: any;
  vehiclereg?: string;
  service_provider?: string;
  mapping?: string;
}
@Component({
  selector: 'app-orders-popup',
  templateUrl: './orders-popup.component.html',
  styleUrls: ['./orders-popup.component.scss'],
})
export class OrdersPopupComponent {
  targetTable: string = 'orders';

  @ViewChild('picker', { static: true }) picker!: ElementRef;

  formTitle: string = 'Create new order';
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
  addNewOrder: string = 'Add new Order';
  editOrder: string = 'Edit Order';
  updatedOrder: string = 'Update Order';

  newOrdersForm = new FormGroup({
    date: new FormControl(new Date(), [Validators.required]),
    veh_type_map: new FormControl({ value: '', disabled: true }),
    repair_type: new FormControl('', [Validators.required]),
    contract_type: new FormControl({ value: '', disabled: true }),
    order_no: new FormControl({ value: '', disabled: true }, [
      Validators.required,
    ]),
    vehiclereg: new FormControl('', [Validators.required]),

    amount: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9].*$'),
    ]),
    branch: new FormControl({ value: '', disabled: true }, [
      Validators.required,
    ]),
    client_ref: new FormControl(''),
    description: new FormControl('', [Validators.required]),
    division: new FormControl(''),
    invoice_no: new FormControl(''),
    mapping: new FormControl({ value: '', disabled: true }, [
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

    quote_no: new FormControl('', [Validators.required]),
    service_provider: new FormControl('', [Validators.required]),
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
    private api: OrdersService,
    private apiFilter: FilterFormService,
    private apiDate: DateManagementService,
    public dialogRef: MatDialogRef<OrdersPopupComponent>,
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
    this.newOrdersForm.controls['vehiclereg'].disable();

    if (this.inputData.isEditMode && this.inputData.selectedRowData) {
      //if pop up opens in edit mode patch form values with row to edit

      this.patchEditFormValues();
    } else {
      // if in creation mode
      this.setFormForCreation();
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

    this.api
      .repairTypeFromFleetOrdersV0RepairTypeFromFleetOrdersGet()
      .subscribe((repairsType: any) => {
        this.repair_type = repairsType;
      });

    //get mapping drop downs

    this.api
      .mappingGridV0MappingGridGet('lower(veh_type_map)')
      .subscribe((res: any) => {
        this.allMappingDropDown = res;
      });

    // get list of vehicles (reg, fleet_no, contract_type and veh_type_map).  If selected vvehicle (on submit) is not in this list, we will raise error
    this.api
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

    this.newOrdersForm.controls.vehiclereg.valueChanges.subscribe(
      (selectedReg: any) => {
        if (selectedReg) {
          const isVehicleregFound = this.allBranchRegistrations.some(
            (x: any) => x.toLowerCase() === selectedReg.toLowerCase()
          );

          if (isVehicleregFound) {
            this.selectedVehicle = this.allBranchVehs.find(
              (veh: any) => veh.vehiclereg === selectedReg
            );
            this.newOrdersForm.patchValue(
              {
                fleet_no: this.selectedVehicle.fleet_no,
                veh_type_map: this.selectedVehicle.veh_type_map,
                contract_type: this.selectedVehicle.contract_type,
              },
              {
                emitEvent: false,
              }
            );
            this.selectedReg = selectedReg;
            this.newOrdersForm.controls['mapping'].enable();
          } else {
            this.selectedReg = '';
            // this.newOrdersForm.controls.fleet_no.setValue(null),
            this.clearVehicleDetails();
          }
        }
      }
    );
    // if fleet no changes, set filtered fleet nos for the dropdown as per user input. Once fleet no is selected, set vehicle reg and veh_type and contract_type of the selected vehicle
    this.newOrdersForm.controls.fleet_no.valueChanges.subscribe(
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
            this.newOrdersForm.patchValue(
              {
                vehiclereg: this.selectedVehicle.vehiclereg,
                veh_type_map: this.selectedVehicle.veh_type_map,
                contract_type: this.selectedVehicle.contract_type,
              },
              {
                emitEvent: false,
              }
            );

            this.newOrdersForm.controls['mapping'].enable();
          }
        } else {
          this.selectedFleetNo = '';
          this.newOrdersForm.controls.vehiclereg.setValue(null),
            this.clearVehicleDetails();
        }
      }
    );
  }

  onSlideChangeVehicleOrFleetNo(event: MatSlideToggleChange) {
    this.newOrderSlider = event.checked;
    if (event.checked) {
      this.newOrderFormToggleText = 'slide to enter vehicle registration';
      this.newOrdersForm.controls.fleet_no.setValue('');
      this.newOrdersForm.controls.vehiclereg.setValue('');
      this.newOrdersForm.controls['vehiclereg'].disable();
      this.newOrdersForm.controls['fleet_no'].enable();
    } else {
      this.newOrderFormToggleText = 'slide to enter fleet number';
      this.newOrdersForm.controls.vehiclereg.setValue('');
      this.newOrdersForm.controls.fleet_no.setValue('');
      this.newOrdersForm.controls['fleet_no'].disable();
      this.newOrdersForm.controls['vehiclereg'].enable();
    }
  }

  //clears the vehicle details
  clearVehicleDetails() {
    this.newOrdersForm.patchValue({
      veh_type_map: null,
      contract_type: null,
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

  filteredMappingDropDowns(event: any): void {
    const input = event.target.value;
    this.filteredMapping = this.allMappingDropDown.filter((map: any) =>
      map.mapping.toUpperCase().includes(input.toUpperCase())
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

  getJulianDateAndOrderNo() {
    const originalDate = this.newOrdersForm.controls.date.value;
    const year = originalDate?.getFullYear();
    const month = (originalDate!.getMonth() + 1).toString().padStart(2, '0');
    const day = originalDate?.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    if (this.inputData.isEditMode === false) {
      this.apiDate.getJulianMonthV0GetJulianMonthGet(formattedDate).subscribe({
        next: (julianMonth: any) =>
          this.orderNumber(julianMonth[0].selected_month.toString()),
        error: () => {},
        complete: () => {},
      });
    }
  }

  chosenMonthHandler(event: any, dp: any) {
    dp.close();
    const originalDate = new Date();
    const year = originalDate.getFullYear();
    const month = (originalDate.getMonth() + 1).toString().padStart(2, '0');
    const day = originalDate.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
  }

  orderNumber(julianMonth: any) {
    this.api
      .generateOrderNoV0GenerateOrderNoGet(
        this.inputData.selectedBranch,
        julianMonth
      )
      .subscribe({
        next: (res: any) => {
          if (res) {
            this.newOrderNumber = res;
          } else {
            this.createOrders(this.inputData.selectedRowData.order_no);
          }
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
        complete: () => {},
      });
  }

  createOrders(form: any) {
    this.api
      .addShopriteTransactionV0AddShopriteTransactionPost(form)
      .subscribe({
        next: () => {
          this.orderDataSubject.next(form);
          this.snackBar.open('Order Created Successfully!', 'Close', {
            duration: 2000,
          });
          this.dialogRef.close();
        },
        error: (err: any) => {
          if (err.error && err.error.error_code === 'Please check your order') {
            this.snackBar.open(
              'Duplicate key violation. Please check your data and try again.',
              'Close',
              {
                duration: 2000,
                panelClass: ['red-snackbar'],
              }
            );
          } else {
            this.gs.raiseError(err);
          }
        },
        complete: () => {},
      });
  }

  updateOrder(form: any) {
    this.api
      .updateFleetOrdersV0UpdateFleetOrdersPost(this.targetTable, form)
      .subscribe({
        next: () => {
          this.orderDataSubject.next(form);
          this.snackBar.open('Order Updated Successfully!', 'Close', {
            duration: 2000,
          });
          this.dialogRef.close();
        },
        error: (err: any) => {
          if (err.error && err.error.error_code === 'Please check your order') {
            this.snackBar.open(
              'Duplicate key violation. Please check your data and try again.',
              'Close',
              {
                duration: 2000,
                panelClass: ['red-snackbar'],
              }
            );
          } else {
            this.snackBar.open('Could not update order', err);
          }
        },
        complete: () => {},
      });
  }

  saveOrder() {
    //if we editing an existing order
    if (this.inputData.isEditMode && this.inputData.selectedRowData) {
      const formValues: { [key: string]: any } = this.editedOrderData;
      const date = new Date(String(this.newOrdersForm.controls.date.value));
      const formattedDate = new Intl.DateTimeFormat('en-ZA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);

      //set values not collected in form for non miles orders
      formValues['isMilesOrder'] = this.isMilesOrders;
      formValues['branch'] = this.inputData.selectedRowData.branch;
      formValues['vehiclereg'] = this.newOrdersForm.controls.vehiclereg.value;
      //use order from input values
      formValues['order_no'] = this.inputData.selectedRowData.order_no;
      formValues['invoice_no'] = this.inputData.selectedRowData.invoice_no;

      formValues['amount'] = this.newOrdersForm.controls.amount.value;
      formValues['client_ref'] = this.newOrdersForm.controls.client_ref.value;
      formValues['mapping'] = this.newOrdersForm.controls.mapping.value;
      formValues['odo'] = this.newOrdersForm.controls.odo.value;
      formValues['fleet_no'] = this.newOrdersForm.controls.fleet_no.value;
      formValues['quote_no'] = this.newOrdersForm.controls.quote_no.value;
      formValues['service_provider'] =
        this.newOrdersForm.controls.service_provider.value;
      formValues['description'] = this.newOrdersForm.controls.description.value;
      formValues['date'] = formattedDate;
      formValues['repair_type'] = this.newOrdersForm.controls.repair_type.value;

      //IF THE VEHICLE REG AND (OR) FLEET NUMBER IS FOUND IN THE POSSIBLE DROPDOWN VALUES
      formValues['contract_type'] =
        this.inputData.selectedRowData.contract_type;
      formValues['veh_type_map'] = this.inputData.selectedRowData.veh_type_map;
      this.updateOrder(formValues);

      //if we are creating a new order
    } else {
      //if creating new order
      const formValues: { [key: string]: any } = this.newOrdersForm.value;
      const date = new Date(String(this.newOrdersForm.controls.date.value));
      const formattedDate = new Intl.DateTimeFormat('en-ZA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);
      //set values not collected in form for non miles orders
      formValues['isMilesOrder'] = this.isMilesOrders;
      formValues['branch'] = this.inputData.selectedBranch;
      formValues['vehiclereg'] = this.newOrdersForm.controls.vehiclereg.value;
      formValues['fleet_no'] = this.selectedFleetNo;
      formValues['order_no'] = this.newOrderNumber;
      formValues['date'] = formattedDate;

      //IF THE VEHICLE REG AND (OR) FLEET NUMBER IS FOUND IN THE POSSIBLE DROPDOWN VALUES
      try {
        formValues['contract_type'] = this.selectedVehicle.contract_type;
        formValues['veh_type_map'] = this.selectedVehicle.veh_type_map;

        this.createOrders(formValues);
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

  onSlideToggleChange(event: MatSlideToggleChange) {
    this.isMilesOrders = event.checked;

    if (event.checked) {
      this.toggleText = 'Miles Order';
      // this.newOrdersForm.controls['vehiclereg'].enable();
      // this.newOrdersForm.controls['order_break_down'].enable();
      // this.newOrdersForm.controls['veh_type_map'].enable();
      // this.newOrdersForm.controls['mapping'].enable();
    } else {
      this.toggleText = 'External Order';

      // this.newOrdersForm.controls['vehiclereg'].disable();
      // this.newOrdersForm.controls['order_break_down'].disable();
      // this.newOrdersForm.controls['order_no'].disable();
      // this.newOrdersForm.controls['mapping'].disable();
    }
  }

  //when the modeal opens in edit mode, this component receives rdata of row to edit.  Patch these cvalues into the form to edit
  patchEditFormValues() {
    this.newOrdersForm.patchValue({
      date: this.inputData.selectedRowData.date,
      veh_type_map: this.inputData.selectedRowData.veh_type_map,
      repair_type: this.inputData.selectedRowData.repair_type,
      contract_type: this.inputData.selectedRowData.contract_type,
      order_no: this.inputData.selectedRowData.order_no,
      vehiclereg: this.inputData.selectedRowData.vehiclereg,
      amount: this.inputData.selectedRowData.amount,
      branch: this.inputData.selectedRowData.branch,
      client_ref: this.inputData.selectedRowData.client_ref,
      mapping: this.inputData.selectedRowData.mapping,
      odo: this.inputData.selectedRowData.odo,
      fleet_no: this.inputData.selectedRowData.fleet_no,
      quote_no: this.inputData.selectedRowData.quote_no,
      service_provider: this.inputData.selectedRowData.service_provider,
      description: this.inputData.selectedRowData.description,
    });
  }

  //when creating a new order, retrieve necesary info aND PATCH FORM
  setFormForCreation() {
    this.getJulianDateAndOrderNo();
    // this.orderNumber(this.inputData.selectedRowData.date);
    this.newOrdersForm.patchValue({
      branch: this.inputData.selectedBranch,
      order_no: this.newOrderNumber,
    });

    this.newOrdersForm.controls.date.valueChanges.subscribe((date: any) => {
      this.getJulianDateAndOrderNo();
    });
  }

  ngOnDestroy() {
    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }
  }

  cancelOrder() {}
}
