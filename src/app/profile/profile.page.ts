import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { addIcons } from 'ionicons';
import { personCircle, settingsOutline, starOutline, lockClosedOutline, filmOutline } from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    FormsModule, 
    RouterModule
  ]
})
export class ProfilePage implements OnInit {
  userAuthenticated: boolean | null = null; 
  userName: string = '';
  userEmail: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ personCircle, settingsOutline, starOutline, lockClosedOutline, filmOutline });
  }

  ngOnInit() {
    this.checkAuthStatus();
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
        this.userAuthenticated = isLoggedIn;
        if (isLoggedIn) {
            this.loadUserData(); 
        } else {
            this.userName = '';
            this.userEmail = '';
        }
    });
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
          const user = await this.authService.getMe().toPromise(); 
          if(user){
              this.userName = user.nombre || 'Usuario'; 
              this.userEmail = user.email || '';
          }
      } catch (error) {
          console.error("Error loading user data", error);
          await this.onLogout();
      }
  }

  async onLogout() {
    await this.authService.logout();
    this.userAuthenticated = false;
    this.userName = '';
    this.userEmail = '';
    this.router.navigate(['/login']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}