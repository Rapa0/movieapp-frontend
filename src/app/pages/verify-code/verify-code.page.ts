import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-verify-code',
  templateUrl: './verify-code.page.html',
  styleUrls: ['./verify-code.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterModule]
})
export class VerifyCodePage implements OnInit {
  verifyForm: FormGroup;
  email: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private location: Location
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.email = navigation?.extras?.state?.['email'] || '';
    
    this.verifyForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
    addIcons({ arrowBackOutline });
  }

  ngOnInit() {
    if (!this.email) {
      this.router.navigate(['/register']);
    }
  }

  goBack() {
    this.location.back();
  }
  
  get f() { return this.verifyForm.controls; }

  async onSubmit() {
    if (this.verifyForm.invalid || this.isLoading) {
      this.verifyForm.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    const { codigo } = this.verifyForm.value;
    
    this.authService.verifyCode({ email: this.email, codigo }).subscribe({
      next: async (response: any) => {
        const alert = await this.alertController.create({
          header: 'Cuenta Verificada',
          message: '¡Tu cuenta ha sido creada y verificada con éxito! Ya puedes iniciar sesión.',
          buttons: ['OK']
        });
        await alert.present();
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: async (err: any) => {
        const alert = await this.alertController.create({
          header: 'Error de Verificación',
          message: err.error.msg || 'El código es incorrecto o ha expirado.',
          buttons: ['OK']
        });
        await alert.present();
        this.isLoading = false;
      }
    });
  }
}