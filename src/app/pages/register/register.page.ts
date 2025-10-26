import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, arrowBackOutline } from 'ionicons/icons';

export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  return password && confirmPassword && password.value !== confirmPassword.value ? { passwordsMismatch: true } : null;
};

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule
  ]
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private location: Location
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordsMatchValidator });
    
    addIcons({ eyeOutline, eyeOffOutline, arrowBackOutline });
  }

  ngOnInit() {}

  goBack() {
    this.location.back();
  }

  get f() { return this.registerForm.controls; }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async onRegister() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.invalid) {
      return;
    }
    
    const { username, email, password } = this.registerForm.value;
    const userData = { nombre: username, email, password };

    this.authService.register(userData).subscribe({
      next: async (response: any) => {
        const alert = await this.alertController.create({
          header: 'Registro Exitoso',
          message: '¡Cuenta creada! Te hemos enviado un código de verificación a tu correo.',
          buttons: ['OK']
        });
        await alert.present();
        this.router.navigate(['/verify-code'], {
          state: { email: this.registerForm.value.email }
        });
      },
      error: async (err: any) => {
        console.error('El registro falló', err);
        const alert = await this.alertController.create({
          header: 'Error en el Registro',
          message: err?.error?.msg || 'No se pudo completar el registro.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
}