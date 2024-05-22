import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ExpirationsService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { CellComponent, TabulatorFull as Tabulator } from 'tabulator-tables';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';

@Component({
  selector: 'app-veh-contract-expirations-table',
  templateUrl: './veh-contract-expirations-table.component.html',
  styleUrls: ['./veh-contract-expirations-table.component.scss'],
})
export class VehContractExpirationsTableComponent {
  datePipe: DatePipe = new DatePipe('en-US');

  isLoading: boolean = true;
  vehContrExpTableData: any[] = [];
  vehicleContractExpirationsTable!: Tabulator;
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
      title: 'Months Remaining',
      field: 'months_remaining',
      headerFilter: 'input',
    },
    { title: 'Contract', field: 'contract_type', headerFilter: 'input' },
    {
      title: 'Start Date',
      field: 'contract_start',
      headerFilter: 'input',
    },
    {
      title: 'Modified Start Date',
      field: 'modified_contract_start_date',
      headerFilter: 'input',
    },
    { title: 'Term Date', field: 'contract_end', headerFilter: 'input' },
    {
      title: '  Contract Progress',
      field: 'progress',
      formatter: 'progress',
      formatterParams: {
        color: '#15a3b2',
        legendAlign: 'center',
      },
      sorter: 'number',
    },
  ];
  private readonly onDestroy = new Subject<void>();
  vehicleContractTable: any;
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
      .getVehicleContractExpirationsV0GetVehicleContractExpirationsPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.vehContrExpTableData = res;
          this.generateVehContrExp();
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

  generateVehContrExp() {
    this.vehicleContractTable = this.tableService.generateTable(
      '#vehicleContractExpirationsTable',
      this.tableColumns,
      this.vehContrExpTableData,
      '450px'
    );
  }

  exportToCSV() {
    this.gs.showDownloadMessage();
    const form = this.smallForm.getFormValues();
    const fileName = `Vehicles Contracts Expiries ${form.division} ${form.branch} ${form.vehicleType}`;
    this.vehicleContractTable.download('csv', fileName);
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
