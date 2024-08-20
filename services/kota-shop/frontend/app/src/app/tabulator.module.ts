import { NgModule } from '@angular/core';
import { FormatModule, SelectRowModule, TabulatorFull as Tabulator, TooltipModule } from 'tabulator-tables';

@NgModule({
  imports: [],
  exports: [],
})
export class TabulatorModule {
  constructor() {
    Tabulator.registerModule(FormatModule);
    Tabulator.registerModule(SelectRowModule);
    Tabulator.registerModule(TooltipModule);
  }
}
