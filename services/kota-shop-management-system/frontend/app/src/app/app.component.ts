import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Add this import
import { MaterialModule } from './material/material.module';
import { BackendService } from './api-service/backend.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MaterialModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';
  isHandled: boolean = false;
  isLogin = true;
  loginForm!: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private api: BackendService,
    public router: Router // Inject Router
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
    this.api.getUsers().subscribe(
      users => {
        console.log('Users:', users);
      },
      error => {
        console.log('Error fetching users:', error);
      }
    );
  }

  toggleView() {
    this.isLogin = !this.isLogin;
  }

  onLogin() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      console.log('Logging in with:', credentials);
  
      // Perform navigation and log the result
      this.router.navigate(['/dashboard']).then(success => {
        if (success) {
          console.log('Navigation to /dashboard was successful');
        } else {
          console.log('Navigation to /dashboard failed');
        }
      }).catch(error => {
        console.log('Navigation error:', error);
      });
    }
  }
  

  onRegister() {
    if (this.registerForm.valid) {
      const newUser = this.registerForm.value;
      console.log('Registering user:', newUser);
    }
  }
}
