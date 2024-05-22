import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DashboardService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { CellComponent } from 'tabulator-tables';
import { smallForm } from '../../small-form-component/small-form-interface';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { DashStddevPopupComponent } from './dash-stddev-popup/dash-stddev-popup.component';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
@Component({
  selector: 'app-stddeviation',
  templateUrl: './stddeviation.component.html',
  styleUrls: ['./stddeviation.component.scss'],
})
export class StddeviationComponent {
  private readonly onDestroy = new Subject<void>();

  isLoading: boolean = true;
  stdDevData: any;
  tableColumns: any[] = [
    {
      title: '',
      field: 'action',
      formatter: this.customButtonSearchFormatter,
      formatterParams: { icon: 'search' },
      cellClick: (e: Event, cell: CellComponent) => {
        // Call your function here
        this.onViewAssetClick(cell.getRow().getData());
      },
      headerSort: false,
      width: 20,
      hozAlign: 'center',
    },
    { title: 'Fleet No', field: 'fleet_no' },
    { title: 'Registration', field: 'reg' },
    {
      title: 'Amount',
      field: 'sum',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
    },
    { title: '# of Transactions', field: 'count' },
    {
      title: '',
      field: 'action',
      formatter: this.customButtonFormatter,
      formatterParams: { icon: 'assignment' },
      cellClick: (e: Event, cell: CellComponent) => {
        // Call your function here
        this.onViewDetailsClick(cell.getRow().getData());
      },
      headerSort: false,
      width: 20,
      hozAlign: 'center',
    },
  ];
  stdTable: any;

  constructor(
    private smallForm: SmallFormService,
    private api: DashboardService,
    private gs: GlobalService,
    private router: Router,
    private dialog: MatDialog,
    private tableService: TabulatorTableService
  ) {}

  ngOnInit() {
    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.callApi(this.smallForm.getFormValues());
        }
      });
  }

  callApi(form: smallForm) {
    this.isLoading = true;

    this.api
      .calculateOutliersV0CalculateOutliersPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.stdDevData = res;
          this.generateSTDTable();
        },
        error: (err) => {
          this.gs.raiseError(err);
        },
      });
  }

  generateSTDTable() {
   this.stdTable =  this.tableService.generateTable(
      '#stddev-table',
      this.tableColumns,
      this.stdDevData,
      '450px'
    );
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  onViewAssetClick(rowData: any) {
    this.smallForm.patchPavReg(rowData.reg);
    this.router.navigate(['/viewasset']);
  }

  onViewDetailsClick(row: any) {
    const detailsPopup = this.dialog.open(DashStddevPopupComponent, {
      data: { row: row },
    });
  }

  customButtonFormatter(
    cell: CellComponent,
    formatterParams: any,
    onRendered: () => void
  ): string {
    const icon = formatterParams.icon || '';
    return `<div style="font-size: 14px; color: #007582; cursor: pointer;" class="material-icons">${icon}</div>`;
  }

  customButtonSearchFormatter(
    cell: CellComponent,
    formatterParams: any,
    onRendered: () => void
  ): string {
    const icon = formatterParams.icon || '';
    return `<div style="font-size: 14px; cursor: pointer;" class="material-icons">${icon}</div>`;
  }

    /// download method that table data and export as csv
    exportToCSV() {
      if (this.stdDevData) {
        this.gs.showDownloadMessage();
        const form = this.smallForm.getFormValues();
        const fileName = `Statistical Outliers ${form.julFromDate} - to - ${form.julToDate}`;
        this.stdTable.download('csv', fileName);
        this.gs.closeDownloadMessage();
      } else {
        console.error('Tabulator table is not initialized.');
      }
    }
}
