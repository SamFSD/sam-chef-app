import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SuppliersService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { SmallFormService } from '../../small-form-component/small-form.service';

@Component({
  selector: 'app-component-table',
  templateUrl: './component-table.component.html',
  styleUrls: ['./component-table.component.scss'],
})
export class ComponentTableComponent implements OnInit {
  isLoading: boolean = true;

  componentTableData: any;
  apiSub: any;
  private readonly onDestroy = new Subject<void>();
  componentTable: any;

  constructor(
    private api: SuppliersService,
    private smallForm: SmallFormService,
    private gs: GlobalService,
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

  callApi(form: any) {
    this.isLoading = true;
    this.apiSub = this.api
      .sho002GetComponentTypeTableV0sho002GetComponentTypeTablePost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (componentRes: any) => {
          this.componentTableData = componentRes;
          this.isLoading = false;
          // call generate table from the tabulator table service
          this.componentTable = this.tableService.generateTable(
            '#component-type-table',
            this.tableColumns,
            this.componentTableData,
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

  tableColumns: any[] = [
    {
      title: 'Component Type',
      field: 'mapping',
      headerFilter: 'input',
    },
    {
      title: 'Costs',
      field: 'cost',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
      headerFilter: 'input',
    },
    {
      title: 'Repair Counts',
      field: 'repair_count',
      headerFilter: 'input',
    },
    {
      title: 'Average Cost',
      field: 'avarage_cost',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
      headerFilter: 'input',
    },
  ];

  downloadCsv() {
    this.gs.showDownloadMessage();
    const form = this.smallForm.getFormValues();
    const fileName = `Transactions by Component - ${form.julFromDate} - ${form.julToDate}`;
    this.componentTable.download('csv', fileName);
    this.gs.closeDownloadMessage();
  }
}
