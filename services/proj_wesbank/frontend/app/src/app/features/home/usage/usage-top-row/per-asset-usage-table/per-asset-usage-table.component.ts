import { Component, Input, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/core/services/global.service';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { CellComponent, Tabulator } from 'tabulator-tables';
import { SmallFormService } from '../../../small-form-component/small-form.service';
@Component({
  selector: 'app-per-asset-usage-table',
  templateUrl: './per-asset-usage-table.component.html',
  styleUrls: ['./per-asset-usage-table.component.scss'],
})
export class PerAssetUsageTableComponent {
  @Input() perAssetsTableData: any;
  isLoading: boolean = true;
  table!: Tabulator;


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
    { title: 'Reg', field: 'vehiclereg', headerFilter: 'input' },
    { title: 'Make', field: 'veh_make_map', headerFilter: 'input' },
    { title: 'Model', field: 'veh_model_map', headerFilter: 'input' },
    { title: 'Branch', field: 'branch', headerFilter: 'input' },
    { title: 'Division', field: 'division', headerFilter: 'input' },
    // { title: 'Total CPK', field: 'cpk', headerTooltip: 'Total CPK for the vehicle type' },
    // { title: 'Total Cost', field: 'costs', headerTooltip: 'Total cost for the vehicle type' },
    {
      title: 'Total Distance',
      field: 'distance',
      formatter: (cell: any) => this.gs.toTabKM(cell),
      headerTooltip: 'Total distance for the vehicle type',
      headerFilter: 'input',
    },
  ];
  perAssetUsageTable: any;
  constructor(
    private smallForm: SmallFormService,
    private router: Router,
    private gs: GlobalService,
    private tableService: TabulatorTableService
  ) {}

  ngOnInit() {
    if (this.perAssetsTableData) {
      this.generateTable();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['perAssetsTableData']) {
      this.generateTable();
    }
  }

  generateTable() {
    this.isLoading = true;
    // call generate table from the tabulator table service
    this.perAssetUsageTable = this.table = this.tableService.generateTable(
      '#usage-per-asset-table',
      this.tableColumns,
      this.perAssetsTableData,
      '310px'
    );
    this.isLoading = false;
  }

  downloadCsv() {
    if (this.perAssetsTableData) {
      this.gs.showDownloadMessage();
      const form = this.smallForm.getFormValues();
      const fileName = `Per Asset Usage ${form.julFromDate} - to - ${form.julToDate}`;
      this.perAssetUsageTable.download('csv', fileName);
      this.gs.closeDownloadMessage();
    } else {
      console.error('Tabulator table is not initialized.');
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
