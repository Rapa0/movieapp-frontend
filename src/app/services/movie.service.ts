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
  private backendUrl = 'https://movieapp-backend-nmo9.onrender.com';
  private _storage: Storage | null = null;

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

  getLocalScores(movieIds: number[]): Observable<any> {
    return this.http.post(`${this.backendUrl}/api/comentarios/local-scores`, { movieIds });
  }

  private mapTmdbResponse(response: any): any {
    if (response && Array.isArray(response.results)) {
      response.results = response.results.map((movie: any) => ({
        ...movie,
        userScore: null,
        criticScore: null
      }));
    }
    return response;
  }


  getNowPlayingMovies(page = 1): Observable<any> {
    return this.http.get(`${this.backendUrl}/api/peliculas/now-playing?page=${page}`)
      .pipe(map(this.mapTmdbResponse));
  }

  getTopRatedMovies(page = 1): Observable<any> {
    return this.http.get(`${this.backendUrl}/api/peliculas/top-rated?page=${page}`)
      .pipe(map(this.mapTmdbResponse));
  }

  getUpcomingMovies(page = 1): Observable<any> {
    return this.http.get(`${this.backendUrl}/api/peliculas/upcoming?page=${page}`)
      .pipe(map(this.mapTmdbResponse));
  }

  getMovieCredits(movieId: string): Observable<any> {
    return this.http.get(`${this.backendUrl}/api/peliculas/${movieId}/credits`);
  }

  searchMovies(query: string, page = 1): Observable<any> {
    return this.http.get(`${this.backendUrl}/api/peliculas/search?query=${query}&page=${page}`)
      .pipe(map(this.mapTmdbResponse));
  }

  getGenres(): Observable<any> {
    return this.http.get(`${this.backendUrl}/api/peliculas/genres`);
  }

  getMoviesByGenre(genreId: string, page = 1): Observable<any> {
    return this.http.get(`${this.backendUrl}/api/peliculas/genre/${genreId}?page=${page}`)
      .pipe(map(this.mapTmdbResponse));
  }

  getMovieDetails(id: string): Observable<any> {
    return this.http.get(`${this.backendUrl}/api/peliculas/${id}`);
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