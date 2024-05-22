import { Component, Input, SimpleChanges } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/core/services/global.service';
import {
  TabulatorFull as Tabulator
} from 'tabulator-tables';
@Component({
  selector: 'app-component-cost-per-asset-popup-table',
  templateUrl: './component-cost-per-asset-popup-table.component.html',
  styleUrls: ['./component-cost-per-asset-popup-table.component.scss'],
})
export class ComponentCostPerAssetPopupTableComponent {
  //table to hold assets
  assetTable: any;

  //input value to this popup component
  @Input() inputData: any;
  constructor(
    private router: Router,
    private gs: GlobalService,
    private dialogRef: MatDialogRef<ComponentCostPerAssetPopupTableComponent>
  ) {}

  ngOnInit() { 
    this.generateTable(this.router);
  }
  ngOnChanges(change: SimpleChanges) {
    if (change['inputData']) {
      // this.generateTable(this.router);
    }
  }
  generateTable(router: Router) {
    const tableColumns = Object.keys(this.inputData).map((key) => ({
      title: key,
      field: key,
    }));

    // const tableColumns = Object.keys(this.fleetlist[0]).map((key) => {
    //   return { title: key, field: key };
    // });
    this.assetTable = new Tabulator('#component-cost-tabulator-table', {
      columns: tableColumns,
      data: this.inputData,
      pagination: true,
      paginationSize: 20,
      // paginationSizeSelector: [20, 50, 100],
      paginationInitialPage: 1,
      selectable: true,
    });
    // this.assetTable.on(
    //   'rowSelected',        //   'rowSelected',
    //   (tableRow: { _row: { data: { vehiclereg: any } } }) => {
    //     const assetID = tableRow._row.data.vehiclereg;
    //     this.dialogRef.close(); // Close the dialog
    //     router.navigate(['viewasset', assetID]);
    //   }
    // );
    //   (tableRow: { _row: { data: { vehiclereg: any } } }) => {
    //     const assetID = tableRow._row.data.vehiclereg;
    //     this.dialogRef.close(); // Close the dialog
    //     router.navigate(['viewasset', assetID]);
    //   }
    // );
  }
}
