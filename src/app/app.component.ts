import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone'; 

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true, 
  imports: [
    IonApp,         
    IonRouterOutlet, 
    CommonModule,
    HttpClientModule
  ], 
})
export class AppComponent {
  constructor() {
    this.initializeApp();
  }

  initializeApp() {
    console.log('AppComponent inicializado. Sin plugin Keyboard.');
  }
}