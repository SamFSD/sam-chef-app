import {
  ChangeDetectionStrategy,
  Component,
  Input,
  SimpleChanges,
} from '@angular/core';
import { GlobalService } from 'src/app/core/services/global.service';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { SmallFormService } from '../../small-form-component/small-form.service';

@Component({
  selector: 'app-spend-per-sup-category',
  templateUrl: './spend-per-sup-category.component.html',
  styleUrls: ['./spend-per-sup-category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpendPerSupCategoryComponent {
  @Input() spendpercategory: any;
  isLoading: boolean = true;
  spendPerVondorTable: any;

  constructor(
    private gs: GlobalService,
    private spendPerCatTableTable: TabulatorTableService,
    private smallForm: SmallFormService
  ) {}

  tableArrays: any[] = [
    { title: 'Supplier', field: 'vendor' },
    { title: 'Division', field: 'division' },
    { title: 'Branch', field: 'branch' },
    { title: 'Vendor', field: 'vendor' },
    { title: 'Litres', field: 'litres' },
    {
      title: 'Transaction Cost',
      field: 'transaction_cost',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
    },
    { title: 'Purchase Category', field: 'purchase_category' },
  ];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['spendpercategory']) {
      this.generateTable();
    }
  }

  ngOnInit() {
    this.generateTable();
  }

  generateTable() {
    // Set isLoading to true before loading data
    this.isLoading = true;
    // call generate table from the tabulator table service
    this.spendPerVondorTable = this.spendPerCatTableTable.generateTable(
      '#spend-per-cat-table',
      this.tableArrays,
      this.spendpercategory,
      '310px'
    );
    // Set isLoading to false after data is loaded
    this.isLoading = false;
  }

    /// download method that table data and export as csv
    exportToCSV() {
      if (this.spendpercategory) {
        this.gs.showDownloadMessage();
        const form = this.smallForm.getFormValues();
        const fileName = `Total Spend Per Vendor ${form.julFromDate} - to - ${form.julToDate}`;
        this.spendPerVondorTable.download('csv', fileName);
        this.gs.closeDownloadMessage();
      } else {
        console.error('Tabulator table is not initialized.');
      }
    }
}
