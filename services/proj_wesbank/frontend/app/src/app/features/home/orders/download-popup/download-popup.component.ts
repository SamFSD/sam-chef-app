import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-download-popup',
  templateUrl: './download-popup.component.html',
  styleUrls: ['./download-popup.component.scss']
})
export class DownloadPopupComponent {

  selectedOption: string = 'Wesbank';
  options: string[] = ['Wesbank', 'Legacy Order File']

  constructor(
    private dialogRef: MatDialogRef<DownloadPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogInput: any
    ) {}

  onUserChoice(choice: string) {
    if (choice === 'confirm') {
      this.dialogRef.close({userChoice: this.selectedOption})
    }
    if (choice === 'cancel') {
      this.dialogRef.close()
    }
  }
}
