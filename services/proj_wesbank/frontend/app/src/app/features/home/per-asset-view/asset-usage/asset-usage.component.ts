import { Component, Input, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { PerAssetsViewService } from 'src/app/core/api/api_service/';
import { GlobalService } from 'src/app/core/services/global.service';
import { asset } from '../../models/asset.interface';

@Component({
  selector: 'app-asset-usage',
  templateUrl: './asset-usage.component.html',
  styleUrls: ['./asset-usage.component.scss'],
})
export class AssetUsageComponent {
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

  // barGraph = document.getElementById('chart')!;
  optionsBar: any;
  dateAxis: any;
  avgFleetDist: any;
  avgBranchDist: any;
  assetDist: any;
  usageSub?: Subscription;
  usageInfo?: {
    day_of: string;
    avg_fleet_dist: number;
    avg_branch_dist: number;
    asset_dist: number;
  }[];
  formValues: any;
  constructor(
    public apiService: PerAssetsViewService,
    private gs: GlobalService
  ) {}
  getAssetUsage() {
    this.usageSub = this.apiService
      .getAssetUsageV0GetAssetUsageGet(
        this.assetInfo.vehiclereg,
        this.assetInfo.veh_model_map,
        this.assetInfo.branch,
        // this.formValues.value.start,
        // this.formValues.value.end
        // this.assetInfo.date_of_first_reg,
        '2023-01-01',
        '2023-05-30'
      )
      .subscribe({
        next: (usage) => {
          this.usageInfo = usage;

          this.setAxis();
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
        complete() {},
      });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['assetInfo'].currentValue['vehiclereg'] != '') {
      this.getAssetUsage();
    }
  }

  onChartClick(params: any) {
    if (params.componentType === 'series' && params.seriesType === 'bar') {
      const dataIndex = params.dataIndex;
      const selectedDate = this.optionsBar.xAxis.data[dataIndex];

      // Perform any additional actions with the selected date
    }
  }

  setAxis() {
    this.dateAxis = this.usageInfo?.map((day) => day.day_of);
    this.avgFleetDist = this.usageInfo?.map((day) => day.avg_fleet_dist);
    this.avgBranchDist = this.usageInfo?.map((day) => day.avg_branch_dist);
    this.assetDist = this.usageInfo?.map((day) => day.asset_dist);
    // this.optionsBar.xAxis.data = this.dateAxis;
    // this.optionsBar.series[0].data = this.avgFleetDist;
    // this.optionsBar.series[1].data = this.avgBranchDist;
    // this.optionsBar.series[2].data = this.assetDist;
    this.optionsBar = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['Bar', 'Line'],
      },
      xAxis: {
        type: 'category',
        data: this.dateAxis,
      },
      yAxis: [
        {
          type: 'value',
          name: 'Average Model in Fleet',
          position: 'left',
          axisLabel: {
            formatter: '{value} km',
          },
        },
        {
          type: 'value',
          name: 'Avg Model in Branch',
          position: 'right',
          axisLabel: {
            formatter: '{value} km',
          },
        },
      ],
      series: [
        {
          name: 'Avg Fleet',
          type: 'line',
          data: this.avgFleetDist,
        },
        {
          name: 'Avg Branch',
          type: 'line',
          data: this.avgBranchDist,
        },
        {
          name: this.assetInfo.vehiclereg,
          type: 'bar',
          data: this.assetDist,
        },
      ],
      animationEasing: 'elasticOut',
      animationDelayUpdate: (idx: number) => idx * 5,
    };
    // chart.setOption(option);
  }
  ngOnDestroy() {
    this.usageSub?.unsubscribe();
  }
  ngOnInit() {
    const xAxisData = [];
    const data1 = [];
    const data2 = [];
    // const chart = echarts.init(this.barGraph);
    for (let i = 0; i < 100; i++) {
      xAxisData.push('category' + i);
      data1.push((Math.sin(i / 5) * (i / 5 - 10) + i / 6) * 5);
      data2.push((Math.cos(i / 5) * (i / 5 - 10) + i / 6) * 5);
    }
    this.optionsBar = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['Bar', 'Line'],
      },
      xAxis: {
        type: 'category',
        data: [],
      },
      yAxis: [
        {
          type: 'value',
          name: 'Average Model in Fleet',
          position: 'left',
          axisLabel: {
            formatter: '{value} km',
          },
        },
        {
          type: 'value',
          name: 'Avg Model in Branch',
          position: 'right',
          axisLabel: {
            formatter: '{value} km',
          },
        },
      ],
      series: [
        {
          name: 'Avg Fleet',
          type: 'line',
          data: [],
        },
        {
          name: 'Avg Branch',
          type: 'line',
          data: [],
        },
        {
          name: this.assetInfo.vehiclereg,
          type: 'bar',
          data: [],
        },
      ],
      animationEasing: 'elasticOut',
      animationDelayUpdate: (idx: number) => idx * 5,
    };
    // chart.setOption(option);
  }
}
