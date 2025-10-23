import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule, LoadingController } from '@ionic/angular';
import { MovieService } from '../services/movie.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class HomePage implements OnInit {
  public movies: any[] = [];
  private currentPage = 1;
  private sortBy = 'popularity.desc';
  public infiniteScroll: any;


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
        if (!event) { loading.dismiss(); }
        if (event) { event.target.complete(); }
        if (data.page === data.total_pages) {
          if (this.infiniteScroll) this.infiniteScroll.disabled = true;
        }
      },
      error: (err) => {
        console.error(err);
        if (!event) { loading.dismiss(); }
      }
    });
  }
  
  loadMore(event: any) {
    this.currentPage++;
    this.loadMovies(event);
    this.infiniteScroll = event.target;
  }

  onSortChange(event: any) {
    this.sortBy = event.detail.value;
    this.movies = [];
    this.currentPage = 1;
    if (this.infiniteScroll) this.infiniteScroll.disabled = false;
    this.loadMovies();
  }
}