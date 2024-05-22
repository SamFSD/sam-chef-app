import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ComponentsService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { CellComponent } from 'tabulator-tables';
import { smallForm } from '../../small-form-component/small-form-interface';
import { SmallFormService } from '../../small-form-component/small-form.service';

@Component({
  selector: 'app-component-row-top',
  templateUrl: './component-row-top.component.html',
  styleUrls: ['./component-row-top.component.scss'],
})
export class ComponentRowTopComponent implements OnInit, OnDestroy {
  private readonly onDestroy = new Subject<void>();
  isLoadingMost: boolean = true;
  isLoadingLeast: boolean = true;
  apiSub: any;
  currencyParameter = {
    symbol: 'R',
    decimal: ',',
    thousand: ' ',
    symbolAfter: false,
    negativeSign: true,
    precision: false,
  };

  mostExpensiveVehTable: any;
  leastExpensiveVehTable: any;
  mostExpensiveTable: any;
  leastExpensiveTable: any;
  tableType: any;

  constructor(
    private apiServices: ComponentsService,
    private smallForm: SmallFormService,
    private gs: GlobalService,
    private router: Router,
    private tableService: TabulatorTableService
  ) {}

  leastExpensiveVehiclesData: any;
  mostExpensiveVehicleData: any;

  formValues: any;

  ngOnInit() {
    this.smallForm.showMappingDD.next(true);
    this.smallForm.showSupplierDD.next(false);
    this.smallForm.showDateSelectorDD.next(true);

    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.callApi(this.smallForm.getFormValues());
        }
      });
  }

  callApi(form: smallForm) {
    this.formValues = form;
    this.callMostExpApi(form);
    this.callLeastExpApi(form);
  }

  callMostExpApi(form: smallForm) {
    this.isLoadingLeast = true;
    this.apiSub = this.apiServices
      .sho002BestAssetsCostsPerComponentV0Sho002BestAssetsCostsPerComponentPost(
        form
      )
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (mostExpensiveVehicles: any) => {
          this.isLoadingLeast = false;
          this.mostExpensiveVehicleData = mostExpensiveVehicles;
          this.genMostExpVehTable();
        },
        error: (err) => {
          this.gs.raiseError(err);
        },
      });
  }

  callLeastExpApi(form: smallForm, showZero: boolean = false) {
    this.isLoadingMost = true;
    this.apiSub = this.apiServices
      .sho002LeastAssetsCostsPerComponentV0Sho002LeastAssetsCostsPerComponentPost(
        form
      )
      .pipe(takeUntil(this.onDestroy))
      .subscribe((leastExpensiveVehicles: any) => {
        this.isLoadingMost = false;
        this.leastExpensiveVehiclesData = leastExpensiveVehicles;
        this.genLeastExpVehTable();
      });
  }

  onToggleChange(toggle: any) {
    if (toggle.checked) {
      this.callLeastExpApi(this.formValues, true);
    } else {
      this.callLeastExpApi(this.formValues, false);
    }
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  tableArrays: any[] = [
    {
      title: '',
      field: 'action',
      formatter: this.customButtonFormatter,
      formatterParams: { icon: 'search' },
      cellClick: (e: Event, cell: CellComponent) => {
        this.onButtonClick(cell.getRow().getData());
      },
      headerSort: false,
      width: 20,
      hozAlign: 'center',
    },
    { title: 'Reg', field: 'vehiclereg', headerFilter: 'index' },
    {
      title: 'Costs',
      field: 'cost',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
    },
    { title: 'Repairs', field: 'repair_count' },
    {
      title: 'Component CPK',
      field: 'component_cpk',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
    },
  ];

  genMostExpVehTable() {
    this.mostExpensiveVehTable = this.tableService.generateTable(
      '#mostExpensiveVeh-table',
      this.tableArrays,
      this.mostExpensiveVehicleData,
      '75%'
    );
  }

  genLeastExpVehTable() {
    this.leastExpensiveVehTable = this.tableService.generateTable(
      '#leastExpensiveVeh-table',
      this.tableArrays,
      this.leastExpensiveVehiclesData,
      '75%'
    );
  }

  downloadCsv(tableType: string) {
    const form = this.smallForm.getFormValues();
    if (tableType === 'mostExpensive') {
      const fileName = `Most Expensive Vehicles ${form.julFromDate} - to - ${form.julToDate}`;
      this.mostExpensiveVehTable.download('csv', fileName);
    } else if (tableType === 'leastExpensive') {
      const fileName = `Least Expensive Vehicles ${form.julFromDate} - to - ${form.julToDate}`;
      this.leastExpensiveVehTable.download('csv', fileName);
    } else {
      console.error('Unknown table type');
    }
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
