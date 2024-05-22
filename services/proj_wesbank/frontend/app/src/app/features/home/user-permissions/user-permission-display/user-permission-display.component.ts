import { Component, OnInit } from '@angular/core';
import { SmallFormService } from '../../small-form-component/small-form.service';
import { AuthService } from '@auth0/auth0-angular';
import { MatDialogRef } from '@angular/material/dialog';
import { GlobalService } from 'src/app/core/services/global.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { smallForm } from '../../small-form-component/small-form-interface';

@Component({
  selector: 'app-user-permission-display',
  templateUrl: './user-permission-display.component.html',
  styleUrls: ['./user-permission-display.component.scss'],
})
export class UserPermissionDisplayComponent implements OnInit {
  userProfile: any;
  userPermissions: any;
  email: string = '';
  first_name: string = '';
  last_name: string = '';
  userNotFound: boolean = true;

  profileEmail: string = '';

  constructor(
    private smallForm: SmallFormService,
    private gs: GlobalService,
    public auth: AuthService,
    public dialogRef: MatDialogRef<UserPermissionDisplayComponent>
  ) {}

  ngOnInit() {
    this.smallForm.formDataLoaded$.subscribe((loaded: boolean) => {
      if (loaded) {
        this.callApi(this.smallForm.getFormValues());
      }
    });

    this.smallForm.userEmail$.subscribe((profile) => {
      this.profileEmail = profile.email;
    }),
      this.smallForm.userPerms$.subscribe((userPermissions: any) => {
        if (userPermissions.length === 0 && this.userNotFound === true) {
          this.userNotFound = true;
        } else {
          this.userPermissions = userPermissions[0].permissions;
          this.email = userPermissions[0].email;
          this.first_name = userPermissions[0].first_name;
          this.last_name = userPermissions[0].last_name;
        }
      });
  }

  callApi(formValues: smallForm) {
    console.log(formValues);
  }

  onClose(): void {
    if (this.userPermissions === 0) {
    } else {
      this.dialogRef.close();
    }
  }
}
