import { Component, Input, SimpleChanges } from '@angular/core';
import {
  CpksChartsAndGraphsService,
  FilterFormService,
  PerAssetsViewService,
} from 'src/app/core/api/api_service';

@Component({
  selector: 'app-header-stats',
  templateUrl: './header-stats.component.html',
  styleUrls: ['./header-stats.component.scss'],
})
export class HeaderStatsComponent {
  @Input() division?: string;
  headerString: string = '';
  typeStr: string = '';
  branches: string[] = [];
  branchCount: number = 0;
  divDistance: number = 0;
  divCost: number = 0;
  divCPK: number = 0;
  barChartOptions: any;
  sunburstChartOptions: any;
  sunburstChartData: any;
  barChartData: any;
  assetCount: number = 0;
  divDistances: {
    distance: number;
    division: string;
    percentage_of_fleet_dist: number;
  }[] = [{ distance: 0, division: 'test', percentage_of_fleet_dist: 50 }];
  divCosts: any;
  apiSub: any;
  constructor(
    private api: PerAssetsViewService,
    private apiFilter: FilterFormService,
    private apiCpk: CpksChartsAndGraphsService,
  ) {}
  ngOnInit() {
    // this.formService.
    if (this.division) {
      this.headerString = this.division;
      this.typeStr = 'division';
      this.getData(this.division);
    }
  }

  ngOnChanges(change: SimpleChanges) {
    if (change['division']) {
      this.headerString = change['division'].currentValue;
      this.typeStr = 'division';

      this.division = change['division'].currentValue;
      this.getData(change['division'].currentValue);
    }
  }
  getData(division: string) {
    this.apiFilter
      .getBranchesInDivisionV0GetBranchesInDivisionGet(division)
      .subscribe((response) => {
        this.branches = response;
        this.branchCount = this.branches.length;
      });
    this.api
      .getAssetCountPerDivisionV0GetAssetCountPerDivisionGet(division)
      .subscribe((response) => {
        this.assetCount = response.total_count;
      });
    this.api
      .getTotalStatsPerDivisionV0GetTotalStatsPerDivisionGet()
      .subscribe((data) => {
        // this.barChartData = data.data;
        // this.divCosts = data.costs;
        this.divDistance = data.data.find(
          (div: any) => div.division.toLowerCase() === division.toLowerCase()
        ).distance;

        this.divCost = data.data.find(
          (div: any) => div.division.toLowerCase() === division.toLowerCase()
        ).costs;
        this.divCPK = data.data.find(
          (div: any) => div.division.toLowerCase() === division.toLowerCase()
        ).cpk;

        // this.setBarChart();
      });
    //get per componet per branch sunburst
    this.apiCpk
      .getCostPerComponentInDivisionPiV0GetCostOperComponentInDivisionPiGet(
        division
      )
      .subscribe((data) => {
        this.sunburstChartData = data.sunburst;
        this.setSunburstChart();
      });
    //get bar chart data for all branches in selected division
    this.api
      .getTotalStatsPerBranchInDivisionV0GetTotalStatsPerBranchInDivisionGet(
        division
      )
      .subscribe((data) => {
        this.barChartData = data.data;

        this.setBarChart();
      });
  }
  ngOnDestroy() {
    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }
  }

  getProgressBarColor() {
    // const maxCPK = this.getMaxCPK(components);
    // const percentage = (cpk / maxCPK) * 100;
    // if (percentage >= 75) {
    //   return 'red';
    // } else if (percentage >= 50) {
    //   return 'yellow';
    // } else {
    //   return 'green';
    // }
  }
  setSunburstChart() {
    this.sunburstChartOptions = {
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      series: [
        {
          type: 'sunburst',
          data: this.sunburstChartData,
          emphasis: {
            focus: 'ancestor',
          },

          levels: [
            {},
            {
              r0: '35%',
              r: '75%',
              itemStyle: {
                borderWidth: 2,
              },
              label: {
                rotate: 'tangential',
                show: false,
              },
              emphasis: {
                label: {
                  show: true,
                  position: 'inside',
                  overflow: 'overflow',
                },
              },
              downplay: {
                label: {
                  show: false,
                  position: 'inside',
                  overflow: 'overflow',
                },
              },
            },
            {
              r0: '75%',
              r: '100%',
              label: {
                align: 'right',
                show: false,
              },
              emphasis: {
                label: {
                  show: true,
                },
              },
              downplay: {
                label: {
                  show: false,
                },
              },
            },
            {
              r0: '70%',
              r: '85%',
              label: {
                position: 'outside',
                padding: 3,
                silent: false,
                show: false,
              },
              emphasis: {
                label: {
                  show: true,
                },
              },
              downplay: {
                label: {
                  show: false,
                },
              },
              itemStyle: {
                borderWidth: 3,
              },
            },
            {
              r0: '85%',
              r: '100%',
              label: {
                position: 'outside',
                padding: 3,
                silent: false,
                show: false,
              },
              emphasis: {
                label: {
                  show: true,
                  position: 'inside',
                  overflow: 'overflow',
                },
              },
              downplay: {
                label: {
                  show: false,
                },
              },
              itemStyle: {
                borderWidth: 3,
              },
            },
            {
              label: {
                // position: 'outside',
                padding: 3,
                silent: false,
                position: 'inside',
                overflow: 'overflow',
                // show: false,
              },
            },
          ],
        },
      ],
      // events: [
      //   {
      //     type: 'click',
      //     handler: this.onSegmentClick.bind(this),
      //   },
      // ],
    };
  }
  setBarChart() {
    const divisions = this.barChartData.map((item: any) => item.branch);
    const distances = this.barChartData.map((item: any) => item.distance);
    const costs = this.barChartData.map((item: any) => item.costs);
    const cpks = this.barChartData.map((item: any) => item.cpk);

    this.barChartOptions = {
      // title: {
      //   text: 'Costs and Dstances per Branch in Division',
      // },
      legend: {
        data: ['bar', 'bar2'],
        align: 'top',
      },
      tooltip: {},
      xAxis: {
        data: divisions,
        rotate: -90,
        silent: false,
        splitLine: {
          show: false,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Distance',
          position: 'left',
          show: false,
          // axisLabel: {
          //   formatter: this.formatDistance,
          // },
        },
        {
          type: 'value',
          name: 'Costs',
          position: 'right',
          show: false,
          // axisLabel: {
          //   formatter: this.formatCosts, // Optional: Customize the costs Y-axis label format
          // },
        },
        {
          type: 'value',
          name: 'CPK',
          position: 'right',
          show: false,
          // axisLabel: {
          //   formatter: this.formatCosts, // Optional: Customize the costs Y-axis label format
          // },
        },
      ],
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      series: [
        {
          name: 'Distance',
          type: 'bar',
          data: distances,
          yAxisIndex: 0,
          color: '#69d2dc',
          animationDelay: (idx: number) => idx * 10,
        },
        {
          name: 'Costs',
          type: 'bar',
          data: costs,
          yAxisIndex: 1,
          color: '#15a3b2',
          animationDelay: (idx: number) => idx * 10 + 100,
        },
        {
          name: 'CPK',
          type: 'bar',
          data: cpks,
          yAxisIndex: 2,
          color: '#007582',
          animationDelay: (idx: number) => idx * 10 + 200,
        },
      ],
      animationEasing: 'elasticOut',
      animationDelayUpdate: (idx: number) => idx * 5,
    };
  }
  formatDistance(value: number): string {
    const millionValue = value / 1000000;
    return (
      millionValue.toLocaleString('en-US', { minimumFractionDigits: 1 }) +
      ' M Km'
    );
  }
  formatCosts(value: number): string {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 1,
    });
  }
}
