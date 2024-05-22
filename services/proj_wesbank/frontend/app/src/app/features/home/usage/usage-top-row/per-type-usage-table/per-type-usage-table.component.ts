import { Component, Input, SimpleChanges } from '@angular/core';
import { GlobalService } from 'src/app/core/services/global.service';
import { TabulatorTableService } from 'src/app/core/services/tabulator-table/tabulator-table.service';
import { SmallFormService } from '../../../small-form-component/small-form.service';
@Component({
  selector: 'app-per-type-usage-table',
  templateUrl: './per-type-usage-table.component.html',
  styleUrls: ['./per-type-usage-table.component.scss'],
})
export class PerTypeUsageTableComponent {
  @Input() perTypeUsageTableData: any;

  isLoading: boolean = true;
  apiSub: any;
  currencyParameter = {
    symbol: 'R',
    decimal: ',',
    thousand: ' ',
    symbolAfter: false,
    negativeSign: true,
    precision: false,
  };
  tableData: any;
  pieUsageChange: boolean = false;
  table: any;
  apiCall: any;
  pieChart: any;
  graphTitle: string = 'Usage Per Type';
  perUsageTable: any;
  constructor(
    private smallFormService: SmallFormService,
    private gs: GlobalService,
    private tableService: TabulatorTableService,
    private smallForm: SmallFormService
  ) {}

  ngOnInit() {
    // show top stats row
    this.gs.showCPKUsageTop.next(true);
    if (this.perTypeUsageTableData) {
      this.generatePieChart();
      this.generateTable();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['perTypeUsageTableData']) {
      this.generatePieChart();
      this.generateTable();
    }
  }

  generateTable() {
    this.isLoading = true;
    // call generate table from the tabulator table service
    this.perUsageTable = this.tableService.generateTable(
      '#usage-per-type-table',
      this.tableColumns,
      this.perTypeUsageTableData,
      '310px'
    );
    this.isLoading = false;
  }

  downloadCsv() {
    if (this.perTypeUsageTableData) {
      this.gs.showDownloadMessage();
      const form = this.smallForm.getFormValues();
      const fileName = `Vehicle Type Cpk, Cost And Distance ${form.julFromDate} - to - ${form.julToDate}`;
      this.perUsageTable.download('csv', fileName);
      this.gs.closeDownloadMessage();
    } else {
      console.error('Tabulator table is not initialized.');
    }
  }

  tableColumns: any[] = [
    {
      title: 'Type',
      field: 'veh_type_map',
      headerTooltip: 'Type of vehicle',
    },
    {
      title: 'Total CPK',
      field: 'cpk',
      headerTooltip: 'Total CPK for the vehicle type',
    },
    {
      title: 'Total Cost',
      field: 'costs',
      headerTooltip: 'Total cost for the vehicle type',
      formatter: 'money',
      formatterParams: this.gs.toTabZAR(),
    },
    {
      title: 'Total Distance',
      field: 'distance',
      headerTooltip: 'Total distance for the vehicle type',
      formatter: (cell: any) => this.gs.toTabKM(cell),
    },
  ];

  generatePieChart() {
    this.isLoading = true
    const pieData = this.perTypeUsageTableData.map((item: any) => ({
      name: item.veh_type_map,
      value: item.distance,
    }));

    this.pieChart = {
      textStyle: {
        fontFamily: 'Roboto',
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          let tooltip = params.name + '<br/>';

          const formattedValue = this.gs.toKM(params.value);
          tooltip += params.marker + formattedValue + '<br/>';

          return tooltip;
        },
      },

      series: [
        {
          type: 'pie',
          radius: ['40%', '65%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'outside',
          },
          labelLine: {
            show: false,
          },
          grid: [0, 0, 0, 0],
          data: pieData,
          itemStyle: {
            borderType: 'solid',
            // color: '#15a3b2', // '#33b2df
            borderColor: '#ffffff',
            borderRadius: 4,
          },
        },
      ],
    };
    this.isLoading = false
  }

  onChartEvent(event: any, type: string) {
    if (!this.pieUsageChange) {
      //update form veh type value when a value is clicked here
      this.smallFormService.updateTypeValue.next([event.name]);
      // submit and updates the small form when pie even(chart) is clicked
      this.smallFormService.submitSmallForm.next(true);
    }
  }
}
