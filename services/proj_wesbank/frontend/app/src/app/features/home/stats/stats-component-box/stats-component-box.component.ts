import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { StatsPageService } from 'src/app/core/api/api_service';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { smallForm } from '../../small-form-component/small-form-interface';

@Component({
  selector: 'app-stats-component-box',
  templateUrl: './stats-component-box.component.html',
  styleUrls: ['./stats-component-box.component.scss'],
})
export class StatsComponentBoxComponent {
  constructor(
    private api: StatsPageService,
    private smallForm: SmallFormService,
    private gs: GlobalService
  ) {}
  private readonly onDestroy = new Subject<void>();
  isLoading: boolean = true;
  componentBoxPlot: any;
  componentStats: any;

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
      .componentBoxplotV0ComponentBoxplotPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.componentStats = response;
          this.generateBoxPlot();
        },
      });
  }

  generateBoxPlot() {
    this.componentBoxPlot = {
      tooltip: {
        trigger: 'axis',
        confine: true,
        formatter: (params: any) => {
          const data = params[0].data;
          const toZAR = (value: any) => this.gs.toZAR(value);

          const tooltipContent = `
            <div style="text-align: left;">
              <strong>${data.name}</strong><br>
              Minimum: ${toZAR(data.min)}<br>
              Q1: ${toZAR(data.Q1)}<br>
              Median: ${toZAR(data.median)}<br>
              Q3: ${toZAR(data.Q3)}<br>
              Maximum: ${toZAR(data.max)}
            </div>
          `;
          return tooltipContent;
        },
      },
      xAxis: {
        name: 'Expenditure',
        nameLocation: 'middle',
        nameGap: 30,
        scale: true,
      },
      yAxis: {
        type: 'category',
      },
      grid: {
        bottom: 100,
      },

      dataZoom: [
        {
          type: 'slider',
          height: 20,
        },
      ],
      series: [
        {
          name: 'boxplot',
          type: 'boxplot',
          datasetId: 'componentAggregate',
          itemStyle: {
            color: '#b8c5f2',
          },
          encode: {
            x: ['min', 'Q1', 'median', 'Q3', 'max'],
            y: 'component',
            itemName: ['name'],
            tooltip: ['min', 'Q1', 'median', 'Q3', 'max'],
          },
        },
      ],
      dataset: [
        {
          id: 'componentAggregate',
          source: this.componentStats,
        },
      ],
    };
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}
