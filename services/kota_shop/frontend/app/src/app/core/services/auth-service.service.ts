import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '@auth0/auth0-angular';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environtment-api';
import { catchError, first, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment._API_AUTH_BASE_PATH;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getProtectedData() {
    return this.auth.idTokenClaims$.pipe(
      first(),
      switchMap((token: any) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token.__raw}`,
        });
        return this.http.get(`${this.apiUrl}/api/items`, { headers });
      }),
      catchError((error) => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }
  
}
