import { Component } from '@angular/core';
import { SmallFormService } from '../../small-form-component/small-form.service';

@Component({
  selector: 'app-expirations-top-row',
  templateUrl: './expirations-top-row.component.html',
  styleUrls: ['./expirations-top-row.component.scss'],
})
export class ExpirationsTopRowComponent {
  vehContrExpData: any[] = [];
  vehLicExpData: any[] = [];
  apiSub: any;

  constructor() {}
}
