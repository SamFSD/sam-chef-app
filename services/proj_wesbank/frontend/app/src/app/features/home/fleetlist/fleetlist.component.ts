import { Component, EventEmitter, Output } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { FleetlistService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { TabFormatService } from 'src/app/core/services/tab-format.service';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { CellComponent } from 'tabulator-tables';
import { SmallFormService } from '../small-form-component/small-form.service';

@Component({
  selector: 'app-fleetlist',
  templateUrl: './fleetlist.component.html',
  styleUrls: ['./fleetlist.component.scss'],
})
export class FleetlistComponent {
  @Output() registrationClick: EventEmitter<any> = new EventEmitter<any>();
  isLoading: boolean = true;
  formValues: any;
  fleetlist: any;
  tableColumns: any[] = [];
  fleetTable: any;
  apiSub: any;
  drivingEventsData: any;
  private readonly onDestroy = new Subject<void>();
  fleetlistTable: any;

  constructor(
    private apiService: FleetlistService,
    private gs: GlobalService,
    private smallForm: SmallFormService,
    private table: TabulatorTableService,
    private tabService: TabFormatService
  ) {
    this.smallForm.formPage = 'extension';
    this.smallForm.formLayoutType.next('full-page');
    //hide top row bars if they are shown
    this.gs.disableTopRows();
    //hide small form if it is shown

    //show date selector
    this.smallForm.showDateSelectorDD.next(false);
    this.gs.showSmallForm.next(true);

    //hide date range selector on the fleetlist page
    this.smallForm.showDateRangeSelector.next(false);
    this.smallForm.showMappingDD.next(false);
    this.smallForm.showSupplierDD.next(false);
    // show vehicle count top row
    this.gs.showFleetlistVehicleCountTopRow.next(true);
    this.gs.showFleetCardTop.next(false);
    // show long form
    this.smallForm.showDateRangeSelector.next(false);
    this.smallForm.showMake.next(false);
  }

  ngOnInit() {
    // subscribe to form changes and update
    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.getFleetlist(this.smallForm.getFormValues());
        }
      });
  }
  // form to update the fleetlist table -TODO
  getFleetlist(form: any) {
    this.isLoading = true;

    this.apiService
      .getFleetlistV0FleetlistPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe((returnedFleetList: any) => {
        this.fleetlist = returnedFleetList;
        this.isLoading = false;
        // call generate table from the tabulator table service
        this.fleetlistTable = this.table.generateTable(
          '#fleetlist-table',
          this.tableArrays,
          returnedFleetList,
          '410px'
        );
      });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  tableArrays: any[] = [
    {
      title: '',
      field: 'action',
      formatter: this.tabService.customButtonFormatter,
      formatterParams: { icon: 'search' },
      cellClick: (e: Event, cell: CellComponent) => {
        // Call your function here
        this.tabService.onButtonClick(cell.getRow().getData());
      },
      headerSort: false,
      width: 20,
      hozAlign: 'center',
    },
    { title: 'New / Used', field: 'new_used', headerFilter: 'input' },
    { title: 'Type', field: 'veh_type_map', headerFilter: 'input' },
    { title: 'Make', field: 'make', headerFilter: 'input' },
    { title: 'Model', field: 'veh_model_map', headerFilter: 'input' },
    {
      title: 'Vehicle Registration',
      field: 'vehiclereg',
      headerFilter: 'input',
    },
    { title: 'Fleet No', field: 'fleet_no', headerFilter: 'input' },
    { title: 'Contract', field: 'contract_type', headerFilter: 'input' },
    { title: 'Month Rem', field: 'months_remaining', headerFilter: 'input' },
    { title: 'Branch', field: 'branch', headerFilter: 'input' },
    {
      title: 'Last Known Odo',
      field: 'last_odo',
      headerFilter: 'input',
      formatter: (cell: any) => this.gs.toTabKM(cell),
    },
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


  /// download method that table data and export as csv
  exportToCSV() {
    if (this.fleetTable) {
      this.gs.showDownloadMessage();
      const form = this.smallForm.getFormValues();
      const fileName = `fleetlist ${form.julFromDate} - to - ${form.julToDate}`;
      this.fleetlistTable.download('csv', fileName);
      this.gs.closeDownloadMessage();
    } else {
      console.error('Tabulator table is not initialized.');
    }
  }
 
}
