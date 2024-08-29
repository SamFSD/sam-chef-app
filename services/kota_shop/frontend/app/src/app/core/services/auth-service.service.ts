import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment._API_AUTH_BASE_PATH;

  constructor(private http: HttpClient) {}

  getProtectedData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/items`);
  }

  addItem(item: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/items`, item);
  }

  editItem(item: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/items`, item);
  }

  deleteItem(itemName: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/items/${itemName}`);
  }
}
