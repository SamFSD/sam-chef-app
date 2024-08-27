import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ToTabZARPipe } from 'src/app/core/pipes/to-tab-zar.pipe';
import { MaterialModule } from 'src/app/material.module';
import { FeatureRoutingModule } from './feature-routing.module';
import { TabulatorModule } from 'src/app/tabulator.module';



@NgModule({
  declarations: [
    ToTabZARPipe,
   
  ],
  imports: [
    MatAutocompleteModule,
    MaterialModule,
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    FeatureRoutingModule,
    BrowserAnimationsModule,
    TabulatorModule,
  ],
  exports: [
   
  ],
})
export class FeaturesModule {}
