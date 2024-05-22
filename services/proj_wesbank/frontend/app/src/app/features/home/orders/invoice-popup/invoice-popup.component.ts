import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import 'ag-grid-community';
import { Subject, takeUntil } from 'rxjs';
import { OrdersService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';


@Component({
  selector: 'app-invoice-popup',
  templateUrl: './invoice-popup.component.html',
  styleUrls: ['./invoice-popup.component.scss'],
})
export class InvoicePopupComponent {
  constructor(
    private api: OrdersService,
    private gs: GlobalService,
  
    @Inject(MAT_DIALOG_DATA) public dialogInput: any
  ) {}
  private readonly onDestroy = new Subject<void>();
  gridData: any;
  showGrid: boolean = false;
  gridOptions: any;
  columnDefs: any[] = [
    {
      headerName: 'Date',
      field: 'transdate',

      filter: 'agTextColumnFilter',
      sortable: true,
    },

    {
      headerName: 'Fleet No',
      field: 'fleet_no',

      filter: true,
      sortable: true,
    },
    {
      headerName: 'Registraion',
      field: 'vehiclereg',

      filter: 'agTextColumnFilter',
      sortable: true,
    },

    {
      headerName: 'Order No',
      field: 'order_no',

      filter: 'agNumberColumnFilter',
      sortable: true,
    },

    {
      headerName: 'Invoice No',
      field: 'invoice_no',

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
      headerName: 'Vehicle Make',
      field: 'veh_make_map',

      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Vehicle Model',
      field: 'veh_model_map',

      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Mapping',
      field: 'mapping',

      filter: true,
      sortable: true,
    },
    {
      headerName: 'Description',
      field: 'maintdescription',

      filter: 'agDateColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Service Provider',
      field: 'serviceprovider',

      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Amount',
      field: 'amount',
      cellEditor: 'agNumericCellEditor',
      filter: 'agNumberColumnFilter',
      sortable: true,
      valueFormatter: this.gs.toRandValues,
    },
    {
      headerName: 'Savings',
      field: 'savings',
      cellEditor: 'agNumericCellEditor',
      filter: 'agNumberColumnFilter',
      sortable: true,
      valueFormatter: this.gs.toRandValues,
    },
    {
      headerName: 'Quantity',
      field: 'quantity',

      filter: 'agTextColumnFilter',
      sortable: true,
    },
    {
      headerName: 'Component',
      field: 'component_cat',
      editable: false,
      filter: true,
      sortable: true,
    },
    {
      headerName: 'Work Order No',
      field: 'work_order_id',
      filter: true,
      sortable: true,
    },

    {
      headerName: 'Work Order Distance',
      field: 'word_order_distance',
      filter: true,
      // sortable: true,
    },
  ];

  ngOnInit() {
    this.api
      .getInvoicesOrdersV0GetInvoicesOrdersPost(this.dialogInput.order_numbers)
      .pipe(takeUntil(this.onDestroy))
      .subscribe((data: any) => {
        if (data.length > 0) {
          this.showGrid = true;
          this.gridData = data;
          this.gridOptions = {
            columnDefs: this.columnDefs,
            rowData: this.gridData,
            suppressAutoSize: true,
            sideBar: {
              toolPanels: ['filters'],
            },
          };
        }
      });
  }
}

  
