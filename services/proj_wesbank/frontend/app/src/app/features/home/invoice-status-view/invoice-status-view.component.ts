import { Component } from '@angular/core';
import { GlobalService } from 'src/app/core/services/global.service';
import { SmallFormService } from '../small-form-component/small-form.service';

@Component({
  selector: 'app-invoice-status-view',
  templateUrl: './invoice-status-view.component.html',
  styleUrls: ['./invoice-status-view.component.scss'],
})
export class InvoiceStatusViewComponent {
  vehicles: any;
  fleetTable: any;

  constructor(private gs: GlobalService, private smallForm: SmallFormService) {
    this.smallForm.formPage = 'general';
    this.smallForm.formLayoutType.next('compact');

    //submit the small form on init
    // this.smallForm.submitSmallForm.next(true)

    this.smallForm.showDateRangeSelector.next(false);
    this.smallForm.showMake.next(false);

    //hide other top rows
    this.gs.disableTopRows();
    // show this top row
    this.gs.showInvStatusPageTop.next(true);
  }
}
