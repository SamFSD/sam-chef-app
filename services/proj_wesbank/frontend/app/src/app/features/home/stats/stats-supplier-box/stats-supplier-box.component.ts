import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { StatsPageService } from 'src/app/core/api/api_service';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { smallForm } from '../../small-form-component/small-form-interface';

@Component({
  selector: 'app-stats-supplier-box',
  templateUrl: './stats-supplier-box.component.html',
  styleUrls: ['./stats-supplier-box.component.scss'],
})
export class StatsSupplierBoxComponent {
  constructor(
    private api: StatsPageService,
    private smallForm: SmallFormService,
    private gs: GlobalService
  ) {}
  private readonly onDestroy = new Subject<void>();
  isLoading: boolean = true;
  supplierBoxPlot: any;
  supplierStats: any;

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
      .supplierBoxplotV0SupplierBoxplotPost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.supplierStats = response;
          this.generateBoxPlot();
        },
      });
  }

  generateBoxPlot() {
    this.supplierBoxPlot = {
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
          datasetId: 'supplierAggregate',
          itemStyle: {
            color: '#b8c5f2',
          },
          encode: {
            x: ['min', 'Q1', 'median', 'Q3', 'max'],
            y: 'Supplier',
            itemName: ['name'],
            tooltip: ['min', 'Q1', 'median', 'Q3', 'max'],
          },
        },
      ],
      dataset: [
        {
          id: 'supplierAggregate',
          source: this.supplierStats,
        },
      ],
    };
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}
