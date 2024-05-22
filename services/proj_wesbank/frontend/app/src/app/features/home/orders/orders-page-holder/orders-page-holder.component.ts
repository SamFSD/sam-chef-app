import { Component, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '@auth0/auth0-angular';
import { AgGridAngular } from 'ag-grid-angular';
import 'ag-grid-community';
import { Grid } from 'ag-grid-community';
import { Observable } from 'rxjs';
import { OrdersService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { ConfirmPopupComponent } from '../confirm-popup/confirm-popup.component';
import { OrdersPopupComponent } from '../orders-popup/orders-popup.component';

import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DownloadPopupComponent } from '../download-popup/download-popup.component';
import { DownloaderService } from '../downloader.service';
import { InvoicePopupComponent } from '../invoice-popup/invoice-popup.component';

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
  selector: 'app-orders-page-holder',
  templateUrl: './orders-page-holder.component.html',
  styleUrls: ['./orders-page-holder.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_DATE_FORMATS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class OrdersPageHolderComponent {
  tableType: string = 'Wesbank-Orders';

  @ViewChild('agGrid', { static: false }) agGrid!: AgGridAngular;
  public rowData$!: Observable<any[]>;
  orderFilterForm: FormGroup = new FormGroup({});
  isSaveButtonDisabled: boolean = true;
  isAddButtonDisable: boolean = true;
  public editType: 'fullRow' = 'fullRow';
  gridOptions: any;
  eGridDiv: any;
  columnDefs!: any[];
  milesOrderRows!: any[];
  externalOrderRows!: any[];
  groupedData: any;
  isLoading: boolean = true;
  //when a branch is selected use this value to filter the orders
  selectedBranch!: string;
  selectedMonth!: string;
  julianToDay: any;
  julianFromDay: any;
  divisionGroups!: { name: string; branches: any }[];
  editedRows: any[] = [];
  //orders to show on grid
  showExternalOrders: boolean = false;
  ordersToShow!: any[];
  newRowValues: any;
  isMilesOrder: boolean = false;
  //toggle switch text
  toggleText: string = 'Show Wesbank Orders';
  userToken: any;
  user: any;
  targetTable: string = 'orders';
  userCanViewOrders: boolean = false;
  isWesbank: boolean = true;
  //data to pass through to the popup form
  selectedRowData: any;

  blob: any;
  downloadFileKZN: any;
  private readonly onDestroy = new Subject<void>();

  constructor(
    private api: OrdersService,
    private gs: GlobalService,
    private smallForm: SmallFormService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private auth: AuthService,
    private downloader: DownloaderService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.auth.idTokenClaims$.subscribe((userToken) => {
      this.userToken = userToken;
      this.user = userToken?.email;
    });
  }

  ngOnInit() {
    // subscribe in here when subject (A) init

    //retrieve form values when form is done loading
    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.userCanViewOrders = this.smallForm.userCanSeeOrders;
          //check if any branch is selected and not multiple branches
          if (
            this.smallForm.getFormValues().branch_single &&
            //is not of type array
            // this.smallForm.getFormValues().branch.constructor !== Array
            this.userCanViewOrders
          ) {
            this.callApi(this.smallForm.getFormValues());
          }
        }
      });
    //subscribe to form service to get the order button clicks
    this.smallForm.orderButtonClicked.subscribe((orderButtonClicked: any) => {
      if (orderButtonClicked) {
        // /depending on which button is clicked, call appropriate method
        switch (orderButtonClicked) {
          case 'create':
            this.onAddButtonClick();
            break;
          case 'delete':
            this.deleteRow();
            break;
          case 'edit':
            this.editSelectedOrder();
            break;
          case 'view_asset':
            this.viewSelectedAssets();
            break;
          case 'download':
            this.onFileDownload();
            break;
          case 'viewInvoices':
            this.onViewInvoiceClick();
            break;
        }
      }
    });
    //TODO:

    //get user permissions from small form service

    this.route.params.subscribe((params: Params) => {
      if (params['type'] === 'external-orders') {
        this.ordersToShow = this.externalOrderRows;
        this.toggleText = 'Show External Orders';
        this.targetTable = 'orders_non_miles';
      }
    });

    //set order filter form

    this.columnDefs = [
      {
        headerName: 'Date',
        field: 'date',

        filter: 'agDateColumnFilter',
        sortable: true,
      },
      {
        headerName: 'Vehicle Registration',
        field: 'vehiclereg',

        filter: 'agTextColumnFilter',
        sortable: true,
      },
      {
        headerName: 'Fleet No',
        field: 'fleet_no',

        filter: 'agTextColumnFilter',
        sortable: true,
      },
      {
        headerName: 'Order No',
        field: 'order_no',
        editable: false,
        filter: true,
        sortable: true,
      },
      {
        headerName: 'Invoice No',
        field: 'invoice_no',
        filter: true,
        sortable: true,
      },

      {
        headerName: 'Quote No',
        field: 'quote_no',
        filter: true,
        // sortable: true,
      },
      {
        headerName: 'Order Amount',
        field: 'amount',
        cellEditor: 'agNumericCellEditor',
        filter: 'agNumberColumnFilter',
        sortable: true,
        valueFormatter: this.gs.toRandValues,
      },
      {
        headerName: 'Invoice Amount',
        field: 'invoice_amount',
        filter: true,
        sortable: true,
        valueFormatter: this.gs.toRandValues,
      },
      {
        headerName: 'Invoice Difference',
        field: 'invoice_diff',
        filter: true,
        sortable: true,
        valueFormatter: this.gs.toRandValues,
        cellStyle: function (params: any) {
          // Highlight negative values in red
          return params.value > 0 ? { color: 'red' } : null;
        },
      },

      {
        headerName: 'Service Provider',
        field: 'service_provider',

        filter: 'agTextColumnFilter',
        sortable: true,
      },

      {
        headerName: 'Description',
        field: 'description',

        filter: true,
        sortable: true,
      },
      {
        headerName: 'Contract Type',
        field: 'contract_type',

        filter: 'agTextColumnFilter',
        sortable: true,
      },

      {
        headerName: 'Odo',
        field: 'odo',

        filter: 'agNumberColumnFilter',
        sortable: true,
      },

      {
        headerName: 'Client Ref',
        field: 'client_ref',

        filter: 'agTextColumnFilter',
        sortable: true,
      },
      {
        headerName: 'Vehicle Type',
        field: 'veh_type_map',

        filter: 'agTextColumnFilter',
        sortable: true,
      },
      {
        headerName: 'Repair Type',
        field: 'repair_type',

        filter: 'agTextColumnFilter',
        sortable: true,
      },
      {
        headerName: 'Mapping',
        field: 'mapping',

        filter: true,
        sortable: true,
      },
    ]; 
  }

  callApi(formValues: any) {
    this.isLoading = true;
    //orders from shoprite transactions
    this.api
      .getOrdersGridDevV0GetOrdersDevPost(formValues)
      .subscribe((data: any) => {
        this.milesOrderRows = data.miles_orders;
        this.isLoading = false;
        this.externalOrderRows = data.non_miles_orders;
        if (!this.ordersToShow) {
          this.ordersToShow = this.milesOrderRows;
        } else if ((this.showExternalOrders = true)) {
          this.ordersToShow = this.externalOrderRows;
        } else if ((this.showExternalOrders = false)) {
          this.ordersToShow = this.milesOrderRows;
        }
        this.ordersToShow = this.milesOrderRows;
        this.smallForm.isOrderAddButtonEnabled = true;
        this.smallForm.isOrderEditButtonEnabled = false;
        this.selectedBranch = formValues.branch_single.branch;
      });
  }

  // onBranchSelect() {
  //   if (this.orderFilterForm.value.branchFilter) {
  //     this.selectedBranch = this.orderFilterForm.value.branchFilter;
  //     this.callApi();
  //     this.isAddButtonDisable = false;
  //   } else {
  //     this.isAddButtonDisable = true;
  //   }
  // }

  addRowToGrid(newRow: any) {
    // this.rowData = [...this.rowData, newRow];
    // if (this.gridOptions && this.gridOptions.gridApi) {
    //   this.gridOptions.gridApi.applyTransaction({ add: [newRow] });
    //   this.gridOptions.gridApi.refreshCells();
    // }
  }

  clearSelection() {
    this.agGrid.api.deselectAll();
  }

  downloadLegacy() {
    this.downloader
      .downloadLegacyxlsx(this.selectedMonth, this.selectedBranch)
      .subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const month = this.smallForm.getFormValues().julMonth;
        const branch = this.smallForm.getFormValues().branch_single.branch;
        a.href = url;
        a.download = `${branch}-${month}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
  }

  downloadGridFileXlsx() {
    this.downloader.downloadGridFileXlsx().subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const branch = this.smallForm.getFormValues().branch_single.branch;
      a.href = url;
      a.download = `${this.selectedBranch}-${branch}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  onFileDownload() {
    const DownloadPopup = this.dialog.open(DownloadPopupComponent, {
      width: '550px',
      height: '550px',
      data: {
        message: 'Please select the format to download orders',
      },
    });
    DownloadPopup.afterClosed().subscribe((reply: any) => {
      if (reply.userChoice === 'Wesbank') {
        this.downloadGridFileXlsx();
      }
      if (reply.userChoice === 'Legacy Order File') {
        this.downloadLegacy();
      }
    });
  }

  generateGrid() {
    const ordersGrid = document.getElementById('ordersGrid');
    this.gridOptions = new Grid(ordersGrid as HTMLElement, {
      columnDefs: this.columnDefs,
      rowData: this.milesOrderRows,
      suppressAutoSize: true,
      sideBar: {
        toolPanels: ['filters'],
      },
    });
    this.gridOptions.api.setRowData(this.milesOrderRows);
  }

  downloadGridFile() {
    if (this.gridOptions.gridApi.getDataAsXlsx()) {
    }
  }

  groupDivisionsByBranches(data: any) {
    const groupBranches: { [key: string]: any[] } = {};
    data.forEach((item: any) => {
      const division = item.division;

      if (!groupBranches[division]) {
        groupBranches[division] = [];
      }
      groupBranches[division].push(item);
    });
    return groupBranches;
  }

  selectDivisionsAndBranches(groupBranches: any) {
    return Object.keys(groupBranches).map((division) => {
      return {
        name: division,
        branches: groupBranches[division].map((item: any) => {
          return { value: item.branch, viewValue: item.branch };
        }),
      };
    });
  }

  onRowValueChanged(event: any) {
    this.isSaveButtonDisabled = false;
    if (event.data) {
      this.isSaveButtonDisabled = false;
      // Check if the row has been edited
      const editedRow = this.editedRows.find((row) => row.id === event.data.id);
      this.editedRows.push(event.data);
    }
  }

  onRowClicked(event: any) {
    const selectedRows = this.agGrid.api.getSelectedRows();
    if (selectedRows.length === 1) {
      this.selectedRowData = selectedRows[0];
      this.smallForm.isOrderEditButtonEnabled = true;
      this.smallForm.isOrderDeleteButtonEnabled = true;
      this.smallForm.isOrderViewAssetButtonEnabled = true;
    } else {
      this.selectedRowData = null;
      this.smallForm.isOrderEditButtonEnabled = false;
      this.smallForm.isOrderViewAssetButtonEnabled = false;
    }

    if (selectedRows.length > 0) {
      this.smallForm.isOrderViewInvoiceButtonEnabled = true;
    } else {
      this.smallForm.isOrderViewInvoiceButtonEnabled = false;
    }
  }

  onViewInvoiceClick() {
    const order_numbers = this.gs.extractOrderNumbers(
      this.agGrid.api.getSelectedRows()
    );
    this.dialog.open(InvoicePopupComponent, {
      height: '950px',
      data: {
        order_numbers: order_numbers,
      },
    });
  }

  //add new order
  onAddButtonClick() {
    const editForm = this.dialog.open(OrdersPopupComponent, {
      width: '980px',
      data: {
        isEditMode: false,
        selectedBranch: this.selectedBranch,
        selectedRowData: null,
      },
    });
    editForm.componentInstance.orderDataSubject.subscribe(() => {
      //get data from db with latest changes made
      this.callApi(this.smallForm.getFormValues());
    });
  }

  onAddSimilarClick() {
    const editForm = this.dialog.open(OrdersPopupComponent, {
      width: '980px',
      data: {
        isEditMode: false,
        selectedBranch: this.selectedBranch,
        selectedRowData: this.selectedRowData,
      },
    });
    editForm.componentInstance.orderDataSubject.subscribe(() => {
      //get data from db with latest changes made
      this.callApi(this.smallForm.getFormValues());
    });
  }

  // edit existing order
  public editSelectedOrder() {
    if (this.selectedRowData) {
      // Open the popup with the selected row data

      const editForm = this.dialog.open(OrdersPopupComponent, {
        width: '980px',
        data: {
          // when editing open form
          isEditMode: true,
          selectedBranch: this.selectedBranch,
          selectedRowData: this.selectedRowData,
        },
      });

      editForm.componentInstance.orderDataSubject.subscribe(() => {
        this.callApi(this.smallForm.getFormValues());
      });
    }
  }

  deleteRow() {
    const selectedRows = this.agGrid.api.getSelectedRows();
    const orderNumbers = selectedRows
      .map((Object) => Object.order_no)
      .toString();
    const ConfirmPopup = this.dialog.open(ConfirmPopupComponent, {
      width: '450px',
      height: '250px',
      data: {
        message: 'Permanently delete all selected orders?',
      },
    });
    ConfirmPopup.afterClosed().subscribe((reply: any) => {
      if (reply) {
        if (reply.userChoice == 'confirm') {
          this.api
            .deleteFromFleetordersV0DeleteFromFleetOrdersPost(
              orderNumbers,
              this.targetTable
            )
            .subscribe(() => {
              this.callApi(this.smallForm.getFormValues()),
                this.snackBar.open('Orders Deleted!', 'Close', {
                  duration: 2000,
                });
            });
          //call api again to get latest info after deletion (grid will auto update on this.dataRows changing)
        }
      }
    });
  }

  ///route to per assets view page
  viewSelectedAssets() {
    this.smallForm.patchPavReg(this.selectedRowData.vehiclereg);
    this.router.navigate(['/viewasset']);
  }

  // slide toggle displays miles orders or external orders
  onSlideToggleChange(event: MatSlideToggleChange) {
    // this.showExternalOrders = event.checked;
    this.isWesbank = !this.isWesbank;
    if (event.checked) {
      // show miles orders
      this.ordersToShow = this.milesOrderRows;
      this.toggleText = 'Show Wesbank Orders';
      this.router.navigate(['/orders/wesbank-orders']);
      this.targetTable = 'orders';
    } else {
      this.router.navigate(['/orders/external-orders']);
      //show external orders
      this.ordersToShow = this.externalOrderRows;
      this.toggleText = 'Show External Orders';
      this.targetTable = 'orders_non_miles';
    }
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
    //form is set specially for this page, on destroy reset form to compact and general
    this.smallForm.formPage = 'general';
    this.smallForm.formLayoutType.next('compact');
  }
}
