import { Component, Input, SimpleChanges } from '@angular/core';
import { DriverBIGauge } from 'src/app/interfaces.interrface';
import { DrivingEventsService } from '../driving-events.service';

@Component({
  selector: 'app-bi-guages',
  templateUrl: './bi-guages.component.html',
  styleUrls: ['./bi-guages.component.scss'],
})
export class BiGuagesComponent {
  @Input() biGaugesData!: DriverBIGauge[];
  isLoading: boolean = true;
  // Array to hold options for multiple gauges
  gaugeMergeOptions: any[] = [];

  constructor(private eventService: DrivingEventsService) {}

  ngOnInit() {
    this.gauge();
  }
  // Set active gauge card
  activeIndex: number = -1;

  setActive(index: number) {
    this.activeIndex = index;
  }

  isActive(index: number): boolean {
    return this.activeIndex === index;
  }
  // Set active gauge card

  // Filter The table and map on gauge click
  onClick(clickedGauge: any) {
    //   //  this.isLoading = true;

    this.eventService.onEventSelect.next(clickedGauge);
  }

  gauge() {
    this.isLoading = false;
    setTimeout(() => {
      this.biGaugesData.forEach((data: DriverBIGauge, index: number) => {
        // Corrected data type
        this.gaugeMergeOptions[index] = {
          // Corrected index assignment
          tooltip: {
            formatter: '{a} <br/>{b} : {c}%',
            pointer: {
              itemStyle: {
                fontSize: 3,
                color: '#15a3b3',
                width: 10,
              },
            },
          },
          yAxis: {
            show: false,
          },
          series: [
            {
              name: 'Monthly Score',
              type: 'gauge',
              radius: '95%',
              startAngle: 180,
              endAngle: 0,
              grid: {
                left: '1%',
                right: '1%',
                top: 0,
                bottom: '1%',
              },
              axisLine: {
                show: true,
                lineStyle: {
                  color: [
                    [0.3, 'red'],
                    [0.8, 'orange'],
                    [1, 'green'],
                  ],
                },
              },
              axisLabel: {
                show: false,
              },
              detail: {
                formatter: '{value}%',
                fontSize: 15,
                fontWeight: 'bold',
              },
              pointer: {
                itemStyle: {
                  fontSize: 3,
                  color: '#15a3b3',
                  height: 10,
                },
              },
              data: [
                {
                  value: data.value.toFixed(2),
                  name: data.title,
                },
              ],
            },
          ],
          animationDuration: 2000,
          animation: 'elasticOut',
        };
      });
    }, 500);
  }

  getGaugeColorStart() {
    return {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: 'white' },
        { offset: 1, color: 'red' },
      ],
      global: false,
    };
  }

  getGaugeColorMiddle() {
    return {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: '#fb8c00' },
        { offset: 1, color: 'white' },
      ],
      global: false,
    };
  }

  getGaugeColorEnd() {
    return {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: 'white' },
        { offset: 1, color: '#4caf50' },
      ],
      global: false,
    };
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['biGaugesData']) {
      this.gauge();
      // console.log(this.biGaugesData, 'Bi Guages Data Changes');
    }
  }
}
