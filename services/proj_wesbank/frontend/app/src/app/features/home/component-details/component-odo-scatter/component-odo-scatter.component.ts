import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ComponentsService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { smallForm } from '../../small-form-component/small-form-interface';

@Component({
  selector: 'app-component-odo-scatter',
  templateUrl: './component-odo-scatter.component.html',
  styleUrls: ['./component-odo-scatter.component.scss'],
})
export class ComponentOdoScatterComponent {
  isLoading: boolean = false;
  private readonly onDestroy = new Subject<void>();

  scatterPlot: any;
  scatterPlotData: any;
  apiCall: any;
  apiSub: any;
  generateScatter: boolean = false;
  mean: number = 0;
  pointColour: any;
  total: number = 0;
  currentValue: number = 0;
  deviationDist: number = 0;
  standardDeviation: number = 0;
  standardDeviationTotal: number = 0;
  standardDeviationLimit: number = 0.5;

  constructor(
    private apiServices: ComponentsService,
    private smallForm: SmallFormService,
    private router: Router,
    private gs: GlobalService
  ) {}

  ngOnInit() {
    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.callApi(this.smallForm.getFormValues());
        }
      });
  }

  callApi(form: smallForm) {
    // if selected component is all_components, do not generate scatter plot

    if (form.all_components_selected) {
      //if all components are selected do not generate scatter plot
      this.isLoading = false;
      this.generateScatter = false;
      return;
    }
    this.generateScatter = true;
    this.isLoading = true;

    this.apiCall = this.apiServices
      .sho002GetMaintenanceCostOverOdoV0Sho002GetMaintenanceCostOverOdoPost(
        form
      )
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.scatterPlotData = res;
          this.isLoading = false;
          this.calculateStandardDeviation();

          this.generateScatterPlot();
        },
        error: (err) => {
          this.gs.raiseError(err);
        },
      });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  calculateStandardDeviation() {
    //Calculates the standard deviation for the dataset
    const dataSetSize = this.scatterPlotData.length;
    for (let i = 1; i < dataSetSize; i++) {
      this.currentValue =
        this.scatterPlotData[i].amount /
        this.scatterPlotData[i].work_order_distance;
      this.total += this.currentValue;
    }

    this.mean = this.total / dataSetSize;
    for (let i = 1; i < dataSetSize; i++) {
      this.deviationDist =
        this.scatterPlotData[i].amount /
          this.scatterPlotData[i].work_order_distance -
        this.mean;
      this.deviationDist = this.deviationDist * this.deviationDist;
      this.standardDeviationTotal += this.deviationDist;
    }
    this.standardDeviation = this.standardDeviationTotal / dataSetSize;
  }

  generateScatterPlot() {
    this.scatterPlotData.sort((a: any, b: any) => a.amount - b.amount);
    // const minCost = this.scatterPlotData[0].amount;
    // const maxCost =
    //   this.scatterPlotData[this.scatterPlotData.length - 1].amount;

    this.scatterPlot = {
      dataZoom: [
        {
          type: 'slider',
          legendPosition: 'right',
          showLegend: true,
          xAxisIndex: [0],
          xAxisLabel: 'Costs',
        },
        {
          type: 'slider',
          legendPosition: 'bottom',
          showLegend: true,
          yAxisIndex: [0],
          top: '9%',
          yAxisLabel: 'Odo Reading',
          nameGap: 90,
        },
      ],

      title: {
        text: 'Repairs over Odo',
        left: 'center',
      },

      tooltip: {
        formatter: function (params: any) {
          return `Odo: ${params.value[0]} <br>
                         Costs: R ${params.value[1]} <br>
                         Vehicle Reg: ${params.value[2]} <br>
                         Make: ${params.value[3]} <br>
                         Model: ${params.value[4]} <br>
                         Service Provider: ${params.value[5]}<br>
                         Mapping: ${params.value[6]}`;
        },
      },
      yAxis: {
        name: 'Cost',
        nameLocation: 'middle',
        nameGap: 70,
      },
      xAxis: {
        name: 'Odo',
        nameLocation: 'middle',
        nameGap: 90,
      },

      series: [
        {
          symbolSize: 5,
          data: this.scatterPlotData.map((item: any) => {
            const cost = item.amount;
            const distance = item.work_order_distance;
            if (
              cost / distance - this.mean >
              this.standardDeviation * this.standardDeviationLimit
            ) {
              this.pointColour = '#cf3f27';
            } else {
              this.pointColour = '#69d2dc';
            }

            return {
              value: [
                item.work_order_distance,
                item.amount,
                item.vehiclereg,
                item.veh_make_map,
                item.veh_model_map,
                item.serviceprovider,
                item.mapping,
              ],
              itemStyle: {
                color: this.pointColour,
              },
            };
          }),

          type: 'scatter',
          emphasis: {
            focus: 'series',
            scale: true,
            scaleSize: 5,
            label: {
              show: true,
              formatter: (params: any) => {
                // this.clickedScatterGraph(params);
                return params.value;
              },
            },
          },
        },
      ],
    };
    // this.scatterPlot.on('click', (params: any) => {
    // })
  }

  clickedScatterGraph(params: any) {
    this.smallForm.patchPavReg(params.value[2]);
    this.router.navigate(['/viewasset']);
  }
}
