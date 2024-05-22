import { Component, OnInit } from '@angular/core';
import { SuppliersService } from 'src/app/core/api/api_service';

import { Subject, takeUntil } from 'rxjs';
import { GlobalService } from 'src/app/core/services/global.service';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { smallForm } from '../../small-form-component/small-form-interface';
import { SmallFormService } from '../../small-form-component/small-form.service';

@Component({
  selector: 'app-veh-type-table',
  templateUrl: './veh-type-table.component.html',
  styleUrls: ['./veh-type-table.component.scss'],
})
export class VehTypeTableComponent implements OnInit {
  isLoading: boolean = true;
  private readonly onDestroy = new Subject<void>();

  vehTypesTable: any;
  vehTypeTableData: any;
  apiSub: any;
  vehicleTable: any;

  constructor(
    private api: SuppliersService,
    private smallFormService: SmallFormService,
    private gs: GlobalService,
    private tableservice: TabulatorTableService
  ) {}

  tableDataArray: any[] = [
    { title: 'Vehicle Type', field: 'veh_type_map', headerFilter: 'input' },
    {
      title: 'Costs',
      field: 'cost',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
      headerFilter: 'input',
    },
    { title: 'Repair Counts', field: 'repair_count', headerFilter: 'input' },
    {
      title: 'Average Cost',
      field: 'avarage_cost',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
      headerFilter: 'input',
    },
  ];

  ngOnInit() {
    this.smallFormService.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.callApi(this.smallFormService.getFormValues());
        }
      });
  }

  callApi(form: smallForm) {
    this.isLoading = true;
    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }
    this.apiSub = this.api
      .sho002GetVehTypeTableV0sho002GetVehTypeTablePost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.vehTypeTableData = res;
          // call generate table from the tabulator table service
          this.vehicleTable = this.tableservice.generateTable(
            '#vehtable',
            this.tableDataArray,
            this.vehTypeTableData,
            '310px'
          );
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
        complete() {},
      });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  downloadCsv() {
    this.gs.showDownloadMessage();
    const form = this.smallFormService.getFormValues();
    const fileName = `Transactions by Vehicle Type ${form.julFromDate} - ${form.julToDate}`;
    this.vehicleTable.download('csv', fileName);
    this.gs.closeDownloadMessage();
  }
}
