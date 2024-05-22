import { Component } from '@angular/core';

@Component({
  selector: 'app-info-popup',
  templateUrl: './info-popup.component.html',
  styleUrls: ['./info-popup.component.scss'],
})
export class InfoPopupComponent {
  invoiceStatus: any[] = [
    { label: 'Miles', info: 'info comes here' },
    { label: 'Accruals', info: 'Accrual Info comes here' },
    { label: 'Invoice Exception', info: 'Inv Exception' },
    { label: 'Orders Exception', info: 'Orders Exceptions' },
  ];
  header: string[] = ['Invoice status info'];

  constructor() {}
}
