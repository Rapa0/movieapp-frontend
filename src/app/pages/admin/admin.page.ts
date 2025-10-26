import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class AdminPage implements OnInit {
  solicitudes: any[] = [];

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private location: Location
  ) {
    addIcons({ arrowBackOutline });
  }

  ngOnInit() {
    this.loadSolicitudes();
  }

  goBack() {
    this.location.back();
  }

  loadSolicitudes() {
    this.authService.getPendingUsers().subscribe({
      next: (data: any) => {
        this.solicitudes = data;
      },
      error: (err: any) => {
        console.error('Error cargando solicitudes', err);
      }
    });
  }

  async aprobar(userId: string) {
    this.authService.approveCriticStatus(userId).subscribe({
      next: async (res: any) => {
        await this.showAlert('Éxito', 'Usuario aprobado como crítico.');
        this.loadSolicitudes();
      },
      error: async (err: any) => {
        await this.showAlert('Error', err.error.msg || 'No se pudo aprobar la solicitud.');
      }
    });
  }

  async rechazar(userId: string) {
    this.authService.rejectCriticStatus(userId).subscribe({
      next: async (res: any) => {
        await this.showAlert('Éxito', 'Solicitud rechazada.');
        this.loadSolicitudes();
      },
      error: async (err: any) => {
        await this.showAlert('Error', err.error.msg || 'No se pudo rechazar la solicitud.');
      }
    });
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}