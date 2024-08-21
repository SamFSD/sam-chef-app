import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GlobalService } from '../../services/global.service';
import { ColorSchemeService } from '../../services/theme/color-scheme.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent { 
  isHandled: boolean = false;
   // Flag to toggle between login and register
  isLogin = true;
  loginForm!: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public colorSchemeService: ColorSchemeService,
    public globalService: GlobalService,
    public route: Router,
    public dialog: MatDialog
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Initialize registration form
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }




  toggleView() {
    this.isLogin = !this.isLogin;
  }

  onLogin() {
    if (this.loginForm.valid) {
      // Handle login logic, such as sending JWT token request
      const credentials = this.loginForm.value;
      console.log('Logging in with:', credentials);
      
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      // Handle registration logic, such as sending user data to the backend
      const newUser = this.registerForm.value;
      console.log('Registering user:', newUser);
      // TODO: Implement your registration service
    }
  }


}
