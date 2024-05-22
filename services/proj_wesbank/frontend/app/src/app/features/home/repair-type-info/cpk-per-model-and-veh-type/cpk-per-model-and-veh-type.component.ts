import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { GlobalService } from 'src/app/core/services/global.service';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { SmallFormService } from '../../small-form-component/small-form.service';

@Component({
  selector: 'app-cpk-per-model-and-veh-type',
  templateUrl: './cpk-per-model-and-veh-type.component.html',
  styleUrls: ['./cpk-per-model-and-veh-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CpkPerModelAndVehTypeComponent implements OnInit, OnChanges {
  @Input() cpkPerModel: any;
  isLoading: boolean = true;
  cpkPerModelTable: any;

  constructor(
    private gs: GlobalService,
    private tableService: TabulatorTableService,
    private smallForm: SmallFormService
  ) {}

  tableArray: any[] = [
    { title: 'Vehicle Type', field: 'veh_type_map' },
    { title: 'Vehicle Model', field: 'veh_model_map' },
    {
      title: 'Total Distance Travelled',
      field: 'total_distance',
      formatter: (cell: any) => this.gs.toTabKM(cell),
    },
    {
      title: 'Total Fuel Cost',
      field: 'total_fuel_cost',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
    },
    {
      title: 'Total Toll Cost',
      field: 'total_toll_cost',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
    },
    {
      title: 'Total R&M COST',
      field: 'total_rm_cost',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
    },
    { title: 'R&M CPK', field: 'rm_cpk' },
    {
      title: 'Total Unknowns Cost',
      field: 'total_unknowns_cost',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
    },
    { title: 'Unknown CPK', field: 'unknown_cpk' },
    {
      title: 'Total Breakdown Cost',
      field: 'total_breakdown_cost',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
    },
    { title: 'Breakdown CPK', field: 'breakdown_cpk' },
    {
      title: 'Total Accidents Cost',
      field: 'total_accidents_cost',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
    },
    { title: 'Accidents CPK', field: 'accidents_cpk' },
  ];

  ngOnInit(): void {
    this.generateTable();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cpkPerModel']) {
      this.generateTable();
    }
  }

  generateTable(): void {
    // Set isLoading to true before loading data
    this.isLoading = true;
    // call generate table from the tabulator table service
    this.cpkPerModelTable = this.tableService.generateTable(
      '#cpk-per-model-table',
      this.tableArray,
      this.cpkPerModel,
      '310px'
    );
    // Set isLoading to false after data is loaded
    this.isLoading = false;
  }

  /// download method that table data and export as csv
  exportToCSV() {
    if (this.cpkPerModel) {
      this.gs.showDownloadMessage();
      const form = this.smallForm.getFormValues();
      const fileName = `CPK Per Model And Vehicle Type ${form.julFromDate} - to - ${form.julToDate}`;
      this.cpkPerModelTable.download('csv', fileName);
      this.gs.closeDownloadMessage();
    } else {
      console.error('Tabulator table is not initialized.');
    }
  }
}
