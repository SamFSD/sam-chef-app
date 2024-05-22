import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SuppliersService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { CellComponent } from 'tabulator-tables';
import { smallForm } from '../../small-form-component/small-form-interface';
import { SmallFormService } from '../../small-form-component/small-form.service';

@Component({
  selector: 'app-supplier-invoice-table',
  templateUrl: './supplier-invoice-table.component.html',
  styleUrls: ['./supplier-invoice-table.component.scss'],
})
export class SupplierInvoiceTableComponent {
  isLoading: boolean = true;
  supplierInvData: any[] = [];
  supplierInvTable: any;
  tableColumns: any[] = [
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
    { title: 'Vehicle Reg', field: 'vehiclereg', headerFilter: 'input' },
    { title: 'Fleet No', field: 'fleet_no', headerFilter: 'input' },

    { title: 'Vehicle Type', field: 'veh_type_map', headerFilter: 'input' },
    { title: 'Division', field: 'division', headerFilter: 'input' },
    { title: 'Branch', field: 'branch', headerFilter: 'input' },

    {
      title: 'Savings',
      field: 'savings',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
      headerFilter: 'input',
    },
    { title: 'Trans date', field: 'transdate', headerFilter: 'input' },
    {
      title: 'Savings Reasons',
      field: 'savings_reason',
      headerFilter: 'input',
    },
    { title: 'Invoice No', field: 'invoice_no', headerFilter: 'input' },
    { title: 'Mapping ', field: 'mapping', headerFilter: 'input' },
    {
      title: 'Service Provider',
      field: 'serviceprovider',
      headerFilter: 'input',
    },
    {
      title: 'Amount',
      field: 'amount',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
      headerFilter: 'input',
    },
  ];

  private readonly onDestroy = new Subject<void>();
  supplierInvoiceTable: any;

  constructor(
    private gs: GlobalService,
    private api: SuppliersService,
    private smallForm: SmallFormService,
    private router: Router,
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
    this.api
      .sho002GetSupplierInvV0Sho002GetSupplierInvPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.supplierInvData = res;
          this.isLoading = false;
          // call generate table from the tabulator table service
       this.supplierInvoiceTable =   this.tableService.generateTable(
            '#supplierInvTable',
            this.tableColumns,
            this.supplierInvData,
            '310px'
          );
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
        complete() {},
      });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  downloadCsv() {
    this.gs.showDownloadMessage();
    const form = this.smallForm.getFormValues();
    const fileName = `Invoices by Supplier ${form.julFromDate} - ${form.julToDate}`;
    this.supplierInvoiceTable.download('csv', fileName);
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
