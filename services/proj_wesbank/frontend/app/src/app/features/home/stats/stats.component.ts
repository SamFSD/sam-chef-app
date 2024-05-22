import { Component } from '@angular/core';
import { GlobalService } from 'src/app/core/services/global.service';
import { SmallFormService } from '../small-form-component/small-form.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class StatsComponent {
  constructor(private gs: GlobalService, private smallForm: SmallFormService) {}

  ngOnInit() {
    this.gs.disableTopRows();
    this.gs.showStatsTop.next(true);

    this.smallForm.formPage = 'events';
    this.smallForm.formLayoutType.next('full-page');

  }
}
