import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/core/services/global.service';
import { InfoPopupComponent } from '../../info-popup/info-popup.component';
import { SmallFormService } from '../../small-form-component/small-form.service';

@Component({
  selector: 'app-invoice-status-bar',
  templateUrl: './invoice-status-bar.component.html',
  styleUrls: ['./invoice-status-bar.component.scss'],
})
export class InvoiceStatusBarComponent implements OnInit {
  @Input() invoiceSatusBarData: any;
  @Output() buttonClicked = new EventEmitter<void>();
  apiSub: any;
  isLoading: boolean = true;
  invoiceStatusBar: any;
  graphTitle: string = 'Invoice Status';
  selectedVehType: any;
  graphData: any;
  @Input() division?: string;
  divisions: { label: string; division: string }[] = [];
  data: { veh_type_map: string; unit_count: number }[] = [
    { veh_type_map: '', unit_count: 0 },
  ];
  iconVisible: any;

  constructor(
    private smallFormService: SmallFormService,
    private router: Router,
    private dialog: MatDialog,
    private gs: GlobalService
  ) {}

  ngOnInit() {
    if (this.invoiceSatusBarData) {
      this.generateGraph();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['invoiceSatusBarData']) {
      this.generateGraph();
    }
  }

  generateGraph() {
    this.isLoading = true;
    if (this.invoiceSatusBarData.length === 0) {
      this.graphTitle = 'No data for selected filters';
      this.graphData = [
        {
          months: 'No data',
          miles: 0,
          accrual: 0,
          order_exceptions: 0,
          invoice_exceptions: 0,
          invoice_difference: 0,
        },
      ];
    } else {
      this.graphTitle = 'Invoice Status';
    }
    // Replace NaN values and empty strings with 0
    this.graphData = this.invoiceSatusBarData.map((item: any) => ({
      ...item,
      miles: isNaN(item.miles) || item.miles === '' ? 0 : item.miles,
      accrual: isNaN(item.accrual) || item.accrual === '' ? 0 : item.accrual,
      order_exceptions:
        isNaN(item.order_exceptions) || item.order_exceptions === ''
          ? 0
          : item.order_exceptions,
      invoice_exceptions:
        isNaN(item.invoice_exceptions) || item.invoice_exceptions === ''
          ? 0
          : item.invoice_exceptions,
      invoice_difference:
        isNaN(item.invoice_difference) || item.invoice_difference === ''
          ? 0
          : item.invoice_difference,
    }));
    //show small form dates select
    this.smallFormService.showDateSelectorDD.next(true);
    this.invoiceStatusBar = {
      legend: { show: false },
      textStyle: {
        fontFamily: 'Roboto',
      },
      title: {
        text: this.graphTitle,
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          let tooltip = params[0].axisValue + '<br/><br/>';

          params.forEach((item: any) => {
            const formattedValue = this.gs.toZAR(item.value);
            tooltip +=
              item.marker +
              item.seriesName +
              ':&emsp;<br/>' +
              '&emsp;' +
              formattedValue +
              '&emsp;<br/>';
          });

          return tooltip;
        },
      },

      xAxis: [
        {
          type: 'category',
          data: this.graphData.map((item: any) => {
            const date = new Date(item.months);
            const monthYearString = date.toLocaleString('en-US', {
              month: 'short',
              year: '2-digit',
            });
            return monthYearString;
          }),
        },
      ],
      yAxis: [
        {
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
      ],
      series: [
        {
          name: 'Miles',
          type: 'bar',
          stack: 'Ad',
          color: '#69d2dc',
          emphasis: {
            focus: 'series',
          },
          data: this.graphData.map((item: any) => item.miles),
        },
        {
          name: 'Accruals',
          type: 'bar',
          stack: 'Ad',
          color: '#39A750',
          emphasis: {
            focus: 'series',
          },
          data: this.graphData.map((item: any) => item.accrual),
        },

        {
          name: 'Order Exceptions',
          type: 'bar',
          stack: 'Ad',
          color: '#E79917',
          emphasis: {
            focus: 'series',
          },
          data: this.graphData.map((item: any) => item.order_exceptions),
        },
        {
          name: 'Invoice Difference',
          type: 'bar',
          stack: 'Ad',
          color: '#fd7e14',
          emphasis: {
            focus: 'series',
          },
          data: this.graphData.map((item: any) =>
            Math.abs(item.invoice_difference)
          ),
        },
        {
          name: 'Invoice Exceptions',
          type: 'bar',
          stack: 'Ad',
          color: '#D03827',
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            focus: 'series',
          },
          data: this.graphData.map((item: any) => item.invoice_exceptions),
        },
      ],
      animationDuration: 10000,
      animationEasing: 'elasticOut',
    };
    this.isLoading = false;
  }

  onChartClicked = (params: any) => {
    const seriesName = params.seriesName;
    const value = params.value;
    this.router.navigate(['/invoice-status-view']),
      {
        queryParams: { seriesName, value },
      };
  };

  infoPopup() {
    const dialogRef = this.dialog.open(InfoPopupComponent, {
      width: '780px',
      // height: '300px',
      hasBackdrop: true, // Ensure backdrop is enabled
      disableClose: false, // Ensure clicking outside closes the dialog
    });
  }
}
