import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { MovieService } from '../../services/movie.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { EditCommentModalComponent } from '../../components/edit-comment-modal/edit-comment-modal.component';
import { addIcons } from 'ionicons';
import { trashOutline, createOutline, ribbon } from 'ionicons/icons';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.page.html',
  styleUrls: ['./movie-details.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class MovieDetailsPage implements OnInit {
  movie: any;
  comments: any[] = [];
  cast: any[] = [];
  isLoggedIn$: Observable<boolean | null>; // Corrected type to accept null
  commentForm: FormGroup;
  criticScore: number | null = null;
  userScore: number | null = null;
  currentUserId: string | null = null;
  showCommentForm = false;
  private movieId = '';

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private authService: AuthService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private router: Router
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$; // Assign the Observable<boolean | null>
    this.commentForm = this.fb.group({
      texto: ['', Validators.required],
      puntuacion: [5, Validators.required]
    });
    addIcons({ trashOutline, createOutline, ribbon });
  }

  ngOnInit() {
    this.movieId = this.route.snapshot.paramMap.get('id') as string;
    this.loadAllData();
  }

  // Corrected: Use async/await for getUserId
  async ionViewWillEnter() { 
    this.currentUserId = await this.authService.getUserId(); 
  }

  loadAllData() {
    this.movieService.getMovieDetails(this.movieId).subscribe(res => this.movie = res);
    this.movieService.getMovieCredits(this.movieId).subscribe(res => this.cast = res.cast.slice(0, 5));
    this.loadComments();
  }
  
  loadComments() {
    this.movieService.getComments(this.movieId).subscribe(res => {
      this.comments = res;
      this.calculateScores();
    });
  }

  calculateScores() {
    const criticComments = this.comments.filter(c => c.autorRol === 'critico');
    const userComments = this.comments.filter(c => c.autorRol === 'usuario');
    if (criticComments.length > 0) {
        const total = criticComments.reduce((acc, c) => acc + c.puntuacion, 0);
        this.criticScore = Math.round((total / criticComments.length) * 10) / 10;
    } else { this.criticScore = null; }
    if (userComments.length > 0) {
        const total = userComments.reduce((acc, c) => acc + c.puntuacion, 0);
        this.userScore = Math.round((total / userComments.length) * 10) / 10;
    } else { this.userScore = null; }
  }

  async promptComment() {
    // Check login status asynchronously if needed, or use the synchronous check cautiously
    const isLoggedIn = this.authService.isLoggedInValue(); 
    if (isLoggedIn === true) { // Explicitly check for true, ignoring null
      this.showCommentForm = true;
    } else if (isLoggedIn === false) { // Handle case where user is definitely logged out
      const alert = await this.alertController.create({
        header: 'Inicia Sesión',
        message: 'Necesitas una cuenta para poder dejar tu reseña.',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Iniciar Sesión', handler: () => { this.router.navigate(['/login']); } }
        ]
      });
      await alert.present();
    } 
    // If isLoggedIn is null, you might want to show a loading state or disable the button
  }

  submitComment() {
    if (this.commentForm.invalid) return;
    this.movieService.postComment(this.movieId, this.commentForm.value).subscribe(() => {
      this.loadComments();
      this.commentForm.reset({ puntuacion: 5 });
      this.showCommentForm = false;
    });
  }

  async handleDelete(commentId: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que quieres eliminar este comentario?',
      buttons: [ { text: 'Cancelar', role: 'cancel' }, { text: 'Eliminar', handler: () => { this.movieService.deleteComment(commentId).subscribe(() => this.loadComments()); } } ]
    });
    await alert.present();
  }
  
  async handleEdit(comment: any) {
    const modal = await this.modalCtrl.create({ component: EditCommentModalComponent, componentProps: { comment: comment } });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
        this.movieService.updateComment(comment._id, data).subscribe(() => { this.loadComments(); });
    }
  }
}