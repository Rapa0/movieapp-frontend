import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://Movieapp-backend-env.eba-tekfyuuq.us-east-2.elasticbeanstalk.com ';
  
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) { }

  private hasToken(): boolean {
    return !!localStorage.getItem('authToken');
  }

  public isLoggedInValue(): boolean {
    return this.isLoggedInSubject.getValue();
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/registro`, user);
  }

  verifyCode(data: { email: string, codigo: string }): Observable<any> {
    return this.http.post<{ token: string }>(`${this.baseUrl}/auth/verificar`, data);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<{ token: string }>(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('authToken', response.token);
        this.isLoggedInSubject.next(true);
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/forgot-password`, { email });
  }

  verifyResetCode(data: { email: string, codigo: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/verify-reset-code`, data);
  }

  resetPasswordByCode(data: { email: string, codigo: string, password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/reset-password`, data);
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.isLoggedInSubject.next(false);
  }
  
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.usuario.id;
    } catch (error) {
      return null;
    }
  }

  getMe(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('x-auth-token', token || '');
    return this.http.get(`${this.baseUrl}/usuarios/me`, { headers });
  }

  requestCriticStatus(applicationData: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('x-auth-token', token || '');
    return this.http.post(`${this.baseUrl}/usuarios/solicitar-critico`, applicationData, { headers });
  }

  getPendingUsers(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('x-auth-token', token || '');
    return this.http.get(`${this.baseUrl}/usuarios/pendientes`, { headers });
  }
  
  approveCriticStatus(userId: string): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('x-auth-token', token || '');
    return this.http.put(`${this.baseUrl}/usuarios/aprobar-critico/${userId}`, {}, { headers });
  }

  rejectCriticStatus(userId: string): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('x-auth-token', token || '');
    return this.http.put(`${this.baseUrl}/usuarios/rechazar-critico/${userId}`, {}, { headers });
  }
}