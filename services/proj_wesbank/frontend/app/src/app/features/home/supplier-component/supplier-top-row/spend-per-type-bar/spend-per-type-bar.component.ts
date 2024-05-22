import { Component } from '@angular/core';
import { SmallFormService } from '../../../small-form-component/small-form.service';
import { SuppliersService } from 'src/app/core/api/api_service';
import { Subject, take, takeUntil } from 'rxjs';
import { GlobalService } from 'src/app/core/services/global.service';
import { smallForm } from '../../../small-form-component/small-form-interface';

@Component({
  selector: 'app-spend-per-type-bar',
  templateUrl: './spend-per-type-bar.component.html',
  styleUrls: ['./spend-per-type-bar.component.scss'],
})
export class SpendPerTypeBarComponent {
  isLoading: boolean = true;
  private readonly onDestroy = new Subject<void>();

  chartOption: any;
  graphData: any;
  constructor(
    private smallForm: SmallFormService,
    private api: SuppliersService,
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
    this.api
      .sho002GetSupplierCostsAndCountsForBarGraphV0Sho002GetSupplierCostsAndCountsForBarGraphPost(
        form
      )
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.graphData = res;
          this.isLoading = false;
          this.generateGraph();
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
        complete() {},
      });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  generateGraph() {
    this.chartOption = {
      textStyle: {
        fontFamily: 'Roboto',
      },

      label: {
        show: true,
        align: 'left',
        verticalAlign: 'middle',
        position: 'insideBottom',
        rotate: 90,
        color: 'black',
        fontWeight: 'bold',
        formatter: '{b}',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          let tooltip = params[0].axisValue + '<br/>';
        
          params.forEach((item: any) => {
            let formattedValue = item.value;
            if (item.seriesName === 'Cost') {
              formattedValue = this.gs.toZAR(item.value);
            }
            tooltip += item.marker + item.seriesName + ': ' + formattedValue + '<br/>';
          });
        
          return tooltip;
        },
      },
      legend: {
        data: ['Cost', 'Count'],
      },
      xAxis: {
        data: this.graphData.map((item: any) => item.veh_type_map),
        axisLabel: {
          // Enable axis labels for x-axis
          show: false,
        },
      },
      yAxis: [
        {
          name: 'Costs',
          type: 'value',
          splitLine: {
            show: false,
          },
        },
        {
          name: 'Counts',
          type: 'value',
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: 'Cost',
          type: 'bar',
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: this.gs.getGraphBarColor(),
          },
          splitLine: {
            show: false,
          },
          data: this.graphData.map((item: any) => item.cost),
          yAxisIndex: 0,
          // label: {
          //   show: true,
          //   align: 'left',
          //   verticalAlign: 'middle',
          //   position: 'insideBottom',
          //   rotate: 90,
          //   fontWeight: 'bold',
          // },
        },
        {
          name: 'Count',
          type: 'bar',
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: this.gs.getGraphBarSecColor(),
          },
          splitLine: {
            show: false,
          },
          data: this.graphData.map((item: any) => item.count),
          yAxisIndex: 1,
        },
      ],
      animationDuration: 10000,
      animationEasing: 'elasticOut',
    };
  }
}
