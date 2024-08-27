import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxEchartsModule } from 'ngx-echarts';
import { ToTabZARPipe } from 'src/app/core/pipes/to-tab-zar.pipe';
import { MaterialModule } from 'src/app/material.module';
import { FeatureRoutingModule } from './feature-routing.module';
import { TabulatorModule } from 'src/app/tabulator.module';



@NgModule({
  declarations: [
    ToTabZARPipe,
   
  ],
  imports: [
    AgGridModule,
    MatAutocompleteModule,
    MaterialModule,
    CommonModule,
    RouterModule,
    NgxEchartsModule.forRoot({ echarts: () => import('echarts') }),
    ReactiveFormsModule,
    FormsModule,
    FeatureRoutingModule,
    NgApexchartsModule,
    BrowserAnimationsModule,
    TabulatorModule,
  ],
  exports: [
   
  ],
})
export class FeaturesModule {}
