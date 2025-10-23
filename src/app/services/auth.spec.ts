import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:3000/api/usuarios'; 

  constructor(private http: HttpClient) { }

  register(userData: any) {
    return this.http.post(`${this.baseUrl}/registro`, userData);
  }

  login(credentials: any) {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }
}