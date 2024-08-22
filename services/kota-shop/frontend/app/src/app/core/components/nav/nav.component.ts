import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GlobalService } from '../../services/global.service';
// import { ColorSchemeService } from '../../services/theme/color-scheme.service';
import { Router } from '@angular/router';
import {AuthInterceptor } from '../../services/auth-interceptor.service.ts'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent {
  isHandled: boolean = false;
  isLogin = true;
  loginForm!: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public globalService: GlobalService,
    public route: Router,
    public dialog: MatDialog,
    private auth: AuthInterceptor
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

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
      const credentials = this.loginForm.value;
      console.log('Logging in with:', credentials);

      // Check if user exists
      // this.auth.checkUserExists(credentials.email, credentials.password).subscribe(
      //   (user) => {
      //     if (user) {
      //       // User exists, proceed with login
      //       console.log('User found:', user);
      //       // Handle further login logic here
      //     } else {
      //       // User does not exist, handle accordingly
      //       console.log('User not found');
      //       // Show an error message to the user
      //     }
      //   },
      //   (error) => {
      //     console.error('Error checking user existence:', error);
      //   }
      // );
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      const newUser = this.registerForm.value;
      console.log('Registering user:', newUser);
      // TODO: Implement your registration service
    }
  }


}
