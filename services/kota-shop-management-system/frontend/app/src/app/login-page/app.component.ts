import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { MaterialModule } from '../material/material.module';
import { BackendService } from '../api-service/backend.service';
import { AuthService } from '@auth0/auth0-angular';

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
    public auth: AuthService,
    private fb: FormBuilder,
    private api: BackendService,
    public router: Router 
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
    this.api.getAllData().subscribe(
      allData => {
        console.log('allData:', allData);
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
      // Use Auth0 for login
      this.auth.loginWithRedirect().subscribe({
        next: () => {
          // Perform navigation only after successful login
          this.router.navigate(['/dashboard']).then(success => {
            if (success) {
              console.log('Navigation to /dashboard was successful');
            } else {
              console.log('Navigation to /dashboard failed');
            }
          });
        },
        error: (err) => {
          console.error('Login error:', err);
        }
      });
    }
  }


  onRegister() {
    if (this.registerForm.valid) {
      const newUser = this.registerForm.value;
      console.log('Registering user:', newUser);

      // Fetch existing users to get the next ID
      this.api.getUsers().subscribe(users => {
        const maxId = Math.max(...users.map((user: any) => user.id), 0);
        const newUserWithId = { ...newUser, id: maxId + 1 };

        // Add new user to the backend
        this.api.addUser(newUserWithId).subscribe(
          response => {
            console.log('User registered successfully:', response);
            // reset the form 
            this.registerForm.reset();
          },
          error => {
            console.log('Error registering user:', error);
          }
        );
      });
    }
  }
}