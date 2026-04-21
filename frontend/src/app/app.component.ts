import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  styleUrls: ['./app.component.css'],
  template: `
    <header class="app-header">
      <div class="container">
        <div class="nav-bar">
          <a routerLink="/catalog" class="nav-logo">Gear Rental</a>
          <nav class="nav-links">
            <a routerLink="/catalog" routerLinkActive="active" class="nav-link">Shop</a>
            @if (authService.isAuthenticated()) {
              <a routerLink="/bookings" routerLinkActive="active" class="nav-link">My Bookings</a>
            }
          </nav>
          <div class="nav-actions">
            @if (authService.isAuthenticated()) {
              <button (click)="logout()" class="nav-btn">Logout</button>
            } @else {
              <a routerLink="/login" class="nav-btn">Login</a>
              <a routerLink="/register" class="nav-btn">Register</a>
            }
          </div>
        </div>
      </div>
    </header>
    <router-outlet />
  `,
})
export class AppComponent {
  constructor(public authService: AuthService) {}
  logout(): void { this.authService.logout(); }
}
