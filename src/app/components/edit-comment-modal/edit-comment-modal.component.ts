import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-comment-modal',
  templateUrl: './edit-comment-modal.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class EditCommentModalComponent implements OnInit {
  @Input() comment: any;
  editForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController
  ) {
    this.editForm = this.fb.group({
      texto: ['', Validators.required],
      puntuacion: [5, Validators.required]
    });
  }

  ngOnInit() {
    if (this.comment) {
      this.editForm.patchValue({
        texto: this.comment.texto,
        puntuacion: this.comment.puntuacion
      });
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  saveChanges() {
    if (this.editForm.invalid) return;
    this.modalCtrl.dismiss(this.editForm.value);
  }
}