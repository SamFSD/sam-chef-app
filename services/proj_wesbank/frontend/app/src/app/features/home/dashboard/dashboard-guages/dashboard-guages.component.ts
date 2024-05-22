import { Component, Input } from '@angular/core';
import {
  ApexChart,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexTitleSubtitle
} from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { DashboardService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { smallForm } from '../../small-form-component/small-form-interface';


@Component({
  selector: 'app-dashboard-guages',
  templateUrl: './dashboard-guages.component.html',
  styleUrls: ['./dashboard-guages.component.scss'],
})
export class DashboardGuagesComponent {
  @Input() dashboardGraphData: any

  costYTDSub: any;
  costPriorSub: any;
  distYTDSub: any;
  distPriorSub: any;
  distVsFTYD: any = [];
  distVsPrior: any = [];
  costVsFYTD: any = [];
  costVsPrior: any = [];
  distVsFTYDSeries: ApexNonAxisChartSeries = [];
  distVsPriorSeries: ApexNonAxisChartSeries = [];
  costVsFYTDSeries: ApexNonAxisChartSeries = [];
  costVsPriorSeries: ApexNonAxisChartSeries = [];

  currentMonth!: string;
  currentYear?: number;
  previousYear?: number;
  veryPreviousYear?: number;

  chartDetails: ApexChart = {
    type: 'radialBar',
    fontFamily: 'FSAlbert Light, FSAlbert Light, FSAlbert Light',
    height: '500px',
  };
  colors = ['#69d2dc', '#39A750', '#E79920'];

  FYTDLabels: string[] = [];
  priorLabels: string[] = [];
  distFYTDTitle: ApexTitleSubtitle = {
    text: 'Mileage:\nCurrent Month VS Average (Financial Year To Date)',
    align: 'center',
    style: {
      fontSize: '18px',
    },
  };
  distPriorTitle: ApexTitleSubtitle = {
    text: 'Mileage:\nCurrent Month VS Previous Years',
    align: 'center',
    style: {
      fontSize: '18px',
    },
  };
  costFYTDTitle: ApexTitleSubtitle = {
    text: 'Expenditure:\nCurrent Month VS Average (Financial Year To Date)',
    align: 'center',
    style: {
      fontSize: '18px',
    },
  };
  costPriorTitle: ApexTitleSubtitle = {
    text: 'Expenditure:\nCurrent Month VS Previous Years',
    align: 'center',
    style: {
      fontSize: '18px',
    },
  };

  plotOptions: ApexPlotOptions = {
    radialBar: {
      offsetY: 0,
      startAngle: -100,
      endAngle: 100,
      track: {
        background: '#e7e7e7',
        strokeWidth: '95%',
        margin: 5,
        dropShadow: {
          enabled: true,
        },
      },
      // hollow: {
      //   margin: 5,
      //   size: "30%",
      //   background: "transparent",
      //   image: undefined
      // },
    },
  };
  legend: ApexLegend = {
    show: true,
    floating: true,
    fontSize: '16px',
    position: 'bottom',
    offsetX: 0,
    offsetY: 0,
    labels: {
      useSeriesColors: true,
    },
  };

  private readonly onDestroy = new Subject<void>();

  constructor(
    private api: DashboardService,
    private smallForm: SmallFormService,
    private gs: GlobalService
  ) {}

  ngOnInit(): void {
    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.callApi(this.smallForm.getFormValues());
        }
      });
  }
  callApi(smallForm: smallForm) {
    this.FYTDLabels = [];
    this.priorLabels = [];
    this.api
      .getMonthDistVsFytdV0GetMonthDistVsFytdPost(smallForm)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res) => {
          this.costVsFYTD = Object.values(res[0]);
          this.costVsFYTDSeries = this.calculatePercentages(this.costVsFYTD);
        },
        error: (err) => {
          this.gs.raiseError(err);
        },
      });

    this.api
      .getHistoricCostPerMonthV0GetHistoricCostPerMonthPost(smallForm)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.costVsPrior = Object.values(res[0]);
          this.costVsPriorSeries = this.calculatePercentages(this.costVsPrior);
        },
        error: (err) => {
          this.gs.raiseError(err);
        },
      });

    this.api
      .getMonthDistVsFytdV0GetMonthDistVsFytdPost(smallForm)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.distVsFTYD = Object.values(res[0]);
          this.distVsFTYDSeries = this.calculatePercentages(this.distVsFTYD);
        },
        error: (err) => {
          this.gs.raiseError(err);
        },
      });

    this.api
      .getHistoricKmPerMonthV0GetHistoricKmPerMonthPost(smallForm)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.distVsPrior = Object.values(res[0]);
          this.distVsPriorSeries = this.calculatePercentages(this.distVsPrior);
          this.formatCurrentDate(smallForm.month);

          this.FYTDLabels.push(
            this.currentMonth + ' ' + this.currentYear?.toString()
          );
          this.FYTDLabels.push('Average');
          this.priorLabels.push(
            this.currentMonth + ' ' + this.currentYear?.toString()
          );
          this.priorLabels.push(
            this.currentMonth + ' ' + this.previousYear?.toString()
          );
          this.priorLabels.push(
            this.currentMonth + ' ' + this.veryPreviousYear?.toString()
          );
        },
        error: (error) => {
          this.gs.raiseError(error);
        },
      });
  }
  calculatePercentages(numbers: number[]): number[] {
    if (numbers.length === 0) {
      throw new Error('Input list is empty');
    }

    // Find the highest value in the list
    const highestValue = Math.max(...numbers);

    // Calculate percentages
    const percentages = numbers.map((num) =>
      Number(((num / highestValue) * 100).toFixed(2))
    );

    return percentages;
  }
  formatCurrentDate(date: any) {
    const originalDate = new Date(date);
    this.currentYear = originalDate.getFullYear();
    this.currentMonth = originalDate.toLocaleString('en-ZA', {
      month: 'short',
    });
    this.previousYear = this.currentYear - 1;
    this.veryPreviousYear = this.currentYear - 2;
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}
