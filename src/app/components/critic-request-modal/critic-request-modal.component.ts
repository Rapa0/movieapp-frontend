import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule, Location } from '@angular/common'; 
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons'; 

@Component({
  selector: 'app-critic-request-modal',
  templateUrl: './critic-request-modal.component.html',
  styleUrls: ['./critic-request-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule]
})
export class CriticRequestModalComponent {
  requestForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private location: Location 
  ) {
    this.requestForm = this.fb.group({
      motivo: ['', [Validators.required, Validators.minLength(20)]],
      enlaces: ['']
    });
    addIcons({ arrowBackOutline }); 
  }

  get f() { return this.requestForm.controls; }

  goBack() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  submit() {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }
    this.modalCtrl.dismiss(this.requestForm.value, 'confirm');
  }
}