import { Component, Inject } from '@angular/core';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserPermissionDisplayComponent } from '../user-permission-display/user-permission-display.component';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent {

  userData: any;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EditUserComponent>
  ) {
    this.userData = data;
  }

  ngOnInit() {    
  }

  onClose(): void {
    this.dialogRef.close();
  }
}