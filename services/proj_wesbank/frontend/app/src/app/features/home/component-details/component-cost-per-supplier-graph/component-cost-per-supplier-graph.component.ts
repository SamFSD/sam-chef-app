import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ComponentsService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { smallForm } from '../../small-form-component/small-form-interface';

@Component({
  selector: 'app-component-cost-per-supplier-graph',
  templateUrl: './component-cost-per-supplier-graph.component.html',
  styleUrls: ['./component-cost-per-supplier-graph.component.scss'],
})
export class ComponentCostPerSupplierGraphComponent {
  supplierBarGraph: any; // supplier bar graph
  barGraphData: any;
  isLoading: boolean = true;
  apiSub: any;
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
    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }
    this.apiSub = this.apiServices
      .sho002GetTotalSpendPerSupplierV0sho002GetTotalSpendPerSupplierPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (response: any) => {
          this.barGraphData = response;
          this.isLoading = false;
          this.generateSupplierGraph();
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

  generateSupplierGraph() {
    const data = this.barGraphData
      .map((supItem: any) => supItem.serviceprovider)
      .splice(-10);
    const values = this.barGraphData
      .map((supItem: any) => supItem.costs)
      .splice(-10);
    this.supplierBarGraph = {
      title: {
        text: 'Top 10 Expenditure Per Supplier',
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
      yAxis: {
        type: 'value',

        // boundaryGap: [0, 0.01],
      },
      xAxis: {
        type: 'category',
        data: data,
        axisLabel: {
          show: false,
        },
        axisTick: { show: false },
      },
      series: [
        {
          type: 'bar',
          data: values, // costs
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
}
