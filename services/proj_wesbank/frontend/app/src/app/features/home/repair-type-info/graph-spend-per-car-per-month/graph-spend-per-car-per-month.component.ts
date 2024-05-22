import { Component, Input } from '@angular/core';
import { GlobalService } from 'src/app/core/services/global.service';

@Component({
  selector: 'app-graph-spend-per-car-per-month',
  templateUrl: './graph-spend-per-car-per-month.component.html',
  styleUrls: ['./graph-spend-per-car-per-month.component.scss'],
})
export class GraphSpendPerCarPerMonthComponent {
  @Input() repairTypeAndCounts: any;
  option!: any;
  
  constructor(private gs: GlobalService) {}

  ngOnInit(): void {
    this.generateGraph();
  }

  generateGraph() {
    const repairTypes: string[] = Array.from(
      new Set(this.repairTypeAndCounts.map((item: any) => item.repair_types))
    );

    const months: string[] = Array.from(
      new Set(this.repairTypeAndCounts.map((item: any) => item.month))
    );

    this.option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          let tooltip = params[0].axisValue + '<br/>';
    
          params.forEach((item: any) => {
            const formattedValue = this.gs.toZAR(item.value);
            tooltip += item.marker + item.seriesName + ': ' + formattedValue + '<br/>';
          });
    
          return tooltip;
        },
      },
      legend: {
        data: repairTypes,
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
      series: repairTypes.map((repairType: string) => ({
        name: repairType,
        type: 'bar',
        barWidth: '20%',
        barGap: 0,
        emphasis: {
          focus: 'series',
        },
        data: this.repairTypeAndCounts
          .filter((item: any) => item.repair_types === repairType)
          .map((item: any) => item.repair_counts),
      })),
    };
  }
}
