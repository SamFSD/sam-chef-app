import {
  ChangeDetectionStrategy,
  Component,
  Input,
  SimpleChanges,
} from '@angular/core';
import { GlobalService } from 'src/app/core/services/global.service';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { Tabulator } from 'tabulator-tables';
import { SmallFormService } from '../../small-form-component/small-form.service';
interface FuelRecord {
  veh_type_map: string;
  julian_month: string;
  distance: string;
  litres: number;
  cost: number;
  cpk: string;
  consumption: string;
}
@Component({
  selector: 'app-fuel-cpk-and-consuptions',
  templateUrl: './fuel-cpk-and-consuptions.component.html',
  styleUrls: ['./fuel-cpk-and-consuptions.component.scss'],
})
export class FuelCpkAndConsuptionsComponent {
  @Input() fuelCpkAndCons!: [FuelRecord];
  isLoading: boolean = true;
  fuelConsumptionTable: any;

  constructor(
    private gs: GlobalService,
    private fleetCardTable: TabulatorTableService,
    private smallForm: SmallFormService
  ) {}

  tableArray: any[] = [
    {
      title: 'Vehicle Registration',
      field: 'vehiclereg',
      headerFilter: true,
    },
    {
      title: 'Fleet No',
      field: 'fleet_no',
      headerFilter: true,
    },
    {
      title: 'Date',
      field: 'transaction_date',
      headerFilter: true,
    },
    {
      title: 'Purchase Category',
      field: 'transaction_type',
      headerFilter: true,
    },
    {
      title: 'Vendor',
      field: 'vendor',
      headerFilter: true,
    },
    {
      title: 'Total Costs',
      field: 'transaction_cost',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
    },
    {
      title: 'Total Litres',
      field: 'litres',
    },
    {
      title: 'Transaction No',
      field: 'transaction_number',
      headerFilter: true,
    },
  ];

  ngOnInit() {
    this.generateTable();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cpkPerModel']) {
      this.generateTable();
    }
  }

  generateTable() {
    // Set isLoading to true before loading data
    this.isLoading = true;
    // call generate table from the tabulator table service
    this.fuelConsumptionTable = this.fleetCardTable.generateTable(
      '#spend-per-veh-cpk_cons',
      this.tableArray,
      this.fuelCpkAndCons,
      '310px'
    );
    // Set isLoading to false after data is loaded
    this.isLoading = false;
  }

    /// download method that table data and export as csv
    exportToCSV() {
      if (this.fuelCpkAndCons) {
        this.gs.showDownloadMessage();
        const form = this.smallForm.getFormValues();
        const fileName = `Transactions ${form.julFromDate} - to - ${form.julToDate}`;
        this.fuelConsumptionTable.download('csv', fileName);
        this.gs.closeDownloadMessage();
      } else {
        console.error('Tabulator table is not initialized.');
      }
    }
}
