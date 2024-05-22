import { Component, Input, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TableDialogComponent } from '../table-dialog/table-dialog.component';

@Component({
  selector: 'app-cpk-ranker',
  templateUrl: './cpk-ranker.component.html',
  styleUrls: ['./cpk-ranker.component.scss'],
})
export class CpkRankerComponent {
  @Input() division?: string;
  @Input() branch?: string;
  @Input() assets: any[] = [];
  topAssets?: any;
  botAssets?: any;
  ngOnChanges(change: SimpleChanges) {
    if (change['assets']) {
      this.assets = change['assets'].currentValue;
      this.topAssets = this.assets.slice(0, 3);
      this.botAssets = this.assets.slice(-4, -1);
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(TableDialogComponent, {
      // width: '250px',
    });

    dialogRef.componentInstance.vehicles = this.assets;
  }
  constructor(public dialog: MatDialog) {}
}
