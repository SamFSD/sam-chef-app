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
  selector: 'app-completed-invoices',
  templateUrl: './completed-invoices.component.html',
  styleUrls: ['./completed-invoices.component.scss'],
})
export class CompletedInvoicesComponent {
  @Input() isSingleReg: boolean = false;
  isLoading: boolean = true;
  tabelTitle: string = 'Completed Invoices';
  tableColumns: any[] = [];
  completedInvoicesTable!: Tabulator;
  completedInvoicesData: any;
  //set table columns
  apiSub: any;

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
    { title: 'Invoice Number', field: 'invoice_no', headerFilter: 'input' },
    { title: 'Customer PO', field: 'order_number', headerFilter: 'input' },
    {
      title: 'Costs',
      field: 'amount',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
      headerFilter: 'input',
    },
    {
      title: 'Order Difference',
      field: 'order_difference',
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
        .getPavInvoicesCompletedV0GetPavInvoicesCompletedPost(form)
        .pipe(takeUntil(this.onDestroy))
        .subscribe({
          next: (response: any) => {
            this.completedInvoicesData = response;
            // call generate table from the tabulator table service
            this.generateTable();
          },
          error: (err) => {
            this.gs.raiseError(err);
          },
          complete() {},
        });
    } else {
      this.apiServices
        .sho002GetTablesInvoiceStatusCompletedInvoicesV0Sho002GetTablesInvoiceStatusCompletedInvoicesPost(
          form
        )
        .pipe(takeUntil(this.onDestroy))
        .subscribe({
          next: (response: any) => {
            this.completedInvoicesData = response;
            // call generate table from the tabulator table service
            this.generateTable();
          },
          error: (err) => {
            this.gs.raiseError(err);
          },
          complete() {},
        });
    }
  }

  generateTable() {
    this.isLoading = true;
    this.completedInvoicesTable = this.table.generateTable(
      '#completed-table',
      this.tableDataArray,
      this.completedInvoicesData,
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
    const fileName = `Completed Invoices ${form.julFromDate} - ${form.julToDate} ${form.division} ${form.branch} ${form.vehicleType}`;
    this.completedInvoicesTable.download('csv', fileName);
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
