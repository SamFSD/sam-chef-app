import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { OrdersService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { SmallFormService } from '../../small-form-component/small-form.service';

@Component({
  selector: 'app-orders-top-row',
  templateUrl: './orders-top-row.component.html',
  styleUrls: ['./orders-top-row.component.scss'],
})
export class OrdersTopRowComponent {
  userCanViewOrders: boolean = false;
  userNotFound: boolean = false;

  //when a branch is selected use this value to filter the orders
  selectedBranch!: string;
  totalOrderAmount: string | number = '';
  totalInvAmount: string | number = '';
  totalInvDiff: string | number = '';
  totalInvCount: number = 0;


  private readonly onDestroy = new Subject<void>();
  profileEmail: any;

  constructor(
    public smallForm: SmallFormService,
    private api: OrdersService,
    private gs: GlobalService
  ) {}

  ngOnInit() {
    /*    this.smallForm.userEmail$.subscribe((profile: any) => {
      if (profile.email) {
        this.userNotFound = true;
      }
    }); */

    // retrieve form values when form is done loading
    this.smallForm.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.userCanViewOrders = this.smallForm.userCanSeeOrders;

          // check if any branch is selected and not multiple branches
          if (
            this.smallForm.getFormValues().branch_single &&
            this.userCanViewOrders
          ) {
            this.callApi(this.smallForm.getFormValues());
            this.userNotFound = true;
          }
        }
      });
  }

  callApi(formValues: any) {
  this.selectedBranch = formValues.branch_single.branch;
  this.api.ordersSummaryV0GetOrderAmountSummaryPost(formValues).subscribe({
    next: (res: any) => {
     this.totalOrderAmount = this.gs.toZAR(
  res[0].total_order_amount.toString(),
);

this.totalInvAmount = this.gs.toZAR(
  res[0].total_inv_amount.toString(),
);

this.totalInvDiff = this.gs.toZAR(
  res[0].total_inv_diff.toString(),
);

      // total invoice counts
      this.totalInvCount = res[0].total_inv_count;
    },
    error(err: any) {
    },
    complete() {},
  });
}

}
