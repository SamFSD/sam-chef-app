import { Component, Input, SimpleChanges } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { GlobalService } from 'src/app/core/services/global.service';
@Component({
  selector: 'app-fleet-count-table',
  templateUrl: './fleet-count-table.component.html',
  styleUrls: ['./fleet-count-table.component.scss'],
})
export class FleetCountTableComponent {
  @Input() passengerData: any;
  @Input() commercialData: any;

  isLoading: boolean = true;
  isCommercial: boolean = true;

  tableColumns: any[] = [];

  commercialColumns: any[] = [
    { title: 'Vehicle Type', field: 'vehicle_type' },
    { title: 'Fleet Number Format', field: 'prefix' },
    { title: 'Count', field: 'veh_count' },
  ];

  passengerColumns: any[] = [
    { title: 'Vehicle Type', field: 'description' },
    { title: 'Count', field: 'count' },
  ];

  tableData: any;
  fleetCountTable: any;

  constructor(
    private fleetCountTableService: TabulatorTableService,
    private smallForm: SmallFormService, 
    private gs: GlobalService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['passengerData' || 'commercialData']) {
      this.generateTable();
    }
  }

  ngOnInit() {
    if (this.passengerData || this.commercialData) {
      this.generateTable();
    }
  }

  generateTable() {
    this.isLoading = true;
    if (this.isCommercial) {
      this.tableColumns = this.commercialColumns;
      this.tableData = this.commercialData;
    } else {
      this.tableColumns = this.passengerColumns;
      this.tableData = this.passengerData;
    }

    this.fleetCountTable = this.fleetCountTableService.generateTable(
      '#fleetcount-table',
      this.tableColumns,
      this.tableData,
      '450px'
    );
    this.isLoading = false;
  }

  onSlideToggleChange(event: MatSlideToggleChange) {
    // this.showExternalOrders = event.checked;
    this.isCommercial = !this.isCommercial;
    this.generateTable();
  }

  /// download method that table data and export as csv
  exportToCSV() {
    if (this.tableData) {
      this.gs.showDownloadMessage();
      const form = this.smallForm.getFormValues();
      // wip: check if we cant get the toggle name for the report (sam)
      const fileName = `Vehicle Fleet Count ${form.julFromDate} - to - ${form.julToDate}`;
      this.fleetCountTable.download('csv', fileName);
      this.gs.closeDownloadMessage();
    } else {
      console.error('Tabulator table is not initialized.');
    }
  }
}
