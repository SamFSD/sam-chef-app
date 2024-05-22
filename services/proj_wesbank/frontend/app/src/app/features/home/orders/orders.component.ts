import { Component } from '@angular/core';
import { GlobalService } from 'src/app/core/services/global.service';
import { SmallFormService } from '../small-form-component/small-form.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent {
  constructor(private gs: GlobalService, private smallForm: SmallFormService) {
    //hides the row bar
    this.gs.disableTopRows();
    // show top stats row
    this.gs.showOrdersPageTop.next(true);

    this.smallForm.formPage = 'orders';
    this.smallForm.formLayoutType.next('full-page');
    this.gs.showFleetCardTop.next(false);

  }
}