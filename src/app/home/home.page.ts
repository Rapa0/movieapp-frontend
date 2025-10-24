import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule, LoadingController, IonInfiniteScroll, IonContent, AlertController } from '@ionic/angular';
import { MovieService } from '../services/movie.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class HomePage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  @ViewChild(IonContent) content!: IonContent;
  
  movies: any[] = [];
  currentPage = 1;
  isLoading = false;

  constructor(
    private movieService: MovieService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadMovies();
  }

  async loadMovies(event?: any) {
    if (this.isLoading && !event) return;
    this.isLoading = true;

    let loading: HTMLIonLoadingElement | undefined;
    if (!event) {
      loading = await this.loadingCtrl.create({ message: 'Cargando cartelera...' });
      await loading.present();
    }

    try {
      this.movieService.getNowPlayingMovies(this.currentPage).subscribe({
        next: (data: any) => {
          this.movies.push(...data.results);
          this.isLoading = false;
          if (event) event.target.complete();
          if (data.page === data.total_pages && this.infiniteScroll) {
            this.infiniteScroll.disabled = true;
          }
        },
        error: async (err: any) => {
          this.isLoading = false;
          if (event) event.target.complete();
          
          let errorMsg = 'Error desconocido al cargar las películas.';
          if (err.message) {
            errorMsg = err.message;
          } else if (err.error && err.error.message) {
            errorMsg = err.error.message;
          }

          const alert = await this.alertCtrl.create({
            header: 'Error de Conexión',
            message: `No se pudo cargar la cartelera. Detalles: ${errorMsg}`,
            buttons: ['OK']
          });
          await alert.present();
        }
      });
    } catch (e) {
      console.error(e);
    } finally {
      this.isLoading = false;
      if (loading) {
        await loading.dismiss();
      }
    }
  }
  
  loadMore(event: any) {
    this.currentPage++;
    this.loadMovies(event);
  }
}
