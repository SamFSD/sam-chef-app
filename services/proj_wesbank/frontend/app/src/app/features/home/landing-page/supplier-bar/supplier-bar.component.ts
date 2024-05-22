import { Component, Input, SimpleChanges } from '@angular/core';

import { FormGroup } from '@angular/forms';
import { ChartsService } from 'src/app/core/services/charts.service';
import { GlobalService } from 'src/app/core/services/global.service';

@Component({
  selector: 'app-supplier-bar',
  templateUrl: './supplier-bar.component.html',
  styleUrls: ['./supplier-bar.component.scss'],
})
export class SupplierBarComponent {
  @Input() supplierBarData: any;
  isLoading: boolean = true;
  graphData!: any;
  graphY!: any;
  graphX!: any;
  graphTitle: string = 'Top 10 Supplier Spend';
  spendPerSuppBar: any;
  formValues: any;
  formGroup!: FormGroup;
  divisions!: [{ label: string; division: string }];
  vehTypes: { veh_type_map: string; unit_count: number }[] = [
    { veh_type_map: '', unit_count: 0 },
  ];

  constructor(private charts: ChartsService, private gs: GlobalService) {}

  ngOnInit() {
    if (this.supplierBarData) {
      this.generateGraph();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['supplierBarData']) {
      this.generateGraph();
    }
  }

  generateGraph() {
    this.isLoading = true;
    const spendPerSupplier = this.supplierBarData;

    if (spendPerSupplier.length === 0) {
      this.graphTitle = 'No data for selected filters';
      this.graphData = [{ serviceprovider: 'No data', costs: 0 }];
    } else {
      this.graphTitle = 'Top 10 Expenditures By Supplier';
    }

    this.graphData = spendPerSupplier;
    this.graphX = spendPerSupplier.map((item: any) => item.costs);
    this.graphY = spendPerSupplier.map((item: any) => item.serviceprovider);

    const thisY = this.graphY.slice(-10);
    const thisX = this.graphX.slice(-10);

    this.spendPerSuppBar = {
      title: {
        text: this.graphTitle,
        left: 'center',
      },
      toolbox: this.charts.getChartToolbox(),
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
        data: thisY,
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
          data: thisX,
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
              const label = thisY[params.dataIndex];
              const maxLength = 25;
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
      animationDuration: 1000,
      animationEasing: 'elasticOut',
    };

    // Simulate loading delay
    setTimeout(() => {
      this.isLoading = false;
    }, 1000); // Adjust timeout as needed
  }
}
