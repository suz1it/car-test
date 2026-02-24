import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/cars-list/cars-list.component').then((m) => m.CarsListComponent) },
  {
    path: 'registration',
    loadComponent: () =>
      import('./pages/registration-status/registration-status.component').then((m) => m.RegistrationStatusComponent),
  },
  { path: '**', redirectTo: '' },
];
