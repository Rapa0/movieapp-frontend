import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, SlicePipe, DatePipe, TitleCasePipe, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { MovieService } from '../../services/movie.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { EditCommentModalComponent } from '../../components/edit-comment-modal/edit-comment-modal.component';
import { addIcons } from 'ionicons';
import { trashOutline, createOutline, ribbon, star, starOutline, starHalf, personCircleOutline, arrowBackOutline, leaf, cafe, logInOutline } from 'ionicons/icons';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.page.html',
  styleUrls: ['./movie-details.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SlicePipe,
    DatePipe,
    TitleCasePipe
  ]
})
export class MovieDetailsPage implements OnInit {
  movie: any;
  comments: any[] = [];
  cast: any[] = [];
  isLoggedIn$: Observable<boolean | null>;
  commentForm: FormGroup;
  criticScore: number | null = null;
  userScore: number | null = null;
  currentUserId: string | null = null;
  currentUserRole: string = 'usuario';
  userHasCommented: boolean = false;
  private movieId = '';

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    public authService: AuthService,
    private fb: FormBuilder,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.commentForm = this.fb.group({
      texto: ['', Validators.required],
      puntuacion: [5, [Validators.required, Validators.min(1), Validators.max(10)]]
    });
    addIcons({ trashOutline, createOutline, ribbon, star, starOutline, starHalf, personCircleOutline, arrowBackOutline, leaf, cafe, logInOutline });
  }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.movieId = this.route.snapshot.paramMap.get('id') as string;
    await this.loadUserData();
    this.loadAllData();
  }

  async loadUserData() {
    if (await this.authService.isLoggedInValue()) {
      try {
        const user: any = await this.authService.getMe().toPromise();
        if (user) {
          this.currentUserId = user._id || user.id;
          this.currentUserRole = user.rol || 'usuario';
        } else {
          this.currentUserId = null;
          this.currentUserRole = 'usuario';
        }
      } catch (e) {
        console.error("Error loading user data, possibly invalid token:", e);
        this.currentUserId = null;
        this.currentUserRole = 'usuario';
      }
    } else {
      this.currentUserId = null;
      this.currentUserRole = 'usuario';
    }
  }


  loadAllData() {
    if (!this.movieId) return;
    this.movieService.getMovieDetails(this.movieId).subscribe((res: any) => this.movie = res);
    this.movieService.getMovieCredits(this.movieId).subscribe((res: any) => this.cast = res.cast.slice(0, 5));
    this.loadComments();
  }

  loadComments() {
    if (!this.movieId) return;
    this.movieService.getComments(this.movieId).subscribe((res: any) => {
      this.comments = res;
      this.calculateScores();
      this.checkIfUserHasCommented();
      this.cdr.detectChanges();
    });
  }

  checkIfUserHasCommented() {
    if (!this.currentUserId || !this.comments || this.comments.length === 0) {
      this.userHasCommented = false;
      return;
    }
    this.userHasCommented = this.comments.some(comment => comment.autor === this.currentUserId);
    console.log('User has commented:', this.userHasCommented);
  }


  calculateScores() {
    const criticComments = this.comments.filter(c => c.autorRol === 'critico');
    const userComments = this.comments.filter(c => c.autorRol === 'usuario' || c.autorRol === 'admin');

    if (criticComments.length > 0) {
        const total = criticComments.reduce((acc, c) => acc + c.puntuacion, 0);
        this.criticScore = Math.round((total / criticComments.length) * 10) / 10;
    } else {
        this.criticScore = null;
    }

    if (userComments.length > 0) {
        const total = userComments.reduce((acc, c) => acc + c.puntuacion, 0);
        this.userScore = Math.round((total / userComments.length) * 10) / 10;
    } else {
        this.userScore = null;
    }
  }


  async presentLoginAlert() {
    const alert = await this.alertController.create({
      header: 'Necesitas una cuenta',
      message: 'Para poder dejar tu reseña, por favor inicia sesión o regístrate.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Registrarse', handler: () => { this.router.navigate(['/register']); } },
        { text: 'Iniciar Sesión', handler: () => { this.router.navigate(['/login']); } }
      ]
    });
    await alert.present();
  }

  async submitComment() {
    const isLoggedIn = await this.authService.isLoggedInValue();
    const token = await this.authService.getToken();

    if (isLoggedIn !== true || !token) {
      await this.presentLoginAlert();
      return;
    }

    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    this.movieService.postComment(this.movieId, this.commentForm.value).subscribe({
      next: (response: any) => {
        this.loadComments();
        this.commentForm.reset({ puntuacion: 5 });
      },
      error: async (err: any) => {
        console.error('Error al publicar comentario:', err);
        const alert = await this.alertController.create({
          header: 'Error al Publicar',
          message: err?.error?.msg || 'No se pudo publicar el comentario. Intenta de nuevo.',
          buttons: ['OK']
        });
        await alert.present();
        if (err.status === 401) {
           console.log("Token inválido detectado al comentar, forzando logout.");
           await this.authService.logout();
        }
      }
    });
  }


  async handleDelete(commentId: string) {
    const commentToDelete = this.comments.find(c => c._id === commentId);
    if (!commentToDelete) return;

    if (commentToDelete.autor === this.currentUserId || this.currentUserRole === 'admin') {
      const alert = await this.alertController.create({
        header: 'Confirmar',
        message: '¿Estás seguro de que quieres eliminar este comentario?',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          {
            text: 'Eliminar',
            handler: () => {
              this.movieService.deleteComment(commentId).subscribe(() => this.loadComments());
            }
          }
        ]
      });
      await alert.present();
    } else {
      console.warn('Attempted to delete comment without permission.');
    }
  }

  async handleEdit(comment: any) {
    if (comment.autor === this.currentUserId) {
      const modal = await this.modalCtrl.create({
        component: EditCommentModalComponent,
        componentProps: { comment: { ...comment } }
      });
      await modal.present();
      const { data } = await modal.onDidDismiss();
      if (data) {
          this.movieService.updateComment(comment._id, data).subscribe(() => { this.loadComments(); });
      }
    } else {
      console.warn('Attempted to edit comment without permission.');
    }
  }

  goBack() {
    this.location.back();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  getRating(score: number): string[] {
    const stars = [];
    const ratingOutOfFive = score / 2;
    const fullStars = Math.floor(ratingOutOfFive);
    const hasHalfStar = ratingOutOfFive % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
        stars.push('star');
    }
    if (hasHalfStar) {
        stars.push('star-half');
    }
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
        stars.push('star-outline');
    }
    return stars;
  }


  get genreString(): string {
    if (this.movie && this.movie.genres) {
      return this.movie.genres.map((g: any) => g.name).join(', ');
    }
    return '';
  }

  canEdit(commentAutorId: string): boolean {
    if (!this.currentUserId) {
      return false;
    }
    return commentAutorId === this.currentUserId;
  }
}