import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import Angular Material components
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatStepperModule } from '@angular/material/stepper';
import { HttpClientModule } from '@angular/common/http'; 
import { BackendService } from '../api-service/backend.service';


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule ,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatToolbarModule,
    MatSidenavModule,
    MatTableModule,
    MatTabsModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatRippleModule,
    MatAutocompleteModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatExpansionModule,
    MatStepperModule
  ],
  exports: [
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatToolbarModule,
    MatSidenavModule,
    MatTableModule,
    MatTabsModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatRippleModule,
    MatAutocompleteModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatExpansionModule,
    MatStepperModule,
    HttpClientModule
  ],
  providers: [BackendService],
})
export class MaterialModule { }
