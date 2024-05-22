import { Component } from '@angular/core';
import { SmallFormService } from '../small-form-component/small-form.service';
import { FormGroup } from '@angular/forms';
import { GlobalService } from 'src/app/core/services/global.service';

@Component({
  selector: 'app-supplier-component',
  templateUrl: './supplier-component.component.html',
  styleUrls: ['./supplier-component.component.scss'],
})
export class SupplierComponentComponent {
  landingPageformFilter: FormGroup = new FormGroup({});
  constructor(private smallForm: SmallFormService, private gs: GlobalService) {
    this.smallForm.formPage = 'extension';
    this.smallForm.formLayoutType.next('full-page');
    //hide all top row components
    this.gs.disableTopRows();
    this.smallForm.showSupplierDD.next(true);
    //show date selector
    this.smallForm.showDateSelectorDD.next(true);
    //show supplier top row
    this.gs.showSupplierTopRow.next(true);
    //hide component dd if it is shown
    this.smallForm.showMappingDD.next(false);

    this.smallForm.showMake.next(false);
  }

  ngOnInit() { }
}
