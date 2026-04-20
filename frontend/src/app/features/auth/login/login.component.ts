import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white flex">
      <!-- Left decorative panel -->
      <div class="hidden lg:block lg:w-1/2 bg-black relative overflow-hidden">
        <div class="absolute inset-0 flex flex-col items-start justify-end p-16">
          <p class="text-white/30 text-[10px] tracking-brand uppercase mb-4">Gear Rental</p>
          <h2 class="text-white text-5xl font-bold uppercase leading-none tracking-tight">
            Professional<br/>Equipment<br/>Rental
          </h2>
          <p class="text-white/40 text-sm mt-6 max-w-xs leading-relaxed">
            Cameras, lenses, lighting and more — available by the day.
          </p>
        </div>
      </div>

      <!-- Right form panel -->
      <div class="w-full lg:w-1/2 flex items-center justify-center px-8 py-16">
        <div class="w-full max-w-sm">
          <div class="mb-10">
            <p class="text-[10px] tracking-brand uppercase text-gray-400 mb-2">Account</p>
            <h1 class="text-3xl font-bold uppercase tracking-tight">Sign In</h1>
          </div>

          <form #loginForm="ngForm" (ngSubmit)="onSubmit(loginForm)" novalidate class="space-y-6">
            <div>
              <label class="block text-[10px] tracking-label uppercase text-gray-400 mb-2">Username</label>
              <input id="username" type="text" name="username"
                     [(ngModel)]="credentials.username" required #usernameField="ngModel"
                     class="w-full border-b border-gray-300 focus:border-black outline-none py-2 text-sm bg-transparent placeholder:text-gray-300"
                     placeholder="your_username" />
              @if (usernameField.invalid && loginForm.submitted) {
                <p class="mt-1 text-[11px] tracking-label uppercase text-red-500">Required</p>
              }
            </div>

            <div>
              <label class="block text-[10px] tracking-label uppercase text-gray-400 mb-2">Password</label>
              <input id="password" type="password" name="password"
                     [(ngModel)]="credentials.password" required minlength="6" #passwordField="ngModel"
                     class="w-full border-b border-gray-300 focus:border-black outline-none py-2 text-sm bg-transparent placeholder:text-gray-300"
                     placeholder="••••••••" />
              @if (passwordField.invalid && loginForm.submitted) {
                <p class="mt-1 text-[11px] tracking-label uppercase text-red-500">
                  {{ passwordField.errors?.['required'] ? 'Required' : 'Min 6 characters' }}
                </p>
              }
            </div>

            @if (serverError) {
              <p class="text-[11px] tracking-label uppercase text-red-500">{{ serverError }}</p>
            }

            <button type="submit" [disabled]="loading"
                    class="w-full py-4 text-[12px] tracking-brand uppercase font-medium
                           bg-black text-white hover:bg-gray-900 transition-colors
                           disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed mt-4">
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <p class="mt-8 text-xs text-gray-400">
            No account?
            <a routerLink="/register" class="text-black border-b border-black pb-0.5 hover:opacity-50 transition-opacity ml-1">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  credentials = { username: '', password: '' };
  loading = false;
  serverError = '';

  onSubmit(form: NgForm): void {
    if (form.invalid) return;
    this.loading = true;
    this.serverError = '';
    this.authService.login(this.credentials).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/catalog']); },
      error: (err) => {
        this.loading = false;
        this.serverError = err.error?.detail || err.error?.non_field_errors?.[0] || 'Invalid credentials';
      },
    });
  }
}
