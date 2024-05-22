import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import {
  InvoiceStatusService,
  PerAssetsViewService,
} from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { CellComponent, TabulatorFull as Tabulator } from 'tabulator-tables';
import { smallForm } from '../../small-form-component/small-form-interface';
import { SmallFormService } from '../../small-form-component/small-form.service';

@Component({
  selector: 'app-orders-exceptions',
  templateUrl: './orders-exceptions.component.html',
  styleUrls: ['./orders-exceptions.component.scss'],
})
export class OrdersExceptionsComponent {
  @Input() isSingleReg: boolean = false;

  isLoading: boolean = true;
  ordersTableData: any;
  tabelTitle: string = 'Orders Exceptions';
  tableColumns: any[] = [];
  //declare a Tabulator type
  ordersExcepTable!: Tabulator;
  ordersExcepData: any;
  //set table columns

  tableDataArray: any[] = [
    {
      title: '',
      field: 'action',
      formatter: this.customButtonFormatter,
      formatterParams: { icon: 'search' },
      cellClick: (e: Event, cell: CellComponent) => {
        // Call your function here
        this.onButtonClick(cell.getRow().getData());
      },
      headerSort: false,
      width: 20,
      hozAlign: 'center',
    },
    { title: 'Date Created', field: 'date', headerFilter: 'input' },
    { title: 'Customer PO', field: 'order_no', headerFilter: 'input' },
    {
      title: 'Costs',
      field: 'amount',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
      headerFilter: 'input',
    },
    {
      title: 'Invoice Difference',
      field: 'invoice_difference',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
      headerFilter: 'input',
    },
    { title: 'Vehicle Reg', field: 'vehiclereg', headerFilter: 'input' },
    { title: 'Fleet No', field: 'fleet_no', headerFilter: 'input' },
    {
      title: 'Service Provider',
      field: 'service_provider',
      headerFilter: 'input',
    },
    { title: 'Mapping', field: 'mapping', headerFilter: 'input' },
    { title: 'Description', field: 'description', headerFilter: 'input' },
    {
      title: 'Savings',
      field: 'savings',
      headerFilter: 'input',
    },
    {
      title: 'Work Order Distance',
      field: 'odo',
      formatter: (cell: any) => this.gs.toTabKM(cell),
      headerFilter: 'input',
    },
  ];

  private readonly onDestroy = new Subject<void>();

  constructor(
    private smallForm: SmallFormService,
    private apiServices: InvoiceStatusService,
    private gs: GlobalService,
    private router: Router,
    private pavAPI: PerAssetsViewService,
    private table: TabulatorTableService
  ) {}

  ngOnInit() {
    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.callApi(this.smallForm.getFormValues());
        }
      });
  }

  callApi(form: smallForm) {
    if (this.isSingleReg) {
      this.pavAPI
        .getPavOrderExceptionV0GetPavOrderExceptionPost(form)
        .pipe(takeUntil(this.onDestroy))
        .subscribe({
          next: (response: any) => {
            this.ordersExcepData = response;
            this.generateTable();
          },
          error: (err) => {
            this.gs.raiseError(err);
          },
          complete() {},
        });
    } else {
      this.apiServices
        .sho002GetTablesInvoiceStatusOrdersExcepV0Sho002GetTablesInvoiceStatusOrdersExcepPost(
          form
        )
        .pipe(takeUntil(this.onDestroy))
        .subscribe({
          next: (response: any) => {
            this.ordersExcepData = response;
            this.generateTable();
          },
          error: (err) => {
            this.gs.raiseError(err);
          },
        });
    }
  }

  generateTable() {
    this.isLoading = true;
    // call generate table from the tabulator table service
    this.ordersExcepTable = this.table.generateTable(
      '#orders-exception-table',
      this.tableDataArray,
      this.ordersExcepData,
      '410px'
    );
    this.isLoading = false;
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  downloadCsv() {
    this.gs.showDownloadMessage();
    const form = this.smallForm.getFormValues();
    const fileName = `Orders Exceptions ${form.julFromDate} - ${form.julToDate} ${form.division} ${form.branch} ${form.vehicleType}`;
    this.ordersExcepTable.download('csv', fileName);
    this.gs.closeDownloadMessage();
  }
  onButtonClick(rowData: any) {
    this.smallForm.patchPavReg(rowData.vehiclereg);
    this.router.navigate(['/viewasset']);
  }

  customButtonFormatter(
    cell: CellComponent,
    formatterParams: any,
    onRendered: () => void
  ): string {
    const icon = formatterParams.icon || '';
    return `<div style="font-size: 14px;" class="material-icons">${icon}</div>`;
  }
}
