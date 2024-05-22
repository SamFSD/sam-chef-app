import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  InvoiceStatusService,
  PerAssetsViewService,
} from 'src/app/core/api/api_service';
import { CellComponent, TabulatorFull as Tabulator } from 'tabulator-tables';
import { SmallFormService } from '../../small-form-component/small-form.service';

import { Router } from '@angular/router';
import { GlobalService } from 'src/app/core/services/global.service';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { smallForm } from '../../small-form-component/small-form-interface';

@Component({
  selector: 'app-invoice-exceptions',
  templateUrl: './invoice-exceptions.component.html',
  styleUrls: ['./invoice-exceptions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceExceptionsComponent {
  @Input() isSingleReg: boolean = false;

  isLoading: boolean = true;
  private readonly onDestroy = new Subject<void>();
  invoiceTableData: any;
  tabelTitle: string = 'Invoice Exceptions';
  tableColumns: any[] = [];
  invoiceExcepTable: any;
  invoiceExcepData: any;

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
    { title: 'Date Created', field: 'transdate', headerFilter: 'input' },
    // { title: 'Invoice Number', field: 'invoice_no' },
    { title: 'Customer PO', field: 'order_number', headerFilter: 'input' },
    {
      title: 'Costs',
      field: 'amount',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
      headerFilter: 'input',
    },

    { title: 'Vehicle Reg', field: 'vehiclereg', headerFilter: 'input' },
    { title: 'Fleet No', field: 'fleet_no', headerFilter: 'input' },

    {
      title: 'Service Provider',
      field: 'serviceprovider',
      headerFilter: 'input',
    },
    { title: 'Mapping', field: 'mapping', headerFilter: 'input' },
    { title: 'Description', field: 'maintdescription', headerFilter: 'input' },
    {
      title: 'Savings',
      field: 'savings',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
      headerFilter: 'input',
    },
    {
      title: 'Work Order Distance',
      field: 'work_order_distance',
      formatter: (cell: any) => this.gs.toTabKM(cell),
      headerFilter: 'input',
    },
  ];
  constructor(
    private smallForm: SmallFormService,
    private apiServices: InvoiceStatusService,
    private gs: GlobalService,
    private router: Router,
    private pavAPI: PerAssetsViewService,
    private tableService: TabulatorTableService
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
    this.isLoading = true;
    if (this.isSingleReg) {
      this.pavAPI
        .getPavInvoiceExceptionV0GetPavInvoiceExceptionPost(form)
        .pipe(takeUntil(this.onDestroy))
        .subscribe({
          next: (response: any) => {
            //change api call

            this.invoiceExcepData = response;
            // call generate table from the tabulator table service
            this.generateInvoiceTable();
          },
          error: (err: any) => {
            this.gs.raiseError(err);
          },
          complete() {},
        });
    } else {
      this.apiServices
        .sho002GetTablesInvoiceStatusInvoicesExcepV0Sho002GetTablesInvoiceStatusInvoiceExcepPost(
          form
        )
        .pipe(takeUntil(this.onDestroy))
        .subscribe({
          next: (response) => {
            //change api call

            this.invoiceExcepData = response;
            // console.log(response, 'data');
            this.generateInvoiceTable();
          },
          error: (err) => {
            this.gs.raiseError(err);
          },
          complete() {},
        });
    }
  }

  generateInvoiceTable() {
    this.isLoading = true;
    this.invoiceExcepTable = this.tableService.generateTable(
      '#invoice-exception-table',
      this.tableDataArray,
      this.invoiceExcepData,
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
    const fileName = `Invoices Exceptions ${form.julFromDate} - ${form.julToDate} ${form.division} ${form.branch} ${form.vehicleType}`;
    this.invoiceExcepTable.download('csv', fileName);
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
