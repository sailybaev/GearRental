import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styleUrls: ['./login.component.css'],
  template: `
    <div class="auth-page">
      <div class="auth-panel">
        <div class="auth-panel-inner">
          <p class="label">Gear Rental</p>
          <h2 class="auth-panel-title">Professional<br/>Equipment<br/>Rental</h2>
          <p class="auth-panel-desc">Cameras, lenses, lighting and more — available by the day.</p>
        </div>
      </div>

      <div class="auth-form-wrap">
        <div class="auth-form-inner">
          <div class="auth-heading">
            <p class="label">Account</p>
            <h1 class="auth-title">Sign In</h1>
          </div>

          <form #loginForm="ngForm" (ngSubmit)="onSubmit(loginForm)" novalidate>
            <div class="form-group">
              <label class="form-label">Username</label>
              <input type="text" name="username"
                     [(ngModel)]="credentials.username" required #usernameField="ngModel"
                     class="form-input" placeholder="your_username" />
              @if (usernameField.invalid && loginForm.submitted) {
                <p class="form-error">Required</p>
              }
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" name="password"
                     [(ngModel)]="credentials.password" required minlength="6" #passwordField="ngModel"
                     class="form-input" placeholder="••••••••" />
              @if (passwordField.invalid && loginForm.submitted) {
                <p class="form-error">
                  {{ passwordField.errors?.['required'] ? 'Required' : 'Min 6 characters' }}
                </p>
              }
            </div>

            @if (serverError) {
              <p class="form-error" style="margin-bottom:1rem">{{ serverError }}</p>
            }

            <button type="submit" [disabled]="loading" class="btn btn-primary submit-btn">
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <p class="auth-footer">
            No account?
            <a routerLink="/register" class="auth-link">Register</a>
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
