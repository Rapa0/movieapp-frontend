import { Component, OnInit, ViewChild } from '@angular/core';
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
import { filmOutline, videocamOffOutline, personCircleOutline } from 'ionicons/icons';

@Component({
    selector: 'app-search',
    templateUrl: 'search.page.html',
    styleUrls: ['search.page.scss'],
    standalone: true,
    imports: [ 
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
    @ViewChild(IonSearchbar) searchbar!: IonSearchbar;
    searchResults: any[] = [];
    genres: any[] = [];

    constructor(private movieService: MovieService) {
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