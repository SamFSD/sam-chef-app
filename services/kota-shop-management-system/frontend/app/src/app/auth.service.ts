import { Injectable } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth0: Auth0Service, private router: Router) { }

  login() {
    this.auth0.loginWithRedirect();
  }

  logout() {
    this.auth0.logout({ logoutParams: { returnTo: window.location.origin } });
  }

  isLoggedIn() {
    return this.auth0.isAuthenticated$;
  }

  canActivate() {
    return this.isLoggedIn().subscribe(isAuthenticated => {
      if (!isAuthenticated) {
        this.router.navigate(['']);
        return false;
      }
      return true;
    });
  }
}
