import { Component, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, AlertController, IonInput } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterModule]
})
export class LoginPage {
  @ViewChild('emailInput', { static: false }) emailInput!: IonInput; 

  loginForm: FormGroup;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private location: Location
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]], 
    });
    addIcons({ eyeOutline, eyeOffOutline, arrowBackOutline });
  }

  get f() { return this.loginForm.controls; }

  goBack() {
    this.router.navigate(['/tabs/home']); 
  }

  ionViewDidEnter() {
    setTimeout(() => {
      const nativeEl = (this.emailInput as any).el?.querySelector('input');
      if (nativeEl) {
          nativeEl.focus();
      }
    }, 300); 
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      console.log('Formulario inválido'); 
      return;
    }

    console.log('Intentando iniciar sesión con:', this.loginForm.value); 

    this.authService.login(this.loginForm.value).subscribe({
      next: (response: any) => {
        console.log('Respuesta de login exitosa:', response); 
        console.log('Navegando a /tabs/home...');
        this.router.navigate(['/tabs/home']); 
      },
      error: async (err: any) => {
        console.error('Error en la respuesta de login:', err); 
        
        const alert = await this.alertController.create({
          header: 'Error al Iniciar Sesión',
          message: err?.error?.msg || 'Credenciales inválidas o error de servidor.', 
          buttons: ['OK'],
        });
        await alert.present();
      }
    });
  }
}