import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, map, switchMap, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Storage } from '@ionic/storage-angular';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private tmdbUrl = 'https://api.themoviedb.org/3';
  private backendUrl = 'https://movieapp-backend-production-4a5b.up.railway.app';
  private _storage: Storage | null = null;
  private apiKey = environment.apiKey;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private storage: Storage
  ) {
    this.initStorage();
  }

  async initStorage() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  async getToken(): Promise<string | null> {
    if (!this._storage) {
      await this.initStorage();
    }
    return await this._storage!.get('authToken');
  }

  getNowPlayingMovies(page = 1): Observable<any> {
    return this.http.get(`${this.tmdbUrl}/movie/now_playing?api_key=${this.apiKey}&page=${page}&language=es-ES`);
  }

  getTopRatedMovies(page = 1): Observable<any> {
    return this.http.get(`${this.tmdbUrl}/movie/top_rated?api_key=${this.apiKey}&page=${page}&language=es-ES`);
  }

  getUpcomingMovies(page = 1): Observable<any> {
    return this.http.get(`${this.tmdbUrl}/movie/upcoming?api_key=${this.apiKey}&page=${page}&language=es-ES`);
  }
  
  getMovieDetails(id: string): Observable<any> {
    return this.http.get(`${this.backendUrl}/api/peliculas/${id}`);
  }
  
  getMovieCredits(movieId: string): Observable<any> {
    return this.http.get(`${this.tmdbUrl}/movie/${movieId}/credits?api_key=${this.apiKey}&language=es-ES`);
  }

  searchMovies(query: string): Observable<any> {
    return this.http.get(`${this.tmdbUrl}/search/movie?api_key=${this.apiKey}&query=${query}&language=es-ES`);
  }

  getGenres(): Observable<any> {
    return this.http.get(`${this.tmdbUrl}/genre/movie/list?api_key=${this.apiKey}&language=es-ES`);
  }

  getMoviesByGenre(genreId: string, page = 1): Observable<any> {
    return this.http.get(`${this.tmdbUrl}/discover/movie?api_key=${this.apiKey}&with_genres=${genreId}&page=${page}&language=es-ES`);
  }

  getComments(movieId: string): Observable<any> {
    return this.http.get(`${this.backendUrl}/api/comentarios/${movieId}`);
  }

  postComment(movieId: string, commentData: any): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('x-auth-token', token || '');
        return this.http.post(`${this.backendUrl}/api/comentarios/${movieId}`, commentData, { headers });
      })
    );
  }

  updateComment(commentId: string, commentData: any): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('x-auth-token', token || '');
        return this.http.put(`${this.backendUrl}/api/comentarios/${commentId}`, commentData, { headers });
      })
    );
  }

  deleteComment(commentId: string): Observable<any> {
    return from(this.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders().set('x-auth-token', token || '');
        return this.http.delete(`${this.backendUrl}/api/comentarios/${commentId}`, { headers });
      })
    );
  }
}