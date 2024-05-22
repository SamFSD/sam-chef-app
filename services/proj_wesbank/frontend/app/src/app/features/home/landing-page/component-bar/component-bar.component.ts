import { Component, Input, SimpleChanges } from '@angular/core';
import { ChartsService } from 'src/app/core/services/charts.service';
import { GlobalService } from 'src/app/core/services/global.service';

@Component({
  selector: 'app-component-bar',
  templateUrl: './component-bar.component.html',
  styleUrls: ['./component-bar.component.scss'],
})
export class ComponentBarComponent {
  @Input() componentBarData: any;
  isLoading: boolean = true;
  graphData: any;
  graphTitle: string = 'Top 10 Component Spend';
  spendPerCompBar: any;
  graphX!: any;
  graphY!: any;

  constructor(private gs: GlobalService, private charts: ChartsService) {}

  ngOnInit() {
    if (this.spendPerCompBar) {
      this.generateSpendPerCompBar();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['componentBarData']) {
      this.generateSpendPerCompBar();
    }
  }

  generateSpendPerCompBar() {
    if (this.componentBarData.length === 0) {
      this.graphTitle = 'No data for selected filters';
      this.graphData = [{ mapping: 'No data', cost: 0 }];
    } else {
      this.generateGraph(); // Call the method to update the graph data after fetching API response
    }

    (error: any) => {
      this.isLoading = false;
      this.graphTitle = 'No data for selected filters';
      this.graphData = [{ mapping: 'No data', cost: 0 }];
    };
  }

  generateGraph() {
    this.isLoading = true;
    this.graphTitle = 'Top 10 Expenditures By Component';
    this.graphY = this.componentBarData.map((item: any) => item.mapping);
    this.graphX = this.componentBarData.map((item: any) => item.cost);
    const graphY = this.graphY.slice(-10);

    const graphX = this.graphX.slice(-10);

    this.spendPerCompBar = {
      title: {
        text: this.graphTitle,
        left: 'center',
      },
      textStyle: {
        fontFamily: 'Roboto',
      },
      toolbox: this.charts.getChartToolbox(),
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
        data: graphY,
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
                var formattedValue = (value / 10000).toFixed(0) + 'k';
                return 'R' + formattedValue;
              }
            }
            return value;
          },
        },
      },
      series: [
        {
          data: graphX,
          type: 'bar',
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
              const label = graphY[params.dataIndex];
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
    this.isLoading = false;
  }
}
