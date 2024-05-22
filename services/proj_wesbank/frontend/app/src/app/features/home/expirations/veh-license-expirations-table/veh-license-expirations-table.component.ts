import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ExpirationsService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { CellComponent, TabulatorFull as Tabulator } from 'tabulator-tables';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';

@Component({
  selector: 'app-veh-license-expirations-table',
  templateUrl: './veh-license-expirations-table.component.html',
  styleUrls: ['./veh-license-expirations-table.component.scss'],
})
export class VehLicenseExpirationsTableComponent {
  isLoading: boolean = true;
  vehExpTableData: any[] = [];
  vehLicExpTable!: Tabulator;

  tableColumns: any[] = [
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
    { title: 'Division', field: 'division', headerFilter: 'input' },

    { title: 'Vehicle Reg', field: 'vehiclereg', headerFilter: 'input' },
    { title: 'Fleet No', field: 'fleet_no', headerFilter: 'input' },

    { title: 'Branch', field: 'branch', headerFilter: 'input' },
    {
      title: 'Date of First Reg',
      field: 'date_of_first_reg',
      headerFilter: 'input',
    },

    {
      title: 'Vehicle Lic Exp',
      field: 'veh_lic_exp',
      headerFilter: 'input',
    },
  ];

  private readonly onDestroy = new Subject<void>();
  vehLicExpirationTable: any;

  constructor(
    private api: ExpirationsService,
    private smallForm: SmallFormService,
    private gs: GlobalService,
    private router: Router,
    private tableService: TabulatorTableService
  ) {}

  ngOnInit() {
    //when small form is ready, get the values from it and call api
    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.callApi(this.smallForm.getFormValues());
        }
      });
  }

  callApi(form: any) {
    this.isLoading = true;

    this.api
      .getVehicleLicenceExpirationsV0GetVehicleLicenceExpirationsPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (vehLicExp: any) => {
          this.vehExpTableData = vehLicExp;
          this.isLoading = false;
          this.generateVehExpTable();
        },
        error: (err) => {
          this.gs.raiseError(err);
        },
      });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  generateVehExpTable() {
    this.vehLicExpirationTable = this.tableService.generateTable(
      '#vehLicExpTable',
      this.tableColumns,
      this.vehExpTableData,
      '450px'
    );
  }

  exportToCSV() {
    this.gs.showDownloadMessage();
    const form = this.smallForm.getFormValues();
    const fileName = `Vehicles Lincenses Expiries ${form.division} ${form.branch} ${form.vehicleType}`;
    this.vehLicExpirationTable.download('csv', fileName);
    this.gs.closeDownloadMessage();
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
}
