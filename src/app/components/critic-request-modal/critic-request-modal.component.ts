import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-critic-request-modal',
  templateUrl: './critic-request-modal.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class CriticRequestModalComponent {
  requestForm: FormGroup;

  constructor(private fb: FormBuilder, private modalCtrl: ModalController) {
    this.requestForm = this.fb.group({
      motivo: ['', Validators.required],
      enlaces: [''] 
    });
  }

  dismiss() { this.modalCtrl.dismiss(); }
  submit() { this.modalCtrl.dismiss(this.requestForm.value); }
}