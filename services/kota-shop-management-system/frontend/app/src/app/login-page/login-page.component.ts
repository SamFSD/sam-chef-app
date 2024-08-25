import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BackendService } from '../api-service/backend.service';
import { Router, RouterOutlet } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule, CommonModule, RouterOutlet],
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
    private authService: AuthService
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

  ngOnInit(): void {

  }

  toggleView() {
    this.isLogin = !this.isLogin;
  }
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  onLogin() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      console.log('Logging in with:', credentials);
      this.router.navigate(['dashboard']);
    }
  }
  


  onRegister() {
    if (this.registerForm.valid) {
      const newUser = this.registerForm.value;
      console.log('Registering user:', newUser);



    }
  }
}

function openSnackBar(message: any, string: any, action: any, string1: any) {
  throw new Error('Function not implemented.');
}
