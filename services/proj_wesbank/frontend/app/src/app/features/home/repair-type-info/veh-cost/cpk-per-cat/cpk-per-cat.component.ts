import {
  ChangeDetectionStrategy,
  Component,
  Input,
  SimpleChanges,
} from '@angular/core';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { Tabulator } from 'tabulator-tables';

@Component({
  selector: 'app-cpk-per-cat',
  templateUrl: './cpk-per-cat.component.html',
  styleUrls: ['./cpk-per-cat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CpkPerCatComponent {
  @Input() cpkPerModel: any;
  cpkperCatTable!: Tabulator;

  constructor(private tableService: TabulatorTableService) {}

  tableColumns: any[] = [
    { title: 'Vehicle Model', field: 'veh_model_map' },
    { title: 'Total Distance', field: 'total_distance' },
    { title: 'Total Fuel Cost', field: 'total_fuel_cost' },
    { title: 'Total Toll Cost', field: 'total_toll_cost' },
    { title: 'Total RM Cost', field: 'total_rm_cost' },
    { title: 'Total BD Cost', field: 'total_bd_cost' },
    { title: 'Total ACC Cost', field: 'total_acc_cost' },
    { title: 'Total Other FC Cost', field: 'total_other_fc_cost' },
    { title: 'Fuel CPK', field: 'fuel_cpk' },
    { title: 'Toll CPK', field: 'toll_cpk' },
    { title: 'RM CPK', field: 'rm_cpk' },
    { title: 'BD CPK', field: 'bd_cpk' },
    { title: 'ACC CPK', field: 'acc_cpk' },
    { title: 'Other FC CPK', field: 'other_fc_cpk' },
  ];

  ngOnInit(): void {
    // call generate table from the tabulator table service
    this.tableService.generateTable(
      '#cpk-per-model-table',
      this.tableColumns,
      this.cpkPerModel,
      '310px'
    );
  }
}
