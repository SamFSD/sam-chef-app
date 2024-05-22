import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ComponentsService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { smallForm } from '../../small-form-component/small-form-interface';

@Component({
  selector: 'app-component-cost-per-veh-type-graph',
  templateUrl: './component-cost-per-veh-type-graph.component.html',
  styleUrls: ['./component-cost-per-veh-type-graph.component.scss'],
})
export class ComponentCostPerVehTypeGraphComponent {
  graphData: any;
  vehTypeBarGraph: any; // veh type bar graph
  isLoading: boolean = true;
  apiSub: any;
  barChange: boolean = false;
  private readonly onDestroy = new Subject<void>();

  constructor(
    private smallForm: SmallFormService,
    private apiServices: ComponentsService,
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
    this.isLoading = true;
    this.apiServices
      .sho002GetTotalSpendPerVehTypeV0sho002GetTotalSpendVehTypePost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.graphData = res; // spend per veh type( working  )
          this.isLoading = false;
          this.generateBarGraph();
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
      });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  generateBarGraph() {
    const data = this.graphData.map((item: any) => item.veh_type_map);
    const values = this.graphData.map((item: any) => item.costs);
    this.vehTypeBarGraph = {
      title: {
        text: 'Top 10 Expenditure Per Vehicle Type',
        left: 'center',
      },
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
            const formattedValue = this.gs.toZAR(item.value);
            tooltip += item.marker + formattedValue + '<br/>';
          });

          return tooltip;
        },
      },
      xAxis: {
        type: 'category',
        data: data,
        axisLabel: {
          show: false,
        },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          rotate: 45,
          formatter: function (value: number) {
            if (typeof value === 'number') {
              if (value >= 1000) {
                var formattedValue = (value / 1000).toFixed(0) + 'k'; // Convert to '50k' format
                return 'R' + formattedValue;
              }
            }
            return value;
          },
        },
      },
      series: [
        {
          type: 'bar',
          data: values,
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: this.gs.getGraphBarColor(),
          },
          label: {
            show: true,
            align: 'left',
            verticalAlign: 'middle',
            position: 'insideBottom',
            rotate: 90,
            color: 'black',
            fontWeight: 'bold',
            formatter: function (params: any) {
              // Use the names of x-axis variables as labels
              const label = data[params.dataIndex];
              const maxLength = 20;
              if (label.length > maxLength) {
                return label.substring(0, maxLength - 3) + '...';
              } else {
                return label.padEnd(maxLength, ' ');
              }
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

  onChartEvent(event: any, type: string) {
    if (!this.barChange) {
      if (event && event.name) {
        // Update form veh type value with the clicked item's name
        this.smallForm.updateTypeValue.next([event.name]);
        //updates the small form and submit to update the component values
        this.smallForm.submitSmallForm.next(true);
      }
    }
  }
}
