import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <!-- Top nav -->
    <header class="bg-black text-white sticky top-0 z-50">
      <div class="max-w-screen-2xl mx-auto px-6">
        <div class="flex items-center justify-between h-12 border-b border-white/10">
          <!-- Logo -->
          <a routerLink="/catalog"
             class="text-sm font-bold tracking-brand uppercase select-none hover:opacity-70 transition-opacity">
            Gear Rental
          </a>

          <!-- Center nav -->
          <nav class="hidden md:flex items-center gap-8">
            <a routerLink="/" [routerLinkActiveOptions]="{exact:true}"
               routerLinkActive="border-b border-white"
               class="text-xs tracking-label uppercase hover:opacity-60 transition-opacity pb-0.5">
              Home
            </a>
            <a routerLink="/catalog"
               routerLinkActive="border-b border-white"
               class="text-xs tracking-label uppercase hover:opacity-60 transition-opacity pb-0.5">
              Shop
            </a>
            @if (authService.isAuthenticated()) {
              <a routerLink="/bookings"
                 routerLinkActive="border-b border-white"
                 class="text-xs tracking-label uppercase hover:opacity-60 transition-opacity pb-0.5">
                My Bookings
              </a>
            }
          </nav>

          <!-- Right actions -->
          <div class="flex items-center gap-6">
            @if (authService.isAuthenticated()) {
              <button (click)="logout()"
                      class="text-xs tracking-label uppercase hover:opacity-60 transition-opacity">
                Logout
              </button>
            } @else {
              <a routerLink="/login"
                 class="text-xs tracking-label uppercase hover:opacity-60 transition-opacity">
                Login
              </a>
              <a routerLink="/register"
                 class="text-xs tracking-label uppercase hover:opacity-60 transition-opacity">
                Register
              </a>
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
