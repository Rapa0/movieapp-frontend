import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { addIcons } from 'ionicons';
import { personCircle, settingsOutline, starOutline, lockClosedOutline, filmOutline, ribbonOutline, shieldCheckmarkOutline, arrowBackOutline, ribbon } from 'ionicons/icons'; // Added arrowBackOutline and ribbon
import { CriticRequestModalComponent } from '../components/critic-request-modal/critic-request-modal.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule
  ]
})
export class ProfilePage implements OnInit {
  userAuthenticated: boolean | null = null;
  userName: string = '';
  userEmail: string = '';
  currentUserRole: string = 'usuario';
  showBackButton = true; 

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private location: Location 
  ) {
    addIcons({ personCircle, settingsOutline, starOutline, lockClosedOutline, filmOutline, ribbonOutline, shieldCheckmarkOutline, arrowBackOutline, ribbon });
  }

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
        this.userAuthenticated = isLoggedIn;
        if (isLoggedIn) {
            this.loadUserData();
        } else {
            this.userName = '';
            this.userEmail = '';
            this.currentUserRole = 'usuario';
        }
    });
  }

  async ionViewWillEnter() {
    await this.checkAuthStatus();
  }

  async checkAuthStatus() {
    const isLoggedIn = await this.authService.isLoggedInValue();
    this.userAuthenticated = isLoggedIn;
     if (isLoggedIn) {
         await this.loadUserData();
     }
  }

  async loadUserData() {
     try {
         const user: any = await this.authService.getMe().toPromise();
         if(user){
             this.userName = user.nombre || 'Usuario';
             this.userEmail = user.email || '';
             this.currentUserRole = user.rol || 'usuario';
         }
     } catch (error) {
         console.error("Error loading user data", error);
         this.userAuthenticated = false; 
         this.userName = '';
         this.userEmail = '';
         this.currentUserRole = 'usuario';
     }
  }

  async onLogout() {
    await this.authService.logout();
    this.userAuthenticated = false;
    this.userName = '';
    this.userEmail = '';
    this.currentUserRole = 'usuario'; 
    this.router.navigate(['/login']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToAdminPanel() {
    this.router.navigate(['/admin']);
  }

  goBack() { 
    this.location.back();
  }

  async openCriticRequestModal() {
    const modal = await this.modalCtrl.create({
      component: CriticRequestModalComponent
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    if (data) {
      const formData = {
        motivacion: data.motivo,
        redesSocialiales: data.enlaces
      };

      this.authService.requestCriticStatus(formData).subscribe({
        next: async (res: any) => {
          const alert = await this.alertCtrl.create({
            header: 'Solicitud Enviada',
            message: 'Tu solicitud para ser crítico ha sido enviada. Será revisada por un administrador.',
            buttons: ['OK']
          });
          await alert.present();
          this.loadUserData();
        },
        error: async (err: any) => {
          const alert = await this.alertCtrl.create({
            header: 'Error',
            message: err.error.msg || 'No se pudo enviar la solicitud. Es posible que ya tengas una pendiente.',
            buttons: ['OK']
          });
          await alert.present();
        }
      });
    }
  }
}