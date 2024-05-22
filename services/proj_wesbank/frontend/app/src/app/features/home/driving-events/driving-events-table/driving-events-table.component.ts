import { Component, Input, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { TabFormatService } from 'src/app/core/services/tab-format.service';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { CellComponent } from 'tabulator-tables';
import { DrivingEventsService } from '../driving-events.service';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { GlobalService } from 'src/app/core/services/global.service';
declare global {
  interface Window {
    Tabulator: any;
  }
}

@Component({
  selector: 'app-driving-events-table',
  templateUrl: './driving-events-table.component.html',
  styleUrls: ['./driving-events-table.component.scss'],
})
export class DrivingEventsTableComponent {
  @Input() drivingEventsData: any;

  isLoading: boolean = true;
  //todo
  @Input() eventData: any;

  drivingEventsTable: any;

  tableArray: any[] = [
    {
      title: '',
      field: 'action',
      formatter: this.tabService.customButtonFormatter,
      formatterParams: { icon: 'search' },
      cellClick: (e: Event, cell: CellComponent) => {
        this.tabService.onButtonClick(cell.getRow().getData());
      },
      headerSort: false,
      width: 20,
      hozAlign: 'center',
    },
    {
      title: 'Division',
      field: 'division',
    },
    {
      title: 'Registration',
      field: 'vehiclereg',
      headerFilter: 'input',
    },
    {
      title: 'Fleet No',
      field: 'fleet_no',
    },
    {
      title: 'Vehicle Type',
      field: 'veh_type_map',
      headerFilter: 'input',
    },
    {
      title: 'Model',
      field: 'veh_model_map',
      headerFilter: 'input',
    },

    {
      title: 'Asset Name',
      field: 'asset_name',
    },
    {
      title: 'Event Description',
      field: 'event_description',
      headerFilter: 'input',
    },

    {
      title: 'Speed Limit',
      field: 'road_speed_limit',
      headerFilter: 'input',
    },
    {
      title: 'Event Values',
      field: 'event_values',
      headerFilter: 'input',
    },
    {
      title: 'Event Region',
      field: 'event_region',
    },
    {
      title: 'Event Date',
      field: 'event_date',
    },

    //below columns are hidden
    {
      title: 'Start Latitude',
      field: 'start_lat',
    },
    {
      title: 'Start Longitude',
      field: 'start_lon',
    },

    {
      title: 'Event Keys',
      field: 'event_key',
    },
  ];

  constructor(
    private tabService: TabFormatService,
    private eventService: DrivingEventsService,
    private router: Router,
    private tableService: TabulatorTableService,
    private smallForm: SmallFormService,
    private gs: GlobalService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['drivingEventsData']) {
      // console.log(this.drivingEventsData, 'driving events data on changes');
      this.generateTable();
    }
  }

  generateTable() {
    if (this.drivingEventsData) {
      this.isLoading = true;

      // call the tabulator table to generate the tabulator table
      this.drivingEventsTable = this.tableService.generateTable(
        '#driving-events-table',
        this.tableArray,
        this.drivingEventsData,
        '410px'
      );
      this.isLoading = false;
    }

    // columns to hide from the table
    this.tableArray.forEach((column) => {
      if (
        column.field === 'event_key' ||
        column.field === 'start_lat' ||
        column.field === 'start_lon'
      ) {
        column.visible = false;
      }
    });
    //subscribe to gauges, if an event gauge is selected, filter this table to that event (Check if table exists first, and if the event clicked is 'total', remove all filters)
    this.eventService.onEventSelect.subscribe((event: any) => {
      if (this.drivingEventsTable) {
        if (event === 'Total') {
          // this.drivingEventsTable.clearFilter(true);
        } else {
          this.drivingEventsTable.setFilter('event_description', '=', event);
        }
      }
    });

    /// the pav page events  table
    this.drivingEventsTable.on('tableBuilt', () => {
      if (this.router.url.includes('viewasset')) {
        this.drivingEventsTable.setFilter('vehiclereg', 'like', this.eventData);
        this.eventService.passDataFromPerEventTableToMap.next(this.eventData);
      }
    });

    /// on table init with all events before filtered by guage
    this.eventService.passDataFromPerEventTableToMap.next(
      this.drivingEventsData
    );

    this.drivingEventsTable.on('rowClick', (event: any, tableRow: any) => {
      // Clear existing markers before updating with selected marker
      this.eventService.selectedTableEventSubject.next([]);

      const selectedData = tableRow.getData();
      const selectedDataArray = [];
      // Push selected data into the array
      selectedDataArray.push(selectedData);

      // Passing the array of selected data to the next component
      this.eventService.passDataFromPerEventTableToMap.next(selectedDataArray);
    });
  }

  exportToCSV() {
    this.gs.showDownloadMessage();
    const form = this.smallForm.getFormValues();
    const fileName = `Driving Events Details ${form.julFromDate} - ${form.julToDate}`;
    this.drivingEventsTable.download('csv', fileName);
    this.gs.closeDownloadMessage();
  }
}
