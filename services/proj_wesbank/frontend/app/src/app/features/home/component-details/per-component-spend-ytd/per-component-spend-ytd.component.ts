import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ComponentsService } from 'src/app/core/api/api_service';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { smallForm } from '../../small-form-component/small-form-interface';

@Component({
  selector: 'app-per-component-spend-ytd',
  templateUrl: './per-component-spend-ytd.component.html',
  styleUrls: ['./per-component-spend-ytd.component.scss'],
})
export class PerComponentSpendYtdComponent {
  isLoading: boolean = true;
  private readonly onDestroy = new Subject<void>();

  spendPerMonthGraph: any;
  spendPerMonthGraphData: any;
  graphTitle: string = 'Total Spend Per Month';
  apiSub: any;
  constructor(
    private apiServices: ComponentsService,
    private smallForm: SmallFormService,
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
    this.apiSub = this.apiServices
      .sho002SpendPerMonthPerComponentV0Sho002SpendPerMonthPerComponentGraphPost(
        form
      )
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res) => {
          this.spendPerMonthGraphData = res;
          this.generatespendPerMonth();
          this.isLoading = false;
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

  generatespendPerMonth() {
    const currentDate = new Date();
    const MonthsAgo = new Date();
    MonthsAgo.setMonth(currentDate.getMonth() - 10);
    const filteredData = this.spendPerMonthGraphData.filter((item: any) => {
      const itemDate = new Date(item.month);
      return itemDate >= MonthsAgo && itemDate <= currentDate;
    });
    this.spendPerMonthGraph = {
      title: {
        text: this.graphTitle,
        left: 'center',
        padding: [25, 0, 0, 0], // [top, right, bottom, left] padding in pixels
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
        data: filteredData.map((item: any) => {
          const date = new Date(item.month);
          const monthYearString = date.toLocaleString('en-US', {
            month: 'short',
            year: '2-digit',
          });
          return monthYearString;
        }),
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
          data: filteredData.map((item: any) => item.monthly_cost),
          type: 'bar',
          color: this.gs.getGraphBarColor(),
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
      animationDuration: 10000,
      animationEasing: 'elasticOut',
    };
  }
}
