import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-component-costs-holder',
  templateUrl: './component-costs-holder.component.html',
  styleUrls: ['./component-costs-holder.component.scss'],
})
export class ComponentCostsHolderComponent {
  @Input() branches!: string[];
}
