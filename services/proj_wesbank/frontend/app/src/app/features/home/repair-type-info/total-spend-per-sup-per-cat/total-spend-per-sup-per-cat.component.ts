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
  selector: 'app-total-spend-per-sup-per-cat',
  templateUrl: './total-spend-per-sup-per-cat.component.html',
  styleUrls: ['./total-spend-per-sup-per-cat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotalSpendPerSupPerCatComponent {
  @Input() spendPerSupplier!: any;
  isLoading: boolean = true;
  toTalSpendPerCatTable: any;

  constructor(
    private gs: GlobalService,
    private tableService: TabulatorTableService,
    private smallForm: SmallFormService
  ) {}

  tableArray: any[] = [
    {
      title: 'Supplier Name',
      field: 'serviceprovider',
      headerFilter: true,
    },
    {
      title: 'Accident',
      field: 'Accident',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
    },
    {
      title: 'R&M',
      field: 'R&M',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
    },
    {
      title: 'Breakdown',
      field: 'Breakdowns',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
    },
    {
      title: 'Unknown',
      field: 'Unknown',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
    },
  ];

  ngOnInit(): void {
    this.generateTable();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['spendPerSupplier']) {
      this.generateTable();
    }
  }

  generateTable() {
    // Set isLoading to true before loading data
    this.isLoading = true;
    // call generate table from the tabulator table service
  this.toTalSpendPerCatTable =  this.tableService.generateTable(
      '#spend-per-sup-per-cat',
      this.tableArray,
      this.spendPerSupplier,
      '310px'
    );
    // Set isLoading to false after data is loaded
    this.isLoading = false;
  }

    /// download method that table data and export as csv
    exportToCSV() {
      if (this.spendPerSupplier) {
        this.gs.showDownloadMessage();
        const form = this.smallForm.getFormValues();
        const fileName = `Spend Per Supplier Per Category ${form.julFromDate} - to - ${form.julToDate}`;
        this.toTalSpendPerCatTable.download('csv', fileName);
        this.gs.closeDownloadMessage();
      } else {
        console.error('Tabulator table is not initialized.');
      }
    }
}
