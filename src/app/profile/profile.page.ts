import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ModalController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { CriticRequestModalComponent } from '../components/critic-request-modal/critic-request-modal.component';
import { addIcons } from 'ionicons';
import { hourglassOutline, ribbonOutline } from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class ProfilePage {
  isLoggedIn$: Observable<boolean>;
  user: any = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private modalCtrl: ModalController
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    addIcons({ hourglassOutline, ribbonOutline });
  }

  ionViewWillEnter() {
    this.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.authService.getMe().subscribe({
          next: (userData) => { this.user = userData; },
          error: (err) => { if (err.status === 401) { this.authService.logout(); } }
        });
      } else {
        this.user = null;
      }
    });
  }

  async requestCritic() {
    const modal = await this.modalCtrl.create({ component: CriticRequestModalComponent });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
        this.authService.requestCriticStatus(data).subscribe(() => {
            if (this.user) this.user.estado = 'pendiente_critico';
        });
    }
  }

  logout() {
    this.authService.logout();
    this.user = null;
    this.router.navigate(['/tabs/home']);
  }
}