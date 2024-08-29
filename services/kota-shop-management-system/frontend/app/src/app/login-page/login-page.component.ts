import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BackendService } from '../api-service/backend.service';
import { Router, RouterOutlet } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthModule } from '@auth0/auth0-angular';


@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule, CommonModule, RouterOutlet, AuthModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  isHandled: boolean = false;
  isLogin = true;
  loginForm!: FormGroup;
  registerForm: FormGroup;
  private _snackBar = inject(MatSnackBar)

  constructor(
    private fb: FormBuilder,
    private api: BackendService,
    public router: Router,
   
    public authService: AuthService
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

  ngOnInit(): void { }

  toggleView() {
    this.isLogin = !this.isLogin;
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  onLogin() {
    if (this.loginForm.valid) {
      console.log('Logging in with:', this.loginForm.value);
      this.authService.login();
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      console.log('Registering user:', this.registerForm.value);
      // Implement your registration logic with Auth0 or backend here
    }
  }
}
