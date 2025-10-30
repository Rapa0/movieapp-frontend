import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  IonSearchbar,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardTitle,
  IonIcon,
  IonTitle,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  LoadingController,
  AlertController
} from '@ionic/angular/standalone';
import { MovieService } from '../services/movie.service';
import { addIcons } from 'ionicons';
import { filmOutline, videocamOffOutline, personCircleOutline } from 'ionicons/icons';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: 'search.page.html',
  styleUrls: ['search.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    IonSearchbar,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardTitle,
    IonIcon,
    IonTitle,
    IonInfiniteScroll,
    IonInfiniteScrollContent
  ],
})
export class SearchPage implements OnInit {
  @ViewChild(IonSearchbar) searchbar!: IonSearchbar;
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  @ViewChild(IonContent) content!: IonContent;

  searchResults: any[] = [];
  genres: any[] = [];
  currentPage = 1;
  selectedGenreId: string | null = null;
  currentSearchQuery: string = '';
  isLoading = false;
  totalPages = 1;

  constructor(
    private movieService: MovieService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ filmOutline, videocamOffOutline, personCircleOutline });
  }

  ngOnInit() {
    this.movieService.getGenres().subscribe(data => {
      this.genres = data.genres;
    });
  }

  ionViewDidEnter() {
    if (this.searchbar) {
      setTimeout(() => {
        const nativeEl = (this.searchbar as any).el?.querySelector('input');
        if (nativeEl) {
          nativeEl.focus();
        } else if (typeof this.searchbar.setFocus === 'function') {
          this.searchbar.setFocus();
        }
      }, 300);
    }
    // Deshabilitar el scroll al entrar a la página, ya que no hay nada cargado
    if (this.infiniteScroll) {
        this.infiniteScroll.disabled = true;
    }
  }

  async handleSearch(event: any) {
    if (this.isLoading) return;
    const query = event.target.value.toLowerCase().trim();
    this.currentSearchQuery = query;
    this.selectedGenreId = null;
    this.currentPage = 1;
    this.searchResults = [];
    this.totalPages = 1;
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = true;
    }
    await this.content?.scrollToTop(0);

    if (query && query.length > 0) {
      this.isLoading = true;
      const loading = await this.loadingCtrl.create({ message: 'Buscando...' });
      await loading.present();
      this.movieService.searchMovies(query, this.currentPage).subscribe({
        next: (res: any) => {
          this.searchResults = res.results || [];
          this.totalPages = res.total_pages || 1;
          this.isLoading = false;
          loading.dismiss();
          if (this.infiniteScroll) {
            this.infiniteScroll.disabled = this.currentPage >= this.totalPages;
          }
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.handleApiError(err, loading);
        }
      });
    } else {
      this.searchResults = [];
      if (this.infiniteScroll) { // Deshabilitar si la búsqueda está vacía
        this.infiniteScroll.disabled = true;
      }
      this.cdr.detectChanges();
    }
  }

  async handleGenreChange(event: any) {
    if (this.isLoading) return;
    const genreId = event.detail.value;
    if (!genreId) {
      this.searchResults = [];
      this.selectedGenreId = null;
      if (this.infiniteScroll) this.infiniteScroll.disabled = true;
      return;
    }

    this.selectedGenreId = genreId;
    this.currentSearchQuery = '';
    this.currentPage = 1;
    this.searchResults = [];
    this.totalPages = 1;
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = true;
    }
    await this.content?.scrollToTop(0);

    this.isLoading = true;
    const loading = await this.loadingCtrl.create({ message: 'Cargando género...' });
    await loading.present();
    this.movieService.getMoviesByGenre(genreId, this.currentPage).subscribe({
      next: (res: any) => {
        this.searchResults = res.results || [];
        this.totalPages = res.total_pages || 1;
        this.isLoading = false;
        loading.dismiss();
        // Habilitar el scroll si hay más páginas
        if (this.infiniteScroll) {
          this.infiniteScroll.disabled = this.currentPage >= this.totalPages;
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.handleApiError(err, loading);
      }
    });
  }

  
  loadMore(event: any) {
    // La guarda 'isLoading' previene ejecuciones múltiples
    if (this.isLoading) {
        if (event) event.target.complete();
        return;
    }
    
    // Comprobar si hemos llegado al final
    if (this.currentPage >= this.totalPages) {
      if (event) event.target.complete();
      if (this.infiniteScroll) this.infiniteScroll.disabled = true;
      return;
    }
    
    // Si no hay género o búsqueda, no hacer nada
    if (!this.selectedGenreId && !this.currentSearchQuery) {
      if (event) event.target.complete();
      if (this.infiniteScroll) this.infiniteScroll.disabled = true;
      return;
    }

    this.currentPage++;
    this.loadMoreMovies(event);
  }

  
  loadMoreMovies(event: any) {
    this.isLoading = true; // Prevenir más cargas mientras esta está en curso

    let apiCall: Observable<any>;

    if (this.selectedGenreId) {
      apiCall = this.movieService.getMoviesByGenre(this.selectedGenreId, this.currentPage);
    } else if (this.currentSearchQuery) {
      apiCall = this.movieService.searchMovies(this.currentSearchQuery, this.currentPage);
    } else {
      if (event) event.target.complete();
      this.isLoading = false;
      return;
    }

    apiCall.subscribe({
      next: (res: any) => {
        this.searchResults.push(...(res.results || []));
        this.totalPages = res.total_pages || 1;
        this.isLoading = false;
        if (event) event.target.complete();
        
        // Volver a comprobar si hemos llegado al final
        if (this.infiniteScroll) {
          this.infiniteScroll.disabled = this.currentPage >= this.totalPages;
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        if (event) event.target.complete();
        console.error('Error loading more movies:', err);
        this.cdr.detectChanges();
      }
    });
  }

  async handleApiError(err: any, loader: any) {
    this.isLoading = false;
    if (loader && typeof loader.dismiss === 'function') {
      loader.dismiss();
    }
    // Si hay un error, deshabilitar el scroll para evitar bucles
    if (this.infiniteScroll) {
        this.infiniteScroll.disabled = true;
    }
    console.error('Error loading movies:', err);
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: 'No se pudieron cargar las películas.',
      buttons: ['OK']
    });
    await alert.present();
    this.cdr.detectChanges();
  }
}