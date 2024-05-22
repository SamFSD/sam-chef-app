import { Component } from '@angular/core';
import { PerAssetsViewService } from 'src/app/core/api/api_service';
import { PavSelectorService } from '../pav-selector.service';
import { Subject, takeUntil } from 'rxjs';
import { GlobalService } from 'src/app/core/services/global.service';
import { SmallFormService } from '../../small-form-component/small-form.service';


@Component({
  selector: 'app-usage-model-summary',
  templateUrl: './usage-model-summary.component.html',
  styleUrls: ['./usage-model-summary.component.scss']
})
export class UsageModelSummaryComponent {
  constructor(
    private api: PerAssetsViewService,
    private pavForm: PavSelectorService,
    private gs: GlobalService,
    private smallForm: SmallFormService,
  ) { }

  private readonly onDestroy = new Subject<void>();
  isLoading: boolean = true
  vehiclereg: string = '';
  period: string = '';
  component: string = 'all_components';
  pavSupplierSummaryGraph: any;
  graphData: any;
  showGraph: boolean = false;

  ngOnInit() {
    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.callApi();
        }
      })
  }

  callApi() {
    this.isLoading = true
    this.api
      .getPavSupplierV0GetPavSuppliersPost(
        this.smallForm.getFormValues()
      )
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false
          this.graphData = res;
          this.generateGraph();
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
        complete: () => { },
      });

  }

  generateGraph() {
    if (this.graphData.length > 0) {
      this.showGraph = true;
    } else this.showGraph = false;
    const data = this.graphData.map((supItem: any) => supItem.serviceprovider);
    const values = this.graphData.map((supItem: any) => supItem.amount);
    this.pavSupplierSummaryGraph = {
      textStyle: {
        fontFamily: 'Roboto',
      },
      tooltip: {
        trigger: 'axis',
      },
      yAxis: {
        type: 'value',

        // boundaryGap: [0, 0.01],
      },
      xAxis: {
        type: 'category',
        data: data,
        axisLabel: {
          show: false,
        },
        axisTick: { show: false },
      },
      series: [
        {
          type: 'bar',
          data: values, // costs
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
            formatter: '{b}',
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
  }

  ngOnDestroy() {
    this.onDestroy.next(), this.onDestroy.complete();
  }
}
