import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonSkeletonText,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent, 
  LoadingController,
  IonContent as IonContentClass,
  AlertController
} from '@ionic/angular/standalone';
import { MovieService } from '../services/movie.service';
import { addIcons } from 'ionicons';
import { filmOutline, videocamOffOutline } from 'ionicons/icons';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonSkeletonText,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent
  ],
})
export class HomePage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  @ViewChild(IonContent) content!: IonContentClass;

  movies: any[] = [];
  currentPage = 1;
  isLoading = false;
  selectedSegment: string = 'recientes';

  constructor(
    private movieService: MovieService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    addIcons({ filmOutline, videocamOffOutline });
  }

  ngOnInit() {
    this.loadInitialMovies();
  }

  getApiCall(page: number): Observable<any> {
    switch (this.selectedSegment) {
      case 'top_rated':
        return this.movieService.getTopRatedMovies(page);
      case 'upcoming':
        return this.movieService.getUpcomingMovies(page);
      default:
        return this.movieService.getNowPlayingMovies(page);
    }
  }

  async loadInitialMovies() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.currentPage = 1;
    this.movies = []; 
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = true;
    }
    await this.content?.scrollToTop(0);
    
    const loading = await this.loadingCtrl.create({ 
      message: 'Cargando...',
      duration: 10000,
      spinner: 'crescent'
    });
    await loading.present();

    this.getApiCall(this.currentPage).subscribe({
      next: (data: any) => {
        this.movies = data.results; 
        this.isLoading = false;
        loading.dismiss();
        
        if (this.infiniteScroll) {
            if (data.page < data.total_pages) {
                this.infiniteScroll.disabled = false;
            } else {
                this.infiniteScroll.disabled = true;
            }
        }
      },
      error: (err: any) => {
        this.handleApiError(err, loading);
      }
    });
  }

  loadMore(event: any) {
    if (this.isLoading) {
      if (event) event.target.complete();
      return;
    }
    this.currentPage++;
    this.loadMoreMovies(event);
  }

  loadMoreMovies(event: any) {
    this.isLoading = true; 
    
    this.getApiCall(this.currentPage).subscribe({
      next: (data: any) => {
        this.movies.push(...data.results);
        this.isLoading = false;
        event.target.complete(); 

        if (data.page === data.total_pages && this.infiniteScroll) {
          this.infiniteScroll.disabled = true;
        }
      },
      error: (err: any) => {
        this.handleApiError(err, event.target);
      }
    });
  }
  
  segmentChanged(event: any) {
    this.loadInitialMovies();
  }

  async handleApiError(err: any, loader: any) {
    this.isLoading = false;
    if (loader) {
      if (typeof loader.dismiss === 'function') {
        loader.dismiss();
      }
      if (typeof loader.complete === 'function') {
        loader.complete();
      }
    }
    console.error('Error al cargar películas:', err);
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: 'No se pudieron cargar las películas.',
      buttons: ['OK']
    });
    await alert.present();
  }
}