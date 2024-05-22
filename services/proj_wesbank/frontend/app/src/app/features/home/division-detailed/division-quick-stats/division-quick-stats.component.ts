import { Component, Input, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CpksChartsAndGraphsService } from 'src/app/core/api/api_service';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
@Component({
  selector: 'app-division-quick-stats',
  templateUrl: './division-quick-stats.component.html',
  styleUrls: ['./division-quick-stats.component.scss'],
})
export class DivisionQuickStatsComponent {
  @Input() division: string = 'full_fleet';
  perModelTableData: any;
  perTypeTableData: any;
  perModelTable!: Tabulator;
  perTypeTable!: Tabulator;
  cpkSub!: Subscription;

  constructor(
    private api: CpksChartsAndGraphsService,
    private router: Router,
    private tableService: TabulatorTableService
  ) {}

  perModelColumns = [
    { field: 'veh_model_map', title: 'Model' },
    { field: 'asset_count_division', title: 'Count' },
    { field: 'div_cpk', title: 'Avg cpk' },
    { field: 'percentage_of_fleet_cpk', title: '% of Fleet avg' },
  ];

  perTypeColumns = [
    { field: 'veh_type_map', title: 'Type' },
    { field: 'asset_count_division', title: 'Fleet Count' },
    { field: 'div_cpk', title: 'Type avg cpk' },
    { field: 'percentage_of_fleet_cpk', title: '% of Fleet avg' },
  ];

  ngOnChanges(change: SimpleChanges) {
    if (change['division'] ) {
      this.cpkSub = this.api
        .getTotalCpkRankedForAllModelsInDivisionV0GetTotalCpkRankedForAllModelsInDivisionGet(
          change['division'].currentValue
        )
        .subscribe((response) => {
          this.perModelTableData = response.model_cpks;
          this.generateTable(
            this.perModelTableData,
            this.perModelTable,
            '#perModelTable',
            this.perModelColumns
          );
          this.perTypeTableData = response.type_cpks;
          this.generateTable(
            this.perTypeTableData,
            this.perTypeTable,
            '#perTypeTable',
            this.perTypeColumns
          );
        });
    }
  }

  ngOnInit() {
    this.cpkSub = this.api
      .getTotalCpkRankedForAllModelsInDivisionV0GetTotalCpkRankedForAllModelsInDivisionGet(
        this.division
      )
      .subscribe((response) => {
        this.perModelTableData = response.model_cpks;
        this.generateTable(
          this.perModelTableData,
          this.perModelTable,
          '#perModelTable',
          this.perModelColumns
        );
        this.perTypeTableData = response.type_cpks;
        this.generateTable(
          this.perTypeTableData,
          this.perTypeTable,
          '#perTypeTable',
          this.perTypeColumns
        );
      });
  }

  ngOnDestroy() {
    this.cpkSub.unsubscribe();
  }

  generateTable(dataset: any, table: any, tableID: string, columns: any) {
    this.tableService.generateTable(tableID, columns, dataset, 'auto');

    table.on(
      'rowSelected',
      (tableRow: { _row: { data: { vehiclereg: any } } }) => {
        // this.router.navigate(['viewasset', assetID]);
      }
    );
  }
}
