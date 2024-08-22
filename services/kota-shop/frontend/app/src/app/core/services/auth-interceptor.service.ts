import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, mergeMap, tap } from 'rxjs/operators';
import { AuthService } from '@auth0/auth0-angular';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http'; // Import HttpClient


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // Define the URL or path you want to intercept
  private readonly targetUrl = `${environment.API_BASE_PATH}`;
  

  constructor(private auth: AuthService,  private http: HttpClient  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (request.url.startsWith(this.targetUrl)) {
      return this.auth.idTokenClaims$.pipe(
        mergeMap((token: any) => {
          const accessToken = token?.__raw;

          const authRequest = request.clone({
            setHeaders: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          // Pass the modified request to the next handler
          return next.handle(authRequest);
        })
      );
    } else {
      // If the request URL doesn't match the target, proceed without interception
      return next.handle(request);
    }
  }

  checkUserExists(email: string, password: string) {
    const url = `${environment.API_BASE_PATH}/users?email=${email}&password=${password}`;
    return this.http.get<any>(url); // Assuming your backend returns a user object or an empty array if not found
  }
}
