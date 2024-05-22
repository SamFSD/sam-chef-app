import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ComponentsService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { CellComponent } from 'tabulator-tables';
import { smallForm } from '../../small-form-component/small-form-interface';
import { SmallFormService } from '../../small-form-component/small-form.service';

@Component({
  selector: 'app-component-detailed-invoice-table',
  templateUrl: './component-detailed-invoice-table.component.html',
  styleUrls: ['./component-detailed-invoice-table.component.scss'],
})
export class ComponentDetailedInvoiceTableComponent {
  tableColumns: any[] = [];
  invoiceTableData: any;
  private readonly onDestroy = new Subject<void>();

  isLoading: boolean = true;
  apiSub: any;
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
    { title: 'Vehicle Reg', field: 'vehiclereg', headerFilter: 'input' },
    { title: 'Vehicle Type', field: 'veh_type_map', headerFilter: 'input' },
    { title: 'Vehicle Model', field: 'veh_model_map', headerFilter: 'input' },
    { title: 'Vehicle Make', field: 'veh_make_map', headerFilter: 'input' },
    { title: 'Mapping', field: 'mapping', headerFilter: 'input' },
    { title: 'Supplier Name', field: 'serviceprovider', headerFilter: 'input' },
    {
      title: 'Customer PO',
      field: 'order_number',
      sorter: 'number',
      headerFilter: 'input',
    },
    { title: 'Inv. No', field: 'invoice_no', headerFilter: 'input' },
    { title: 'Inv. Date', field: 'transdate', headerFilter: 'input' },

    {
      title: 'Costs',
      field: 'amount',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
      headerFilter: 'input',
    },
    {
      title: 'Savings',
      field: 'savings',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
      headerFilter: 'input',
    },
    { title: 'Savings reason', field: 'savings_reason', headerFilter: 'input' },

    // invoice number
  ];
  invoiceTable: any;
  constructor(
    private smallForm: SmallFormService,
    private apiServices: ComponentsService,
    private gs: GlobalService,
    private router: Router,
    private tableService: TabulatorTableService
  ) {
    this.customButtonFormatter = this.customButtonFormatter.bind(this);
  }
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

    this.apiSub = this.apiServices
      .sho002GetInvByComponentV0Sho002GetInvByComponentPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (response: any) => {
          this.invoiceTableData = response;
          this.isLoading = false;
          this.generateInvoiceTable();
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
        complete: () => {},
      });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  generateInvoiceTable() {
    this.invoiceTable = this.tableService.generateTable(
      '#component-inv-table',
      this.tableDataArray,
      this.invoiceTableData,
      '450px'
    );
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
  
  downloadCsv() {
    this.gs.showDownloadMessage();
    const form = this.smallForm.getFormValues();
    const fileName = `Component Invoices ${form.julFromDate} - ${form.julToDate}`;
    this.invoiceTable.download('csv', fileName);
    this.gs.closeDownloadMessage();
  }
}
