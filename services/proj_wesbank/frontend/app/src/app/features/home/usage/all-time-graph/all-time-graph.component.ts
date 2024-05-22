import { Component, Input, SimpleChanges } from '@angular/core';
import { GlobalService } from 'src/app/core/services/global.service';

@Component({
  selector: 'app-all-time-graph',
  templateUrl: './all-time-graph.component.html',
  styleUrls: ['./all-time-graph.component.scss'],
})
export class AllTimeGraphComponent {
  @Input() allTimeGraphData: any;

  graphOptions: any;
  apiSub: any;
  isLoading: boolean = true;

  constructor(private gs: GlobalService) {}

  ngOnInit() {
    if (this.allTimeGraphData) {
      this.generateGraph();
    }
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allTimeGraphData']) {
      this.generateGraph();
    }
  }

  generateGraph() {
    this.isLoading = true;
    const distances = this.allTimeGraphData.map((item: any) => item.distance);
    const costs = this.allTimeGraphData.map((item: any) => item.costs);
    const cpk = this.allTimeGraphData.map((item: any) => item.cpk * 100);
    const dates = this.allTimeGraphData.map((item: any) => {
      const date = new Date(item.date_trunc);
      const monthYearString = date.toLocaleString('en-US', {
        month: 'short',
        year: '2-digit',
      });
      return monthYearString;
    });
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

      legend: {
        show: false,
      },
      xAxis: {
        type: 'category',
        data: dates,
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
    this.isLoading = false;
  }
}
