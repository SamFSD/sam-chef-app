import { Component } from '@angular/core';
import {
  ComponentsService,
  InvoiceStatusService,
} from 'src/app/core/api/api_service';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { InfoPopupComponent } from '../../info-popup/info-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { smallForm } from '../../small-form-component/small-form-interface';

@Component({
  selector: 'app-invoice-status-top-row',
  templateUrl: './invoice-status-top-row.component.html',
  styleUrls: ['./invoice-status-top-row.component.scss'],
})
export class InvoiceStatusTopRowComponent {
  isLoading: boolean = true;

  private readonly onDestroy = new Subject<void>();

  apiSub: any;
  accrualInvoices: string = '0';
  completedInvoices: string = '0';
  invoicesExceptions: string = '0';
  ordersExceptions: string = '0';
  orderExptionCount: number = 0;
  invoiceExceptionCount: number = 0;
  completedInvoiceCount: number = 0;
  accrualInvoiceCount: number = 0;
  pieOptions: any;
  apiResults: any;
  invoiceDiff: any;
  vehicleCounts: number = 0;
  invoiceDiffCount: number = 0;

  constructor(
    private api: ComponentsService,
    private apiPing: InvoiceStatusService,
    private smallForm: SmallFormService,
    private gs: GlobalService,
    private dialog: MatDialog
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

    //submit the form on init
    // this.smallFormService.submitSmallForm.next(true)

    //get unassinged costs and counts
    this.apiPing
      .sho002GetInvoiceDifferenceV0sho002GetInvoiceDifferencePost(form)
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          (this.invoiceDiff = this.gs.toZAR(res[0].invoice_difference)),
            (this.vehicleCounts = res[0].vehicle_count);
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
      });

    this.api
      .sho002GetTotalCountsAndCostsForCompletedAccrualOrderExceptAndInvoiceExceptV0Sho002GetTotalCountsAndCostsForCompletedAccrualOrderExcepAndInvoiceExcepPost(
        form
      )
      .pipe(takeUntil(this.onDestroy))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          // form.julFromDate, form.julToDate;
          this.apiResults = res[0];
          this.accrualInvoices = this.gs.toZAR(this.apiResults.accruals);
          this.completedInvoices = this.gs.toZAR(
            this.apiResults.completed_invoice
          );
          this.invoicesExceptions = this.gs.toZAR(
            this.apiResults.invoice_exception
          );
          this.ordersExceptions = this.gs.toZAR(
            this.apiResults.orders_exception
          );
          this.invoiceDiff = this.gs.toZAR(this.apiResults.invoice_difference);

          this.accrualInvoiceCount = this.apiResults.accruals_count;
          this.completedInvoiceCount = this.apiResults.completed_count;
          this.invoiceExceptionCount = this.apiResults.invoice_exception_count;
          this.orderExptionCount = this.apiResults.orders_exception_count;
          this.invoiceDiffCount = this.apiResults.invoice_difference_count;
          this.generatePiChart();
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
        complete: () => {},
      });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  generatePiChart() {
    this.pieOptions = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          let tooltip = params.name + '<br/>';

          const formattedValue = this.gs.toZAR(params.value);
          tooltip += params.marker + formattedValue + '<br/>';

          return tooltip;
        },
      },

      legend: {
        top: '-1%',
        left: 'center',
      },
      series: [
        {
          type: 'pie',
          radius: ['55%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center',
          },
          labelLine: {
            show: false,
          },
          data: [
            {
              value: this.apiResults.invoice_exception,
              name: 'Invoice Exceptions',
              itemStyle: {
                color: '#d03827',
              },
            },
            {
              value: Math.abs(this.apiResults.invoice_difference),
              name: 'Invoice Difference',
              itemStyle: {
                color: '#fd7e14',
              },
            },
            {
              value: this.apiResults.orders_exception,
              name: 'Order Exceptions',
              itemStyle: {
                color: '#e79920',
              },
            },
            {
              value: this.apiResults.accruals,
              name: 'Accrual',
              itemStyle: {
                color: '#39a750',
              },
            },
            {
              value: this.apiResults.completed_invoice,
              name: 'Completed',
              itemStyle: {
                color: '#69d2dc',
              },
            },
          ],
        },
      ],
    };
  }

  infoPopup() {
    const dialogRef = this.dialog.open(InfoPopupComponent, {
      width: '780px',
      // height: '300px',
      hasBackdrop: true, // Ensure backdrop is enabled
      disableClose: false, // Ensure clicking outside closes the dialog
    });
  }
}
function sho002GetInvoiceDifferenceV0sho002GetInvoiceDifferencePost(form: any) {
  throw new Error('Function not implemented.');
}
