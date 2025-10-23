import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private tmdbUrl = 'https://api.themoviedb.org/3';
  private backendUrl = 'http://Movieapp-backend-env.eba-tekfyuuq.us-east-2.elasticbeanstalk.com ';

  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) {}

  getPopularMovies(page = 1, sortBy = 'popularity.desc'): Observable<any> {
    const apiKey = environment.apiKey;
    return this.http.get(`${this.tmdbUrl}/discover/movie?api_key=${apiKey}&page=${page}&sort_by=${sortBy}&language=es-ES`);
  }
  
  getMovieDetails(id: string): Observable<any> {
    return this.http.get(`${this.backendUrl}/api/peliculas/${id}`);
  }
  
  getMovieCredits(movieId: string): Observable<any> {
    const apiKey = environment.apiKey;
    return this.http.get(`${this.tmdbUrl}/movie/${movieId}/credits?api_key=${apiKey}&language=es-ES`);
  }

  searchMovies(query: string): Observable<any> {
    const apiKey = environment.apiKey;
    return this.http.get(`${this.tmdbUrl}/search/movie?api_key=${apiKey}&query=${query}&language=es-ES`);
  }

  getGenres(): Observable<any> {
    const apiKey = environment.apiKey;
    return this.http.get(`${this.tmdbUrl}/genre/movie/list?api_key=${apiKey}&language=es-ES`);
  }

  getMoviesByGenre(genreId: string, page = 1): Observable<any> {
    const apiKey = environment.apiKey;
    return this.http.get(`${this.tmdbUrl}/discover/movie?api_key=${apiKey}&with_genres=${genreId}&page=${page}&language=es-ES`);
  }

  getComments(movieId: string): Observable<any> {
    return this.http.get(`${this.backendUrl}/api/comentarios/${movieId}`);
  }

  postComment(movieId: string, commentData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('x-auth-token', token || '');
    return this.http.post(`${this.backendUrl}/api/comentarios/${movieId}`, commentData, { headers });
  }
  
  updateComment(commentId: string, commentData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('x-auth-token', token || '');
    return this.http.put(`${this.backendUrl}/api/comentarios/${commentId}`, commentData, { headers });
  }

  deleteComment(commentId: string): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('x-auth-token', token || '');
    return this.http.delete(`${this.backendUrl}/api/comentarios/${commentId}`, { headers });
  }
}