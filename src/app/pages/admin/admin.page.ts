import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, closeCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class AdminPage {
  pendingUsers: any[] = [];

  constructor(private authService: AuthService, private router: Router) {
    addIcons({ checkmarkCircleOutline, closeCircleOutline });
  }

  ionViewWillEnter() {
    this.authService.getMe().subscribe((user: any) => {
      if (user.rol !== 'admin') {
        this.router.navigate(['/tabs/home']);
      } else {
        this.loadPendingUsers();
      }
    });
  }

  loadPendingUsers() {
    this.authService.getPendingUsers().subscribe((users: any) => {
      this.pendingUsers = users;
    });
  }

  approve(userId: string) {
    this.authService.approveCriticStatus(userId).subscribe(() => {
      this.loadPendingUsers();
    });
  }

  reject(userId: string) {
    this.authService.rejectCriticStatus(userId).subscribe(() => {
      this.loadPendingUsers();
    });
  }
}