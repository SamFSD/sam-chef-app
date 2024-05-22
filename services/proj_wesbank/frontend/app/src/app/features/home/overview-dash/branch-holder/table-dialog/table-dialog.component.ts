import { Component, Input, SimpleChanges } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
@Component({
  selector: 'app-table-dialog',
  templateUrl: './table-dialog.component.html',
  styleUrls: ['./table-dialog.component.scss'],
})
export class TableDialogComponent {
  @Input() vehicles: any;
  fleetTable: any;
  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<TableDialogComponent>
  ) {}

  ngOnInit() {
    this.generateTable(this.router);
  }

  ngOnChanges(change: SimpleChanges) {
    if (change['vehicles']) {
      this.generateTable(this.router);
    }
  }

  generateTable(router: Router) {
    const tableColumns = Object.keys(this.vehicles[0]).map((key) => ({
      title: key,
      field: key,
    }));

    // const tableColumns = Object.keys(this.fleetlist[0]).map((key) => {
    //   return { title: key, field: key };
    // });

    this.fleetTable = new Tabulator('#tabulator-table', {
      columns: tableColumns,
      data: this.vehicles,
      pagination: true,
      paginationSize: 20,
      // paginationSizeSelector: [20, 50, 100],
      paginationInitialPage: 1,
      selectable: true,
    });

    this.fleetTable.on(
      'rowSelected',
      (tableRow: { _row: { data: { vehiclereg: any } } }) => {
        const assetID = tableRow._row.data.vehiclereg;
        this.dialogRef.close(); // Close the dialog
        router.navigate(['viewasset', assetID]);
      }
    );
  }
}
