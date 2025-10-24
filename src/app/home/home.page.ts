import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule, LoadingController, IonInfiniteScroll, IonContent } from '@ionic/angular';
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
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.loadMovies();
  }

  async loadMovies(event?: any) {
    if (this.isLoading && !event) return;
    this.isLoading = true;

    if (!event) {
      const loading = await this.loadingCtrl.create({ message: 'Cargando cartelera...' });
      await loading.present();
    }

    this.movieService.getNowPlayingMovies(this.currentPage).subscribe({
      next: (data: any) => {
        this.movies.push(...data.results);
        this.isLoading = false;
        if (!event) this.loadingCtrl.dismiss();
        if (event) event.target.complete();
        if (data.page === data.total_pages && this.infiniteScroll) {
          this.infiniteScroll.disabled = true;
        }
      },
      error: (err: any) => {
        console.error('ERROR AL CARGAR CARTELERA:', JSON.stringify(err));
        this.isLoading = false;
        if (!event) this.loadingCtrl.dismiss();
        if (event) event.target.complete();
      }
    });
  }
  
  loadMore(event: any) {
    this.currentPage++;
    this.loadMovies(event);
  }
}