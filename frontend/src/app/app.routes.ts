import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'catalog',
    pathMatch: 'full',
  },
  {
    path: 'catalog',
    loadComponent: () => import('./features/catalog/catalog.component').then(m => m.CatalogComponent),
  },
  {
    path: 'equipment/:id',
    loadComponent: () => import('./features/detail/equipment-detail.component').then(m => m.EquipmentDetailComponent),
  },
  {
    path: 'bookings',
    loadComponent: () => import('./features/bookings/bookings.component').then(m => m.BookingsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
