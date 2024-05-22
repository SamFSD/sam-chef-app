import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { GlobalService } from 'src/app/core/services/global.service';
interface monthlyCostPerCat {
  month: string;
  purchase_category: string;
  total_cost: number;
}
@Component({
  selector: 'app-fuel-spend-per-month-graph',
  templateUrl: './fuel-spend-per-month-graph.component.html',
  styleUrls: ['./fuel-spend-per-month-graph.component.scss'],
})
export class FuelSpendPerMonthGraphComponent implements OnInit, OnChanges {
  @Input() fuelSpendGraph!: monthlyCostPerCat[];
  fuelspend: any;

  constructor(private gs: GlobalService) {}

  ngOnInit() {
    this.generateGraph();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['fuelSpendGraph']) {
      this.generateGraph();
    }
  }

  generateGraph() {
    const months: string[] = Array.from(
      new Set(this.fuelSpendGraph.map((item: any) => item.month))
    );
    const categories: string[] = Array.from(
      new Set(this.fuelSpendGraph.map((item: any) => item.purchase_category))
    );

    this.fuelspend = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          let tooltip = params[0].axisValue + '<br/>';

          params.forEach((item: any) => {
            const formattedValue = this.gs.toZAR(item.value);
            tooltip +=
              item.marker + item.seriesName + ': ' + formattedValue + '<br/>';
          });

          return tooltip;
        },
      },
      legend: {
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
        },
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        left: 'right',
        top: 'center',
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar', 'stack'] },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      xAxis: [
        {
          type: 'category',
          axisTick: { show: false },
          data: months,
        },
      ],
      yAxis: [
        {
          type: 'value',
        },
      ],
      series: categories.map((category: string) => ({
        name: category,
        type: 'bar',
        barWidth: '20%',
        barGap: 0,
        emphasis: {
          focus: 'series',
        },
        data: months.map((month: string) => {
          const item = this.fuelSpendGraph.find(
            (data: any) =>
              data.month === month && data.purchase_category === category
          );
          return item ? item.total_cost : 0;
        }),
      })),
    };
  }
}
