import { Component } from '@angular/core';
import { SmallFormService } from '../small-form-component/small-form.service';

import { GlobalService } from 'src/app/core/services/global.service';
@Component({
  selector: 'app-expirations',
  templateUrl: './expirations.component.html',
  styleUrls: ['./expirations.component.scss'],
})
export class ExpirationsComponent {
  constructor(
    private gs: GlobalService,
    private smallForm: SmallFormService
  ) {

    this.smallForm.formPage = 'extension';
    this.smallForm.formLayoutType.next('full-page');
    //remove all other component top rows
    this.gs.disableTopRows();
    this.gs.showExpirationsPageTop.next(true);

    //show small form dates select
    this.smallForm.showDateSelectorDD.next(true);
    this.smallForm.showMappingDD.next(false);
    this.smallForm.showSupplierDD.next(false);
    this.smallForm.showDateRangeSelector.next(false);
    this.smallForm.showMake.next(false);
    this.gs.showFleetCardTop.next(false);
    // show top stats row
  }

  ngOnInit() { }
}
