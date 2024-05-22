import { Component, Input, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';

import { ChartsService } from 'src/app/core/services/charts.service';
import { SmallFormService } from '../../small-form-component/small-form.service';

@Component({
  selector: 'app-vehicle-count-pie',
  templateUrl: './vehicle-count-pie.component.html',
  styleUrls: ['./vehicle-count-pie.component.scss'],
})
export class VehicleCountPieComponent {
  @Input() selectedType: any;
  @Input() piData: any;
  graphTitle: string = 'Assets ';
  pieChart: any;
  firstPieChange: boolean = false;
  isLoading: boolean = true;

  private readonly onDestroy = new Subject<void>();

  constructor(
    private smallFormService: SmallFormService,
    private charts: ChartsService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['piData'] && this.piData) {
      this.generatePieChart();
    }
  }

  ngOnInit() {
    if (this.piData) {
      //when small form is ready, get the values from it and call api
      this.generatePieChart();
    }
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  generatePieChart() {
    this.isLoading = true;
    if (!this.piData || this.piData.length === 0) {
      this.graphTitle = 'No data for selected filters';
      this.pieChart = {
        title: {
          text: this.graphTitle,
          left: 'center',
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '65%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'outside',
            },
            labelLine: {
              show: false,
            },
            data: [{ name: 'No data', value: 0 }],
            itemStyle: {
              borderType: 'solid',
              borderColor: '#ffffff',
              borderRadius: [4, 4, 0, 0],
            },
          },
        ],
      };
    } else {
      this.graphTitle = 'Asset Type Distribution';
      this.pieChart = {
        title: {
          text: this.graphTitle,
          left: 'center',
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '65%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'outside',
            },
            labelLine: {
              show: false,
            },
            data: this.piData.map((item: any) => ({
              value: item.unit_count,
              name: item.veh_type_map,
            })),
            itemStyle: {
              borderType: 'solid',
              borderColor: '#ffffff',
              borderRadius: [4, 4, 0, 0],
            },
          },
        ],
        toolbox: this.charts.getChartToolbox(),
        tooltip: {
          trigger: 'item',
        },
      };
    }

    // Simulate loading delay
    this.delay(1000).then(() => {
      this.isLoading = false;
    });
  }

  onChartEvent(event: any, type: string) {
    if (!this.firstPieChange) {
      //update form veh type value when a value is clicked here
      this.smallFormService.updateTypeValue.next([event.name]);
      // submit and updates the small form when pie even(chart) is clicked
      this.smallFormService.submitSmallForm.next(true);
    }
  }
}
