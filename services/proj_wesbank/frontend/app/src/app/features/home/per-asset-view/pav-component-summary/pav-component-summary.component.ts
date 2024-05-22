import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PerAssetsViewService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { PavSelectorService } from '../pav-selector.service';
import { SmallFormService } from '../../small-form-component/small-form.service';
@Component({
  selector: 'app-pav-component-summary',
  templateUrl: './pav-component-summary.component.html',
  styleUrls: ['./pav-component-summary.component.scss'],
})
export class PavComponentSummaryComponent {
  constructor(
    private api: PerAssetsViewService,
    private pavForm: PavSelectorService,
    private gs: GlobalService,
    private smallForm: SmallFormService
  ) {}

  private readonly onDestroy = new Subject<void>();
  isLoading: boolean = true;
  vehiclereg: string = '';
  period: string = '';
  component: string = 'all_components';
  pavComponentSummaryGraph: any;
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
      .getPavComponentsV0GetPavComponentsPost(this.smallForm.getFormValues())
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
      this.pavComponentSummaryGraph = {
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
      const data = this.graphData.map(
        (supItem: any) => supItem.mapping || 'No Component Mapped'
      );
      const assetValues = this.graphData.map(
        (supItem: any) => supItem.asset_comp
      );
      const branchValues = this.graphData.map(
        (supItem: any) => supItem.branch_avg
      );
      const fleetValues = this.graphData.map(
        (supItem: any) => supItem.fleet_avg
      );
      this.pavComponentSummaryGraph = {
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
          data: data,
          axisLabel: {
            show: true,
            rotate: 60,
          },
          axisTick: { show: false },
        },
        series: [
          {
            type: 'bar',
            data: assetValues, // costs
            itemStyle: {
              borderRadius: [4, 4, 0, 0],
              color: this.gs.getGraphBarColor(),
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
            data: branchValues, // costs
            itemStyle: {
              borderRadius: [4, 4, 0, 0],
              color: this.gs.getGraphBarTerColor(),
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
            data: fleetValues, // costs
            itemStyle: {
              borderRadius: [4, 4, 0, 0],
              color: this.gs.getGraphBarSecColor(),
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
