import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { ExpirationsService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';
import { SmallFormService } from '../../../small-form-component/small-form.service';
import { ExpirationsPopuTableComponent } from './expirations-popup-table/expirations-popu-table.component';

@Component({
  selector: 'app-upcoming-expirations',
  templateUrl: './upcoming-expirations.component.html',
  styleUrls: ['./upcoming-expirations.component.scss'],
})
export class UpcomingExpirationsComponent {
  nextMonth = '';
  monthAfterNext = '';
  apiSub: any;
  expiredLic: number = 0;
  expiredContract: number = 0;
  nextMonthLicExp: number = 0;
  nextMonthContractExp: number = 0;
  twoMonthsLicExp: number = 0;
  twoMonthsContractExp: number = 0;
  nextMonthYear: string = '';
  yearAfterNextMonth: string = '';
  next2MonthYear: string = '';

  private readonly onDestroy = new Subject<void>();

  constructor(
    private api: ExpirationsService,
    private smallFormService: SmallFormService,
    private dialog: MatDialog,
    private gs: GlobalService
  ) {}

  ngOnInit() {
    this.getMonthNames();
    //when small form is ready, get the values from it and call api
    this.smallFormService.formDataLoaded$
      .pipe(takeUntil(this.onDestroy))
      .subscribe((loaded: boolean) => {
        if (loaded) {
          this.callApi(this.smallFormService.getFormValues());
        }
      });
  }

  callApi(form: any) {
    this.api
      .sho002GetUpcomingExpirationsCountsV0Sho002GetUpcomingExpirationsCountsPost(
        form
      )
      .subscribe({
        next: (res: any) => {
          res = res[0];
          this.expiredLic = res.lic_expired_count;
          this.expiredContract = res.contract_expired_count;
          this.nextMonthLicExp = res.next_month_lic_expired_count;
          this.nextMonthContractExp = res.next_month_contract_expired_count;
          this.twoMonthsLicExp = res.next_two_month_lic_expired_count;
          this.twoMonthsContractExp = res.next_two_month_contract_expired_count;
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
      });
  }

  onLicensePopup(period: string) {
    const dialogRef = this.dialog.open(
      ExpirationsPopuTableComponent,

      {
        width: '1500px',
        height: '564px',
        data: { popuptype: 'license', month: period },
      }
    );
  }

  onContractPopup(period: string) {
    const dialogRef = this.dialog.open(ExpirationsPopuTableComponent, {
      width: '1500px',
      height: '564px',
      data: { popuptype: 'contract', month: period },
    });
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  getMonthNames() {
    // Create a Date object for today
    const today: Date = new Date();

    // Calculate the month for the next month
    const nextMonthMonth: number = (today.getMonth() + 1) % 12; // Add 1 and use modulo to handle December

    // Calculate the year for the next month
    const nextMonthYear =
      today.getFullYear() + Math.floor((today.getMonth() + 1) / 12);

    // Calculate the month for the month after next
    const monthAfterNextMonth: number = (nextMonthMonth + 1) % 12; // Add 1 and use modulo to handle December

    // Calculate the year for the month after next
    const yearAfterNextMonth =
      nextMonthYear + Math.floor((nextMonthMonth + 1) / 12);

    // Array of month names
    const monthNames: string[] = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // Get the names of the next two months
    this.nextMonth = monthNames[nextMonthMonth];
    this.monthAfterNext = monthNames[monthAfterNextMonth];
    this.nextMonthYear = `${this.nextMonth}, ${nextMonthYear.toString()}`;
    this.next2MonthYear = `${
      this.monthAfterNext
    }, ${yearAfterNextMonth.toString()}`;

    // Output the results
  }
}
