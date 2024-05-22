import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { DashboardService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { smallForm } from '../../small-form-component/small-form-interface';
import { ChartsService } from 'src/app/core/services/charts.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-dashboard-graphs',
  templateUrl: './dashboard-graphs.component.html',
  styleUrls: ['./dashboard-graphs.component.scss'],
})
export class DashboardGraphsComponent {
  constructor(
    private api: DashboardService,
    private smallForm: SmallFormService,
    private gs: GlobalService,
    private charts: ChartsService
  ) {}
  private readonly onDestroy = new Subject<void>();

  isFYTD: boolean = true;

  isCSMGraphLoading: boolean = true;
  isFuelCardGraphLoading: boolean = true;

  months!: any;
  monthsFYTD!: any;
  monthsCurr!: any;
  fcMonths!: any;
  fcMonthsFYTD!: any;
  fcMonthsCurr!: any;
  costFYTD: any;
  costCurr: any;
  savingsFYTD: any;
  savingsCurr: any;
  mileageFYTD: any;
  mileageCurr: any;
  fuelFYTD: any;
  fuelCurr: any;
  tollFYTD: any;
  tollCurr: any;
  costData: any;
  savingsData: any;
  mileageData: any;
  fuelData: any;
  tollData: any;
  costGraph: any;
  savingsGraph: any;
  mileageGraph: any;
  fuelCardGraph: any;

  ngOnInit() {
    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        this.isCSMGraphLoading = true;
        this.isFuelCardGraphLoading = true;

        if (loaded) {
          const form = this.smallForm.getFormValues();
          this.callApi(form);
          this.callFuelCardApi(form);
        }
      });
  }

  callFuelCardApi(form: any) {
    this.api
      .getFleetCardCostsV0GetFleetCardCostsPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.fcMonthsFYTD = res.fytd.map((data: any) => data.julian_month);
          this.fuelFYTD = res.fytd.map((data: any) => data.fuel_cost);
          this.tollFYTD = res.fytd.map((data: any) => data.toll_cost);
          this.fcMonthsCurr = res.current.map((data: any) => data.julian_month);
          this.fuelCurr = res.current.map((data: any) => data.fuel_cost);
          this.tollCurr = res.current.map((data: any) => data.toll_cost);
          if (this.isFYTD) {
            this.fcMonths = this.fcMonthsFYTD;
            this.fuelData = this.fuelFYTD;
            this.tollData = this.tollFYTD;
          } else {
            this.fcMonths = this.fcMonthsCurr;
            this.fuelData = this.fuelCurr;
            this.tollData = this.tollCurr;
          }
          this.generateFuelCardGraph();
          this.isFuelCardGraphLoading = false;
        },
        error: (err) => {
          this.gs.raiseError(err);
        },
      });
  }

  callApi(form: smallForm) {
    this.api
      .getDashCostSavingsMileageV0GetDashCostSavingsMileagePost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.monthsFYTD = res.fytd.map((data: any) => data.julian_month);
          this.costFYTD = res.fytd.map((data: any) => data.amount);
          this.savingsFYTD = res.fytd.map((data: any) => data.savings);
          this.mileageFYTD = res.fytd.map((data: any) => data.mileage);
          this.monthsCurr = res.current.map((data: any) => data.julian_month);
          this.costCurr = res.current.map((data: any) => data.amount);
          this.savingsCurr = res.current.map((data: any) => data.savings);
          this.mileageCurr = res.current.map((data: any) => data.mileage);
          if (this.isFYTD) {
            this.months = this.monthsFYTD;
            this.costData = this.costFYTD;
            this.savingsData = this.savingsFYTD;
            this.mileageData = this.mileageFYTD;
          } else {
            this.months = this.monthsCurr;
            this.costData = this.costCurr;
            this.savingsData = this.savingsCurr;
            this.mileageData = this.mileageCurr;
          }
          this.generateCostGraph();
          this.generateSavingsGraph();
          this.generateMileageGraph();
          this.isCSMGraphLoading = false;
        },
        error: (err) => {
          this.gs.raiseError(err);
        },
      });
  }

  generateCostGraph() {
    this.costGraph = {
      title: {
        text: 'Cost',
        left: 'center',
        padding: [25, 0, 0, 0], // [top, right, bottom, left] padding in pixels
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
        axisLabel: {
          interval: 0,
          rotate: 45,
          containLabel: true,
        },
        data: this.months,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => {
            if (value >= 1000000) {
              return value / 1000000 + 'm';
            }
            if (value >= 1000) {
              return value / 1000 + 'k';
            }
            return value;
          },
        },
      },
      series: [
        {
          data: this.costData,
          type: 'bar',
          // color: '#69d2dc',
          color: this.gs.getGraphBarColor(),
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
          },
          markLine: this.generateMarkLine(this.costData),
        },
      ],
      animationDuration: 1000,
      animationEasing: 'elasticOut',
    };
  }

  generateSavingsGraph() {
    this.savingsGraph = {
      title: {
        text: 'Savings',
        left: 'center',
        padding: [25, 0, 0, 0], // [top, right, bottom, left] padding in pixels
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
      // grid: {
      //   top: '60%', // Adjust this value as needed for padding
      // },
      xAxis: {
        type: 'category',
        axisLabel: {
          interval: 0,
          rotate: 45,
          containLabel: true,
        },
        data: this.months,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => {
            if (value >= 1000000) {
              return value / 1000000 + 'm';
            }
            if (value >= 1000) {
              return value / 1000 + 'k';
            }
            return value;
          },
        },
      },
      series: [
        {
          data: this.savingsData,
          type: 'bar',
          color: this.gs.getGraphBarColor(),
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
          },
          markLine: this.generateMarkLine(this.savingsData),
        },
      ],
      animationDuration: 1000,
      animationEasing: 'elasticOut',
    };
  }

  generateMileageGraph() {
    this.mileageGraph = {
      title: {
        text: 'Mileage',
        left: 'center',
        padding: [25, 0, 0, 0], // [top, right, bottom, left] padding in pixels
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
            const formattedValue = this.gs.toKM(item.value);
            tooltip += item.marker + formattedValue + '<br/>';
          });

          return tooltip;
        },
      },
      // grid: {
      //   top: '60%', // Adjust this value as needed for padding
      // },
      xAxis: {
        type: 'category',
        axisLabel: {
          interval: 0,
          rotate: 45,
          containLabel: true,
        },
        data: this.months,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => {
            if (value >= 1000000) {
              return value / 1000000 + 'm';
            }
            if (value >= 1000) {
              return value / 1000 + 'k';
            }
            return value;
          },
        },
      },
      series: [
        {
          data: this.mileageData,
          type: 'bar',
          color: this.gs.getGraphBarColor(),
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
          },
          markLine: this.generateMarkLine(this.mileageData),
        },
      ],
      animationDuration: 1000,
      animationEasing: 'elasticOut',
    };
  }

  generateFuelCardGraph() {
    this.fuelCardGraph = {
      title: {
        text: 'Fuel Card Transactions',
        left: 'center',
        padding: [25, 0, 0, 0], // [top, right, bottom, left] padding in pixels
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
          const xAxisIndex = params[0].dataIndex;
          let tooltip = params[0].axisValue + '<br/>';
          params.forEach((item: any) => {
            if (item.seriesIndex === 0) {
              tooltip +=
                item.marker + 'Fuel: ' + this.gs.toZAR(item.value) + '<br/>';
            } else {
              tooltip +=
                item.marker + 'Tolls: ' + this.gs.toZAR(item.value) + '<br/>';
            }
          });
          return tooltip;
        },
      },
      xAxis: {
        type: 'category',
        axisLabel: {
          interval: 0,
          rotate: 45,
          containLabel: true,
        },
        data: this.fcMonths,
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => {
            if (value >= 1000000) {
              return value / 1000000 + 'm';
            }
            if (value >= 1000) {
              return value / 1000 + 'k';
            }
            return value;
          },
        },
      },
      series: [
        {
          data: this.fuelData,
          type: 'bar',
          color: this.gs.getGraphBarColor(),
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
          },
        },
        {
          data: this.tollData,
          type: 'bar',
          color: this.gs.getGraphBarSecColor(),
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
      animationDuration: 1000,
      animationEasing: 'elasticOut',
    };
  }

  onSlideToggleChange(event: MatSlideToggleChange) {
    // this.showExternalOrders = event.checked;
    this.isFYTD = !this.isFYTD;
    if (event.checked) {
      this.months = this.monthsCurr;
      this.fcMonths = this.fcMonthsCurr;
      this.costData = this.costCurr;
      this.fuelData = this.fuelCurr;
      this.tollData = this.tollCurr;
      this.mileageData = this.mileageCurr;
      this.savingsData = this.savingsCurr;

      this.redrawGraphs();
    } else {
      this.months = this.monthsFYTD;
      this.fcMonths = this.fcMonthsFYTD;
      this.costData = this.costFYTD;
      this.fuelData = this.fuelFYTD;
      this.tollData = this.tollFYTD;
      this.mileageData = this.mileageFYTD;
      this.savingsData = this.savingsFYTD;
      this.redrawGraphs();
    }
  }

  redrawGraphs() {
    this.generateCostGraph();
    this.generateFuelCardGraph();
    this.generateMileageGraph();
    this.generateSavingsGraph();
  }

  averageExcludingLast(arr: number[]): number | null {
    if (arr.length < 2) {
      // If the array has less than 2 elements, there is no valid average.
      return null;
    }

    // Exclude the last element from the sum
    const sum = arr.slice(0, -1).reduce((acc, val) => acc + val, 0);

    // Calculate the average
    const average = sum / (arr.length - 1);

    return average;
  }

  generateMarkLine(data: any) {
    const average = this.averageExcludingLast(data);
    if (average !== null) {
      return {
        symbol: 'none', // Remove symbols
        label: { show: false }, // Hide labels
        data: [
          {
            yAxis: average,
            lineStyle: { type: 'dashed', color: '#f39200', width: 2 },
          },
        ],
      };
    } else {
      return null; // Return null if the function returns null
    }
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}
