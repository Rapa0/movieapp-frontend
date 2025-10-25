import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap, map, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Storage } from '@ionic/storage-angular'; // Importa Ionic Storage

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://movieapp-backend-production-4a5b.up.railway.app/api';
  private tokenKey = 'authToken';
  private _storage: Storage | null = null; // Variable para la instancia de Storage

  private isLoggedInSubject = new BehaviorSubject<boolean | null>(null);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private storage: Storage) { 
    this.initStorage(); // Inicializa el storage
  }

  async initStorage() {
    // Crea la instancia de storage (necesario una vez)
    const storage = await this.storage.create();
    this._storage = storage;
    await this.loadToken(); // Carga el token después de inicializar
  }

  private async loadToken() {
    if (!this._storage) {
        console.error('Storage not initialized');
        this.isLoggedInSubject.next(false);
        return;
    }
    const token = await this._storage.get(this.tokenKey);
    this.isLoggedInSubject.next(!!token);
  }

  public isLoggedInValue(): boolean | null {
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
      // Usamos switchMap para manejar la promesa de storage.set
      switchMap(response => {
        if (!this._storage) {
          throw new Error('Storage not initialized before login');
        }
        return from(this._storage.set(this.tokenKey, response.token)).pipe(map(() => response)); // Devuelve la respuesta original
      }),
      tap(() => {
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

  async logout(): Promise<void> {
     if (!this._storage) {
        console.error('Storage not initialized');
        return;
    }
    await this._storage.remove(this.tokenKey);
    this.isLoggedInSubject.next(false);
  }
  
  async getToken(): Promise<string | null> {
     if (!this._storage) {
        console.error('Storage not initialized');
        return null;
    }
    return await this._storage.get(this.tokenKey);
  }

  async getUserId(): Promise<string | null> {
    const token = await this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.usuario.id; 
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }

  getMe(): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        if (!token) return of(null); // Si no hay token, devuelve observable nulo
        const headers = new HttpHeaders().set('x-auth-token', token);
        return this.http.get(`${this.baseUrl}/usuarios/me`, { headers });
      })
    );
  }

  requestCriticStatus(applicationData: any): Observable<any> {
     return from(this.getToken()).pipe(
      switchMap(token => {
        if (!token) return of(null);
        const headers = new HttpHeaders().set('x-auth-token', token);
        return this.http.post(`${this.baseUrl}/usuarios/solicitar-critico`, applicationData, { headers });
      })
    );
  }

  getPendingUsers(): Observable<any> {
     return from(this.getToken()).pipe(
      switchMap(token => {
        if (!token) return of(null);
        const headers = new HttpHeaders().set('x-auth-token', token);
        return this.http.get(`${this.baseUrl}/usuarios/pendientes`, { headers });
      })
    );
  }
  
  approveCriticStatus(userId: string): Observable<any> {
     return from(this.getToken()).pipe(
      switchMap(token => {
        if (!token) return of(null);
        const headers = new HttpHeaders().set('x-auth-token', token);
        return this.http.put(`${this.baseUrl}/usuarios/aprobar-critico/${userId}`, {}, { headers });
      })
    );
  }

  rejectCriticStatus(userId: string): Observable<any> {
     return from(this.getToken()).pipe(
      switchMap(token => {
        if (!token) return of(null);
        const headers = new HttpHeaders().set('x-auth-token', token);
        return this.http.put(`${this.baseUrl}/usuarios/rechazar-critico/${userId}`, {}, { headers });
      })
    );
  }
}
