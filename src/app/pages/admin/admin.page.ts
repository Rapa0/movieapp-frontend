import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
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
  isLoading = false;

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private location: Location,
    private cdr: ChangeDetectorRef 
  ) {
    addIcons({ arrowBackOutline });
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.loadSolicitudes();
  }

  goBack() {
    this.location.back();
  }

  loadSolicitudes() {
    if (this.isLoading) return;
    this.isLoading = true;
    console.log('AdminPage: Iniciando carga de solicitudes...');

    this.authService.getPendingUsers().subscribe({
      next: (data: any) => {
        console.log('AdminPage: Solicitudes recibidas del backend:', data); 
        this.solicitudes = Array.isArray(data) ? data : [];
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err: any) => {
        console.error('AdminPage: Error cargando solicitudes:', err); 
        this.isLoading = false;
        this.solicitudes = []; 
        this.showAlert('Error', 'No se pudieron cargar las solicitudes pendientes.');
        this.cdr.detectChanges(); 
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