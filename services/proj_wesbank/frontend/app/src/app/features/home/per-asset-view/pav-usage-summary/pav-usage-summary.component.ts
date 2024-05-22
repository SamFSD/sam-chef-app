import { Component } from '@angular/core';
import {
  PerAssetsViewService,
  UsageService,
} from 'src/app/core/api/api_service';
import { PavSelectorService } from '../pav-selector.service';
import { Subject, takeUntil } from 'rxjs';
import { GlobalService } from 'src/app/core/services/global.service';
import { SmallFormService } from '../../small-form-component/small-form.service';

@Component({
  selector: 'app-pav-usage-summary',
  templateUrl: './pav-usage-summary.component.html',
  styleUrls: ['./pav-usage-summary.component.scss'],
})
export class PavUsageSummaryComponent {
  constructor(
    private api: PerAssetsViewService,
    private pavForm: PavSelectorService,
    private gs: GlobalService,
    private smallForm: SmallFormService
  ) {}

  private readonly onDestroy = new Subject<void>();
  isLoading: boolean = true;
  vehiclereg: string = '';
  pavUsageSummaryGraph: any;
  graphData: any;
  showGraph: boolean = false;

  ngOnInit() {
    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.callApi();
        }
      });
  }

  callApi() {
    this.isLoading = true;
    this.api
      .getPavUsageSummaryV0GetPavUsageSummaryPost(
        this.smallForm.getFormValues()
      )
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          this.graphData = res;
          this.generateGraph();
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
        complete: () => {},
      });
  }

  generateGraph() {
    if (!this.graphData || this.graphData.length === 0) {
      // Set a placeholder option for the chart
      this.pavUsageSummaryGraph = {
        graphic: {
          elements: [
            {
              type: 'text',
              left: 'center',
              top: 'middle',
              style: {
                text: 'No Data Available For Selected Filters',
                font: '14px Roboto',
                fill: '#555',
              },
            },
          ],
        },
      };
    } else {
      if (this.graphData.length > 0) {
        this.showGraph = true;
      } else this.showGraph = false;
      const asset = this.graphData.map((supItem: any) => supItem.asset_usage);
      const branch = this.graphData.map((supItem: any) => supItem.branch_avg);
      const fleet = this.graphData.map((supItem: any) => supItem.fleet_avg);
      const months = this.graphData.map((supItem: any) => supItem.month);
      this.pavUsageSummaryGraph = {
        textStyle: {
          fontFamily: 'Roboto',
        },
        tooltip: {
          trigger: 'axis',
        },
        yAxis: {
          type: 'value',
          // boundaryGap: [0, 0.01],
        },
        xAxis: {
          type: 'category',
          data: months,
          axisLabel: {
            show: true,
            rotate: 60,
          },
          axisTick: { show: false },
        },
        series: [
          {
            type: 'bar',
            data: asset,
            itemStyle: {
              borderRadius: [4, 4, 0, 0],
              color: this.gs.getGraphBarColor(),
              label: {
                show: true,
                position: 'insideTop',
                rotate: 90,
                fontWeight: 'bold',
                value: 'Asset',
              },
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              top: '15%',
              containLabel: true,
            },
          },
          {
            type: 'bar',
            data: branch,
            itemStyle: {
              borderRadius: [4, 4, 0, 0],
              color: this.gs.getGraphBarTerColor(),
              label: {
                show: true,
                position: 'insideTop',
                rotate: 90,
                fontWeight: 'bold',
                formatter: '{b}',
              },
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              top: '15%',
              containLabel: true,
            },
          },
          {
            type: 'bar',
            data: fleet,
            itemStyle: {
              borderRadius: [4, 4, 0, 0],
              color: this.gs.getGraphBarSecColor(),
              label: {
                show: true,
                position: 'insideTop',
                rotate: 90,
                fontWeight: 'bold',
                formatter: '{b}',
              },
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              top: '15%',
              containLabel: true,
            },
          },
        ],
        animationDuration: 10000,
        animationEasing: 'elasticOut',
      };
    }
  }

  ngOnDestroy() {
    this.onDestroy.next(), this.onDestroy.complete();
  }
}
