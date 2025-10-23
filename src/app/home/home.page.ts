import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule, LoadingController, IonInfiniteScroll } from '@ionic/angular';
import { MovieService } from '../services/movie.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class HomePage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll | null = null;
  
  movies: any[] = [];
  currentPage = 1;
  sortBy = 'popularity.desc';

  constructor(
    private movieService: MovieService,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.loadMovies();
  }

  async loadMovies(event?: any) {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando...',
      spinner: 'bubbles',
    });
    if (!event) {
      await loading.present();
    }

    this.movieService.getPopularMovies(this.currentPage, this.sortBy).subscribe({
      next: (data) => {
        this.movies.push(...data.results);
        if (!event) {
          loading.dismiss();
        }
        if (event) {
          event.target.complete();
        }
        if (data.page === data.total_pages && this.infiniteScroll) {
          this.infiniteScroll.disabled = true;
        }
      },
      error: (err) => {
        console.error('ERROR AL CARGAR PELÍCULAS:', JSON.stringify(err));
        if (!event) {
          loading.dismiss();
        }
        if (event) {
          event.target.complete();
        }
      }
    });
  }
  
  loadMore(event: any) {
    this.currentPage++;
    this.loadMovies(event);
  }

  onSortChange(event: any) {
    this.sortBy = event.detail.value;
    this.movies = [];
    this.currentPage = 1;
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
    this.loadMovies();
  }
}