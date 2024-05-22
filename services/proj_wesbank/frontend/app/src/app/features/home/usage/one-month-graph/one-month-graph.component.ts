import { Component } from '@angular/core';
import { UsageService } from 'src/app/core/api/api_service';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GlobalService } from 'src/app/core/services/global.service';
import { Subject, takeUntil } from 'rxjs';
import { smallForm } from '../../small-form-component/small-form-interface';

@Component({
  selector: 'app-one-month-graph',
  templateUrl: './one-month-graph.component.html',
  styleUrls: ['./one-month-graph.component.scss'],
})
export class OneMonthGraphComponent {
  private readonly onDestroy = new Subject<void>();

  apiSub: any;
  totalCosts: any;
  avgCosts: any;
  totalDistance: any;
  avgDist: any;
  graphData: any;
  graphOptions: any;
  apiCall: any;
  assetCount: any;
  graphTitle: string = 'Selected Month - Daily';
  //spinner status
  isLoading: boolean = true;
  constructor(
    private api: UsageService,
    private gs: GlobalService,
    private smallFormService: SmallFormService,
    private router: Router
  ) {}

  ngOnInit() {
    //get form values on init
    this.smallFormService.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.callApi(this.smallFormService.getFormValues());
        }
      });
  }

  callApi(form: smallForm) {
    this.isLoading = true;

    this.api
      .sho002GetOneMonthCpkUsageGraphV0Sho002GetOneMonthCpkUsageGraphPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res) => {
          this.graphData = res.chart_data;
          this.totalCosts = this.gs.toZAR(res.total_cost);
          this.avgCosts = this.gs.toZAR(res.avg_cost);
          this.totalDistance = this.gs.toKM(res.total_distance);
          this.avgDist = this.gs.toKM(res.avg_distance);
          this.assetCount = res.asset_count;
          //TODO
          this.generateGraph();
          this.isLoading = false;
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
        complete: () => {},
      });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  generateGraph() {
    const distances = this.graphData.map((item: any) => item.distance);
    const costs = this.graphData.map((item: any) => item.costs);
    const cpk = this.graphData.map((item: any) => item.cpk * 100);
    const dates = this.graphData.map((item: any) => item.date);
    this.graphOptions = {
      textStyle: {
        fontFamily: 'Roboto',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          let tooltip = params[0].axisValue + '<br/>';

          params.forEach((item: any) => {
            if (item.seriesName === 'Distance') {
              const formattedValue = this.gs.toKM(item.value);
              tooltip +=
                item.marker + item.seriesName + ': ' + formattedValue + '<br/>';
            } else if (item.seriesName === 'Cost') {
              const formattedValue = this.gs.toZAR(item.value);
              tooltip +=
                item.marker + item.seriesName + ': ' + formattedValue + '<br/>';
            } else if (item.seriesName === 'CPK') {
              const formattedValue = item.value;
              tooltip +=
                item.marker + item.seriesName + ': ' + formattedValue + '<br/>';
            }
          });

          return tooltip;
        },
      },
      grid: {
        left: 1,
        right: 1,
        top: 1,
        bottom: 1,
      },
      // title: {
      //   text: this.graphTitle,
      //   left: 'center',
      // },
      legend: {
        // data: ['Distance', 'Cost', 'CPK'],
        show: false,
      },
      xAxis: {
        type: 'category',
        data: dates,
        show: false,
      },
      yAxis: [
        {
          type: 'value',
          axisLine: {
            show: false, // Hide y-axis line
          },
          axisTick: {
            show: false, // Hide y-axis ticks
          },
          axisLabel: {
            show: false, // Hide y-axis labels
          },
        },
        {
          type: 'value', // Secondary y-axis for the line series
          splitLine: {
            show: false, // Hide grid lines for the secondary y-axis
          },
          axisLabel: {
            show: false, // Show labels for the secondary y-axis
          },
        },
      ],
      series: [
        {
          name: 'Distance',
          type: 'bar',
          data: distances,
          yAxisIndex: 0,
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: this.gs.getGraphBarColor(),
          },
        },
        {
          name: 'Cost',
          type: 'bar',
          data: costs,
          yAxisIndex: 0,
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: this.gs.getGraphBarSecColor(),
          },
        },
        {
          name: 'CPK',
          type: 'line',
          data: cpk,
          yAxisIndex: 1,
          color: '#3c474e',
        },
      ],
      animationDuration: 10000,
      animationEasing: 'elasticOut',
    };
  }
}
