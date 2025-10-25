import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '', 
    component: TabsPage,
    children: [
      {
        path: 'home', 
        loadComponent: () =>
          import('../home/home.page').then((m) => m.HomePage), 
      },
      {
        path: 'search', 
        loadComponent: () =>
          import('../search/search.page').then((m) => m.SearchPage),
      },
      {
        path: 'profile', 
        loadComponent: () =>
          import('../profile/profile.page').then((m) => m.ProfilePage), 
      },
      {
        path: '', 
        redirectTo: 'home', 
        pathMatch: 'full',
      },
    ],
  },
];