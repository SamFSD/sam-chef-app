import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'  
})
export class BackendService {
  private apiUrl = 'http://localhost:8080/api'; 


  constructor(private http: HttpClient) {}

  getAllData(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }
  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  getItems(): Observable<any> {
    return this.http.get(`${this.apiUrl}/items`);
  }
  addUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users`, user);
  }
}
