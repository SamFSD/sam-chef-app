import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendService } from '../api-service/backend.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  title = 'app';
  isHandled: boolean = false;
  isLogin = true;
  loginForm!: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private api: BackendService,
    public router: Router ,
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

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
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