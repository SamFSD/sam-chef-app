import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-repair-type-top',
  templateUrl: './repair-type-top.component.html',
  styleUrls: ['./repair-type-top.component.scss'],
})
export class RepairTypeTopComponent {
  @Input() repairTypesTopRowData!: any;

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['repairTypesTopRowData']) {
      this.repairTypesTopRowData;
    }
  }
}
