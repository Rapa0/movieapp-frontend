import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-code',
  templateUrl: './verify-code.page.html',
  styleUrls: ['./verify-code.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class VerifyCodePage implements OnInit {
  verifyForm: FormGroup;
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.email = navigation?.extras?.state?.['email'];

    this.verifyForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });
  }

  ngOnInit() {
    if (!this.email) {
      this.router.navigate(['/register']);
    }
  }

  async onVerify() {
    if (this.verifyForm.invalid) {
      return;
    }

    const verificationData = {
      email: this.email,
      codigo: this.verifyForm.value.codigo
    };

    this.authService.verifyCode(verificationData).subscribe({
      next: async (response) => {
        console.log('Verificación exitosa!', response);
        
        const alert = await this.alertController.create({
          header: '¡Registro Exitoso!',
          message: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
          buttons: ['OK'],
        });

        await alert.present();
        await alert.onDidDismiss(); 

        this.router.navigate(['/login']);
      },
      error: async (err) => {
        console.error('La verificación falló', err);
        const alert = await this.alertController.create({
          header: 'Error de Verificación',
          message: err.error.msg || 'El código es incorrecto o ha expirado.',
          buttons: ['OK'],
        });
        await alert.present();
      }
    });
  }
}