import { Component, OnInit } from '@angular/core';
import { SmallFormService } from '../small-form-component/small-form.service';
import { GlobalService } from 'src/app/core/services/global.service';

@Component({
  selector: 'app-component-details',
  templateUrl: './component-details.component.html',
  styleUrls: ['./component-details.component.scss'],
})
export class ComponentDetailsComponent implements OnInit {
  graphHData: any;
  spendPerMonthData: any;
  spendPerMonth: any; // spend per month graph
  dataMonths: any;
  spendValue: any;
  showAsstsCols: boolean = true;
  panelOpenState: boolean = true;
  showScatterPlotGraph: boolean = false;

  constructor(
    private smallForm: SmallFormService,
    private gs: GlobalService
  ) {
    this.smallForm.formPage = 'extension';
    this.smallForm.formLayoutType.next('full-page');
    //hide all top row components
    this.gs.disableTopRows();
    //show component top row
    this.gs.showComponentPageTop.next(true);
    //show component drop down in small form
    this.smallForm.showMappingDD.next(true);
    //disable supplier dropdown in the componet page
    this.smallForm.showSupplierDD.next(false);
    //show date selector
    this.smallForm.showDateSelectorDD.next(true);
    //show or  hide date rage selector
    this.smallForm.showDateRangeSelector.next(false);
    this.smallForm.showMake.next(false);
    this.gs.showFleetCardTop.next(false);

  }

  ngOnInit() {}
}
