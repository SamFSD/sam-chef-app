import { Component, ViewChild } from '@angular/core';
import { MatRipple, VERSION } from '@angular/material/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DashboardService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { CellComponent } from 'tabulator-tables';
import { smallForm } from '../../small-form-component/small-form-interface';
import { SmallFormService } from '../../small-form-component/small-form.service';

@Component({
  selector: 'app-dashboard-top-row',
  templateUrl: './dashboard-top-row.component.html',
  styleUrls: ['./dashboard-top-row.component.scss'],
})
export class DashboardTopRowComponent {
  version = VERSION;
  /** Reference to the directive instance of the ripple. */
  @ViewChild(MatRipple) ripple!: MatRipple;
  private readonly onDestroy = new Subject<void>();

  bottomRowTable: any;
  showAllTimeData = false;
  topTen: string = 'Top Ten';
  topTenMostExpensive: string = 'Top 10 Most Expesive Assets';
  topTenLeastExpensive: string = 'Top 10 Least Expensive Assets';
  allTimeTopExpensive: string = 'All Time Top 10 Most Expensive Assets';
  allTimeBottomExpensive: string = 'All Time Top 10 Least Expensive Assets';
  allTimeExpesiveAssets: string = 'All Time Expensive Assets';

  isLoading: boolean = true;
  botton_10_all_time: any;
  top_10_all_time: any;
  bottom_10_selected_month: any;
  top_10_selected_month: any;
  bottom_10_all_time: any;
  rippleInterval: any;

  tableArrays: any[] = [
    {
      title: '',
      field: 'action',
      formatter: this.customButtonFormatter,
      formatterParams: { icon: 'search' },
      cellClick: (e: Event, cell: CellComponent) => {
        // Call your function here
        this.onButtonClick(cell.getRow().getData());
      },
      headerSort: false,
      width: 20,
      hozAlign: 'center',
    },
    {
      title: 'Amount',
      field: 'amount',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
    },
    { title: 'Branch', field: 'branch' },
    { title: 'Fleet No', field: 'fleet_no' },
    { title: 'Vehicle Reg', field: 'vehiclereg' },
    { title: 'Vehicle Type', field: 'veh_type_map' },
    { title: 'Contract', field: 'contract_type' },
    {
      title: 'Odo',
      field: 'last_odo',
      formatter: (cell: any) => this.gs.toTabKM(cell),
    },
  ];
  topRowTable: any;
  tableData: any;

  constructor(
    private api: DashboardService,
    private smallForm: SmallFormService,
    private gs: GlobalService,
    private router: Router,
    private tableService: TabulatorTableService
  ) {}

  ngOnInit() {
    this.showAllTimeData = true;

    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.callApi(this.smallForm.getFormValues());
        }
      });
  }

  //changed this as we are now only showing top 100 as per client request
  showAssetsPerToggle() {
    this.showAllTimeData = !this.showAllTimeData;
    if (this.showAllTimeData) {
      // top and bottom 10 all time data
      // this.generatetable(this.bottom_10_all_time);
      this.generateTable(this.top_10_all_time);
    } else {
      //top and bottom 10 selected month data
      // this.generatetable(this.bottom_10_selected_month);
      this.generateTable(this.top_10_selected_month);
    }
  }

  callApi(form: smallForm) {
    this.isLoading = true;

    this.topTenMostExpensive,
      this.topTenLeastExpensive,
      this.api
        .assetsDashboardTopRowApiV0AssetsDashboardTopRowApiPost(form)
        .pipe(takeUntil(this.onDestroy))
        .subscribe({
          next: (res: any) => {
            // top and bottom 10 all time data
            this.bottom_10_all_time = res.bottom_10_all_time;
            this.top_10_all_time = res.top_10_all_time;

            //top and bottom 10 selected month data
            this.bottom_10_selected_month = res.bottom_10_selected_month;
            this.top_10_selected_month = res.top_10_selected_month;

            this.isLoading = false;
            this.showAssetsPerToggle();
          },
          error: (err: any) => {
            this.gs.raiseError(err);
          },
          complete: () => {},
        });
  }

  generateTable(data: any) {
    this.tableData = data;
    this.topRowTable = this.tableService.generateTable(
      '#topRow-Table',
      this.tableArrays,
      data,
      '300px'
    );
  }

  onButtonClick(rowData: any) {
    this.smallForm.patchPavReg(rowData.vehiclereg);
    this.router.navigate(['/viewasset']);
  }

  customButtonFormatter(
    cell: CellComponent,
    formatterParams: any,
    onRendered: () => void
  ): string {
    const icon = formatterParams.icon || '';
    return `<div style="font-size: 14px;" class="material-icons">${icon}</div>`;
  }

  /// download method that table data and export as csv
  exportToCSV() {
    if (this.tableData) {
      this.gs.showDownloadMessage();
      const form = this.smallForm.getFormValues();
      // wip: check if we cant get the toggle name for the report (sam)
      const fileName = `Top / Least Expensive Vehicles ${form.julFromDate} - to - ${form.julToDate}`;
      this.topRowTable.download('csv', fileName);
      this.gs.closeDownloadMessage();
    } else {
      console.error('Tabulator table is not initialized.');
    }
  }
}
