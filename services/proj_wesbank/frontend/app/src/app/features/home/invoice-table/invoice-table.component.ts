import { Component, Input, SimpleChanges } from '@angular/core';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { invoice_row } from 'src/app/interfaces.interrface';
import { Tabulator } from 'tabulator-tables';
@Component({
  selector: 'app-invoice-table',
  templateUrl: './invoice-table.component.html',
  styleUrls: ['./invoice-table.component.scss'],
})
export class InvoiceTableComponent {
  isLoading: boolean = false;

  @Input() invoices?: invoice_row[];

  invoiceTable!: Tabulator;

  constructor(private tableService: TabulatorTableService) {}

  tableArray: any[] = [
    { title: 'Mapping', field: 'mapping', widthGrow: 1 },
    { title: 'Description', field: 'maintdescription', widthGrow: 1 },

    { title: 'Date', field: 'transdate', widthGrow: 1 },
    { title: 'Amount', field: 'amount', widthGrow: 1 },

    { title: 'Savings', field: 'savings', widthGrow: 1 },
    { title: 'Savings Reason', field: 'savings_reason', widthGrow: 1 },
    { title: 'Odo', field: 'work_order_distance', widthGrow: 1 },
    { title: 'Provider', field: 'serviceprovider', widthGrow: 1 },
  ];

  ngOnChanges(change: SimpleChanges) {
    this.isLoading = true;
    if (change['invoices']) {
      //generate table method in the tabulator service
      this.tableService.generateTable(
        '#invoice-table',
        this.tableArray,
        change['invoice'].currentValue,
        '310px'
      );
    }
    this.isLoading = false;
  }
}
