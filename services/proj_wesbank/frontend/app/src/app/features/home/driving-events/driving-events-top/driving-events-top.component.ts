import { Component, Input, OnChanges } from '@angular/core';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { GlobalService } from 'src/app/core/services/global.service';

@Component({
  selector: 'app-driving-events-top',
  templateUrl: './driving-events-top.component.html',
  styleUrls: ['./driving-events-top.component.scss'],
})
export class DrivingEventsTopComponent implements OnChanges {
  @Input() drivingEventsTopRow: any;
  driversEventsStatsData: any;
  isLoading: boolean = true;

  tableArray: any[] = [
    { title: 'Vehicle Registration', field: 'vehiclereg' },
    { title: 'Fleet Number', field: 'fleet_no' },
    { title: 'Division', field: 'division' },
    { title: 'Branch', field: 'branch' },
    { title: 'Vehicle Type', field: 'veh_type_map' },
    { title: 'Vehicle Make', field: 'veh_make_map' },
    { title: 'Impact Count', field: 'impact_count' },
    { title: 'Acceleration Count', field: 'acceleration_count' },
    { title: 'Braking Count', field: 'braking_count' },
    { title: 'Overspeeding Count', field: 'overspeeding_count' },
    { title: 'Harsh Cornering Count', field: 'harsh_cornering_count' },
    { title: 'Idling Count', field: 'idling_count' },
  ];
  eventsDetailsTable: any;

  constructor(
    private tableservice: TabulatorTableService,
    private smallForm: SmallFormService,
    private gs: GlobalService
  ) {}

  ngOnChanges() {
    if (this.drivingEventsTopRow) {
      this.isLoading = false;
      this.generateTable();
    }
  }

  generateTable() {
    // call the tabulator table to generate the tabulator table
    this.eventsDetailsTable = this.tableservice.generateTable(
      '#driving-events-table-top_row',
      this.tableArray,
      this.drivingEventsTopRow,
      '310px'
    );
  }

  exportToCSV() {
    this.gs.showDownloadMessage();
    const form = this.smallForm.getFormValues();
    const fileName = `Driving Event Count Summary ${form.julFromDate} - ${form.julToDate}`;
    this.eventsDetailsTable.download('csv', fileName);
    this.gs.closeDownloadMessage();
  }
}
