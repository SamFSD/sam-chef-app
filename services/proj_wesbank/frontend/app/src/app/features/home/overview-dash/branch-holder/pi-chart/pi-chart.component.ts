import { Component, Input, SimpleChange, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { CpksChartsAndGraphsService } from 'src/app/core/api/api_service';

@Component({
  selector: 'app-pi-chart',
  templateUrl: './pi-chart.component.html',
  styleUrls: ['./pi-chart.component.scss'],
})
export class PiChartComponent {
  @Input() division: string = 'test';
  @Input() branch?: string;
  sunburstSub!: Subscription;
  output?: any = ':(';
  piData: any;
  title?: string;
  sunburstChartOptions: any;
  constructor(private apiService: CpksChartsAndGraphsService) {}
  ngOnInit() {
    if (this.division) {
      this.output = 'div pi chart for ' + this.division;

      this.title = this.division;
      this.sunburstSub = this.apiService
        .getDivisionSunburstV0GetPerDivisionSunburstGet(this.division)
        .subscribe((data) => {
          this.piData = data;
          this.setPiChart(data.sunburst);
        });
    }
    if (this.branch) {
      this.title = this.branch;
      this.sunburstSub = this.apiService
        .getBranchSunburstV0GetPerBranchSunburstGet(this.branch)
        .subscribe((data) => {
          this.piData = data;
          this.setPiChart(data.sunburst);
        });
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['division']) {
      this.output = 'div pi chart for ' + this.division;

      this.title = this.division;
      this.sunburstSub = this.apiService
        .getDivisionSunburstV0GetPerDivisionSunburstGet(this.division)
        .subscribe((data) => {
          this.piData = data;
          this.setPiChart(data.sunburst);
        });
    }
    if (changes['branch']) {
      this.title = this.branch;
      this.sunburstSub = this.apiService
        .getBranchSunburstV0GetPerBranchSunburstGet(
          changes['branch'].currentValue
        )
        .subscribe((data) => {
          this.piData = data;
          this.setPiChart(data.sunburst);
        });
    }
  }

  ngOnDestroy() {
    this.sunburstSub.unsubscribe();
  }

  setPiChart(data: any) {
    // const setHierarchy = (segments: any[], parentName?: string) => {
    //   segments.forEach((segment: any) => {
    //     segment.parent = parentName;
    //     if (segment.children) {
    //       setHierarchy(segment.children, segment.name);
    //     }
    //   });
    // };
    const setHierarchy = (segments: any[], parentName?: string) => {
      segments.forEach((segment: any) => {
        segment.parentName = parentName;
        if (segment.children) {
          setHierarchy(segment.children, segment.name);
        }
      });
    };

    setHierarchy(data);

    this.sunburstChartOptions = {
      series: [
        {
          type: 'sunburst',
          data: data,
          emphasis: {
            focus: 'ancestor',
          },

          levels: [
            {},
            {
              r0: '15%',
              r: '35%',
              itemStyle: {
                borderWidth: 2,
              },
              label: {
                rotate: 'tangential',
                show: false,
              },
              emphasis: {
                label: {
                  show: true,
                  position: 'inside',
                  overflow: 'overflow',
                },
              },
              downplay: {
                label: {
                  show: false,
                  position: 'inside',
                  overflow: 'overflow',
                },
              },
            },
            {
              r0: '35%',
              r: '70%',
              label: {
                align: 'right',
                show: false,
              },
              emphasis: {
                label: {
                  show: true,
                },
              },
              downplay: {
                label: {
                  show: false,
                },
              },
            },
            {
              r0: '70%',
              r: '85%',
              label: {
                position: 'outside',
                padding: 3,
                silent: false,
                show: false,
              },
              emphasis: {
                label: {
                  show: true,
                },
              },
              downplay: {
                label: {
                  show: false,
                },
              },
              itemStyle: {
                borderWidth: 3,
              },
            },
            {
              r0: '85%',
              r: '100%',
              label: {
                position: 'outside',
                padding: 3,
                silent: false,
                show: false,
              },
              emphasis: {
                label: {
                  show: true,
                  position: 'inside',
                  overflow: 'overflow',
                },
              },
              downplay: {
                label: {
                  show: false,
                },
              },
              itemStyle: {
                borderWidth: 3,
              },
            },
            {
              label: {
                // position: 'outside',
                padding: 3,
                silent: false,
                position: 'inside',
                overflow: 'overflow',
                // show: false,
              },
            },
          ],
        },
      ],
      events: [
        {
          type: 'click',
          handler: this.onSegmentClick.bind(this),
        },
      ],
    };
  }

  onSegmentClick(event: any) {
    // Access the clicked segment data from the event object
    const segmentData = event.data;

    // Perform any additional actions based on the clicked segment
  }
  onChartEvent(event: any, type: string) {
    if (type === 'chartClick') {
      const segmentData = event.data;
      const segmentName = segmentData.name;
      const parentNames: string[] = [];

      const getParentSegments = (segment: any) => {
        if (segment.parentName) {
          parentNames.unshift(segment.parentName);
          getParentSegments(segment.parentName);
        }
      };

      getParentSegments(segmentData);
    }
  }
}
