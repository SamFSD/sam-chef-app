import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private router: Router) { }

  canActivate() {
    //   if (!this.authService.isLoggedIn()) {
    //     // Only redirect to login if not already there
    //     if (this.router.url !== '/login') {
    //       this.router.navigate(['/login']);
    //     }
    //     return false;
    //   }
    //   return true;
    // }
  }
}