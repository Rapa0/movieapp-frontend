import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule
  ],
})
export class ForgotPasswordPage {
  forgotForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]] 
    });
  }

  get f() { return this.forgotForm.controls; }

  async onSubmit() {
    this.forgotForm.markAllAsTouched(); 
    if (this.forgotForm.invalid) {
      return;
    }

    const emailSent = this.forgotForm.value.email;

    this.authService.forgotPassword(emailSent).subscribe({
      next: async (res) => {
        const alert = await this.alertController.create({
          header: 'Correo Enviado',
          message: 'Si existe una cuenta, te hemos enviado un código.',
          buttons: ['OK']
        });
        await alert.present();
        await alert.onDidDismiss(); 

        this.router.navigate(['/reset-password'], { 
            state: { email: emailSent } 
        });
      },
      error: async (err) => {
        const alert = await this.alertController.create({
          header: 'Correo Enviado',
          message: 'Si existe una cuenta con ese email, te hemos enviado un código.',
          buttons: ['OK']
        });
        await alert.present();
        await alert.onDidDismiss();
        
        this.router.navigate(['/reset-password'], { 
            state: { email: emailSent } 
        });
      }
    });
  }
}

