import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MatDatepickerInputEvent,
  MatStartDate,
} from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DowntimeTrackerService } from 'src/app/core/api/api_service';
import { GlobalService } from 'src/app/core/services/global.service';

@Component({
  selector: 'app-dt-end-popup',
  templateUrl: './dt-end-popup.component.html',
  styleUrls: ['./dt-end-popup.component.scss'],
})
export class DtEndPopupComponent {
  selectedDate: any;

  constructor(
    public dialogRef: MatDialogRef<DtEndPopupComponent>,
    private api: DowntimeTrackerService,
    private snackBar: MatSnackBar,
    private gs: GlobalService,
    @Inject(MAT_DIALOG_DATA)
    public inputData: {
      uid: string;
      vehiclereg: string;
      fleet_no: string;
    }
  ) {}

  ngOnInit(): void {}

  // Function to handle date selection
  dateSelected(event: MatDatepickerInputEvent<Date>) {
    this.selectedDate = event.value;
  }

  onSubmit() {
    this.api
      .endDtRecordV0EndDtRecordPost(this.inputData.uid, this.selectedDate)
      .subscribe({
        next: () => {
          this.snackBar.open('Record Updated Successfully!', 'Close', {
            duration: 2000,
          });
          this.dialogRef.close();
        },
        error: (err: any) => {
          this.gs.raiseError(err);
        },
        complete: () => {},
      });
    this.dialogRef.close();
  }

  // Function to close the dialog and pass the selected date
  closeDialog() {
    this.dialogRef.close();
  }
}
