import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  IonTitle
} from '@ionic/angular/standalone';
import { MovieService } from '../services/movie.service';
import { addIcons } from 'ionicons';
import { filmOutline, videocamOffOutline } from 'ionicons/icons';

@Component({
  selector: 'app-search',
  templateUrl: 'search.page.html',
  styleUrls: ['search.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
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
    IonTitle
  ],
})
export class SearchPage implements OnInit {
  searchResults: any[] = [];
  genres: any[] = [];

  constructor(private movieService: MovieService) {
    addIcons({ filmOutline, videocamOffOutline });
  }

  ngOnInit() {
    this.movieService.getGenres().subscribe(data => {
      this.genres = data.genres;
    });
  }

  handleSearch(event: any) {
    const query = event.target.value.toLowerCase();
    if (query && query.trim() !== '') {
      this.movieService.searchMovies(query).subscribe(data => {
        this.searchResults = data.results;
      });
    } else {
      this.searchResults = [];
    }
  }
  
  handleGenreChange(event: any) {
    const genreId = event.detail.value;
    if (genreId) {
      this.movieService.getMoviesByGenre(genreId).subscribe(data => {
        this.searchResults = data.results;
      });
    }
  }
}