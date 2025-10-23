import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { passwordsMatchValidator } from '../register/register.page';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterModule]
})
export class ResetPasswordPage implements OnInit {
  resetForm: FormGroup;
  codeForm: FormGroup; 
  
  email: string = '';
  verificationComplete = false;
  codigoIngresado: string = ''; 
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.email = navigation?.extras?.state?.['email'] || '';

    this.codeForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });

    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordsMatchValidator });
    
    addIcons({ eyeOutline, eyeOffOutline });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getPasswordError(): string {
    const passwordControl = this.resetForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'La contraseña es requerida.';
    }
    if (passwordControl?.hasError('minlength')) {
      return 'Debe tener al menos 6 caracteres.';
    }
    return '';
  }

  ngOnInit() {
    if (!this.email) {
      this.router.navigate(['/forgot-password']);
    }
  }

  async verifyCode() {
    this.codeForm.markAllAsTouched();
    if (this.codeForm.invalid) return;

    const codigo = this.codeForm.value.codigo;

    this.authService.verifyResetCode({ email: this.email, codigo }).subscribe({
      next: (res) => {
        this.codigoIngresado = codigo;
        this.verificationComplete = true;
      },
      error: async (err) => {
        const alert = await this.alertController.create({
          header: 'Error de Verificación',
          message: err.error.msg || 'El código es incorrecto o ha expirado.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  async onSubmit() {
    this.resetForm.markAllAsTouched();
    if (this.resetForm.get('password')?.invalid) return;

    if (this.resetForm.errors?.['passwordsMismatch']) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Las contraseñas no coinciden. Por favor, inténtalo de nuevo.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    if (this.resetForm.valid) {
      const { password } = this.resetForm.value;
      this.authService.resetPasswordByCode({ 
        email: this.email, 
        codigo: this.codigoIngresado, 
        password 
      }).subscribe({
        next: async (res) => {
          const alert = await this.alertController.create({
            header: 'Éxito',
            message: 'Contraseña actualizada. Ya puedes iniciar sesión.',
            buttons: ['OK']
          });
          await alert.present();
          this.router.navigate(['/login']);
        },
        error: async (err) => {
          const alert = await this.alertController.create({
            header: 'Error',
            message: err.error.msg || 'Error al restablecer. El código pudo haber expirado.',
            buttons: ['OK']
          });
          await alert.present();
        }
      });
    }
  }
}