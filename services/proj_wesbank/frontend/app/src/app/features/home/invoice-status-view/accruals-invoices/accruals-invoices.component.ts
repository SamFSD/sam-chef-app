import { Component, Input, SimpleChanges } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  InvoiceStatusService,
  PerAssetsViewService,
} from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { TabFormatService } from 'src/app/core/services/tab-format.service';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { CellComponent, TabulatorFull as Tabulator } from 'tabulator-tables';
import { smallForm } from '../../small-form-component/small-form-interface';
import { SmallFormService } from '../../small-form-component/small-form.service';

@Component({
  selector: 'app-accruals-invoices',
  templateUrl: './accruals-invoices.component.html',
  styleUrls: ['./accruals-invoices.component.scss'],
})
export class AccrualsInvoicesComponent {
  @Input() isSingleReg: boolean = false;

  isLoading: boolean = true;
  tabelTitle: string = 'Accruals Invoices';
  tableColumns: any[] = [];
  accrualTable!: Tabulator;
  accrualTableData: any;

  apiSub: any;
  private readonly onDestroy = new Subject<void>();
  tableDataArray: any[] = [
    {
      title: '',
      field: 'action',
      formatter: this.tabService.customButtonFormatter,
      formatterParams: { icon: 'search' },
      cellClick: (e: Event, cell: CellComponent) => {
        // Call your function here
        this.tabService.onButtonClick(cell.getRow().getData());
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

  constructor(
    private apiServices: InvoiceStatusService,
    private smallForm: SmallFormService,
    private gs: GlobalService,
    private pavAPI: PerAssetsViewService,
    private tabService: TabFormatService,

    private table: TabulatorTableService
  ) {}

  ngOnInit() {
    // console.log(this.isSingleReg, 'true or false');
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
        .getPavInvoiceAccrualV0GetPavInvoiceAccrualPost(form)
        .pipe(takeUntil(this.onDestroy))
        .subscribe({
          next: (response: any) => {
            this.accrualTableData = response;
            this.generateTable();
          },
          error: (err) => {
            this.gs.raiseError(err);
          },
          complete() {},
        });
    } else {
      this.apiSub = this.apiServices
        .sho002GetTablesInvoiceStatusAccrualInvoicesV0Sho002GetTablesInvoiceStatusAccrualInvoicesPost(
          form
        )
        .pipe(takeUntil(this.onDestroy))
        .subscribe({
          next: (response: any) => {
            this.accrualTableData = response;
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
    // call generate table from the tabulator table service
    this.accrualTable = this.table.generateTable(
      '#accrual-table',
      this.tableDataArray,
      this.accrualTableData,
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
    const fileName = `Accruals invoices ${form.julFromDate} - ${form.julToDate} ${form.division} ${form.branch} ${form.vehicleType}`;
    this.accrualTable.download('csv', fileName);
    this.gs.closeDownloadMessage();
  }
}
