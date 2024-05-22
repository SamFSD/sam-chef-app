import { Component, Input, SimpleChanges } from '@angular/core';
import { asset } from '../../models/asset.interface';
import { PerAssetsViewService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';

@Component({
  selector: 'app-radar-chart',
  templateUrl: './radar-chart.component.html',
  styleUrls: ['./radar-chart.component.scss'],
})
export class RadarChartComponent {
  @Input() assetInfo: asset = {
    branch: '',
    chassis_no: '',
    client_acc_no: '',
    client_name: '',
    contract_mileage: 0,
    contract_type: '',
    date_of_first_reg: '',
    deal_number: 0,
    description: '',
    fleet_list_date: '',
    last_known_odo: '',
    maint_plan_cost: '',
    make: '',
    map: '',
    mm_code: '',
    months_remaining: 0,
    new_used: '',
    pass_comm: '',
    truck_trailer: '',
    veh_model_map: '',
    veh_type_map: '',
    vehicle_cat: '',
    vehiclereg: '',
  };
  radarChartOptions: any;
  radarChartData: any;
  constructor(private api: PerAssetsViewService, private gs: GlobalService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['assetInfo']) {
      this.getAssetCostsOverOdo();
    }
  }

  getAssetCostsOverOdo() {
    this.api
      .getAssetCostOverTimeV0GetAssetSpendOverOdoGet(this.assetInfo.vehiclereg)
      .subscribe({
        next: (data: any) => {
          this.radarChartData = data;

          this.setChartData();
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
        complete() {},
      });
  }

  setChartData() {
    const radarChartData = this.radarChartData;

    // Extract unique mappings and work_order_distances from the data
    const mappings = [
      ...new Set(radarChartData.map((obj: any) => obj.mapping)),
    ];
    const workOrderDistances = [
      ...new Set(radarChartData.map((obj: any) => obj.work_order_distance)),
    ];

    // Function to calculate the maximum value for a specific mapping
    const getMaxValue = (mapping: any) =>
      Math.max(
        ...radarChartData
          .filter((obj: any) => obj.mapping === mapping)
          .map((obj: any) => obj.amount)
      );

    // Prepare the radar indicator based on the mappings
    const radarIndicator = mappings.map((mapping) => ({
      text: mapping,
      max: getMaxValue(mapping),
    }));

    // Prepare the radar series data based on the cumulative amount
    const seriesData = workOrderDistances.map((distance) => {
      const cumulativeAmounts = mappings.map((mapping) => {
        const filteredData = radarChartData.filter(
          (obj: any) =>
            obj.mapping === mapping && obj.work_order_distance === distance
        );
        const cumulativeAmount = filteredData.reduce(
          (sum: number, obj: any) => sum + obj.amount,
          0
        );
        return cumulativeAmount;
      });
      return {
        value: cumulativeAmounts,
        name: String(distance),
      };
    });

    // Radar chart options
    const radarChartOptions = {
      title: {
        text: 'Cumulative Amount by Mapping and Work Order Distance',
        subtext: 'Fake Data',
        top: 10,
        left: 10,
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        type: 'scroll',
        bottom: 10,
        data: workOrderDistances.map((distance) => String(distance)),
      },
      visualMap: {
        top: 'middle',
        right: 10,
        color: ['red', 'yellow'],
        calculable: true,
      },
      radar: {
        indicator: radarIndicator,
      },
      series: [
        {
          type: 'radar',
          symbol: 'none',
          lineStyle: {
            width: 1,
          },
          emphasis: {
            areaStyle: {
              color: 'rgba(0,250,0,0.3)',
            },
          },
          data: seriesData,
        },
      ],
    };

    this.radarChartOptions = radarChartOptions; // Assign the radar chart options to the component property
  }

  ngOnInit() {
    this.radarChartOptions = {
      title: {
        text: 'Proportion of Browsers',
        subtext: 'Fake Data',
        top: 10,
        left: 10,
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        type: 'scroll',
        bottom: 10,
        data: (function () {
          var list = [];
          for (var i = 1; i <= 28; i++) {
            list.push(i + 2000 + '');
          }
          return list;
        })(),
      },
      visualMap: {
        top: 'middle',
        right: 10,
        color: ['red', 'yellow'],
        calculable: true,
      },
      radar: {
        indicator: [
          { text: 'IE8-', max: 400 },
          { text: 'IE9+', max: 400 },
          { text: 'Safari', max: 400 },
          { text: 'Firefox', max: 400 },
          { text: 'Chrome', max: 400 },
        ],
      },
      series: (function () {
        var series = [];
        for (var i = 1; i <= 28; i++) {
          series.push({
            type: 'radar',
            symbol: 'none',
            lineStyle: {
              width: 1,
            },
            emphasis: {
              areaStyle: {
                color: 'rgba(0,250,0,0.3)',
              },
            },
            data: [
              {
                value: [
                  (40 - i) * 10,
                  (38 - i) * 4 + 60,
                  i * 5 + 10,
                  i * 9,
                  (i * i) / 2,
                ],
                name: i + 2000 + '',
              },
            ],
          });
        }
        return series as echarts.RadarSeriesOption;
      })(),
    };
  }
}
