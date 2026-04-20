import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white flex">
      <!-- Left decorative panel -->
      <div class="hidden lg:block lg:w-1/2 bg-black relative overflow-hidden">
        <div class="absolute inset-0 flex flex-col items-start justify-end p-16">
          <p class="text-white/30 text-[10px] tracking-brand uppercase mb-4">Gear Rental</p>
          <h2 class="text-white text-5xl font-bold uppercase leading-none tracking-tight">
            Join<br/>Our<br/>Platform
          </h2>
          <p class="text-white/40 text-sm mt-6 max-w-xs leading-relaxed">
            Access premium photo and video equipment at competitive daily rates.
          </p>
        </div>
      </div>

      <!-- Right form panel -->
      <div class="w-full lg:w-1/2 flex items-center justify-center px-8 py-16">
        <div class="w-full max-w-sm">
          <div class="mb-10">
            <p class="text-[10px] tracking-brand uppercase text-gray-400 mb-2">Account</p>
            <h1 class="text-3xl font-bold uppercase tracking-tight">Create Account</h1>
          </div>

          <form #registerForm="ngForm" (ngSubmit)="onSubmit(registerForm)" novalidate class="space-y-6">
            <div>
              <label class="block text-[10px] tracking-label uppercase text-gray-400 mb-2">Username</label>
              <input type="text" name="username" [(ngModel)]="payload.username" required #usernameField="ngModel"
                     class="w-full border-b border-gray-300 focus:border-black outline-none py-2 text-sm bg-transparent placeholder:text-gray-300"
                     placeholder="your_username" />
              @if (usernameField.invalid && registerForm.submitted) {
                <p class="mt-1 text-[11px] tracking-label uppercase text-red-500">Required</p>
              }
              @if (fieldErrors['username']) {
                <p class="mt-1 text-[11px] tracking-label uppercase text-red-500">{{ fieldErrors['username'] }}</p>
              }
            </div>

            <div>
              <label class="block text-[10px] tracking-label uppercase text-gray-400 mb-2">Email</label>
              <input type="email" name="email" [(ngModel)]="payload.email" required email #emailField="ngModel"
                     class="w-full border-b border-gray-300 focus:border-black outline-none py-2 text-sm bg-transparent placeholder:text-gray-300"
                     placeholder="you@example.com" />
              @if (emailField.invalid && registerForm.submitted) {
                <p class="mt-1 text-[11px] tracking-label uppercase text-red-500">
                  {{ emailField.errors?.['required'] ? 'Required' : 'Invalid email' }}
                </p>
              }
              @if (fieldErrors['email']) {
                <p class="mt-1 text-[11px] tracking-label uppercase text-red-500">{{ fieldErrors['email'] }}</p>
              }
            </div>

            <div>
              <label class="block text-[10px] tracking-label uppercase text-gray-400 mb-2">Password</label>
              <input type="password" name="password" [(ngModel)]="payload.password" required minlength="6" #passwordField="ngModel"
                     class="w-full border-b border-gray-300 focus:border-black outline-none py-2 text-sm bg-transparent placeholder:text-gray-300"
                     placeholder="Min 6 characters" />
              @if (passwordField.invalid && registerForm.submitted) {
                <p class="mt-1 text-[11px] tracking-label uppercase text-red-500">
                  {{ passwordField.errors?.['required'] ? 'Required' : 'Min 6 characters' }}
                </p>
              }
            </div>

            <div>
              <label class="block text-[10px] tracking-label uppercase text-gray-400 mb-2">Confirm Password</label>
              <input type="password" name="password_confirm" [(ngModel)]="payload.password_confirm" required #confirmField="ngModel"
                     class="w-full border-b border-gray-300 focus:border-black outline-none py-2 text-sm bg-transparent placeholder:text-gray-300"
                     placeholder="Repeat password" />
              @if (registerForm.submitted && payload.password !== payload.password_confirm && payload.password_confirm) {
                <p class="mt-1 text-[11px] tracking-label uppercase text-red-500">Passwords do not match</p>
              }
            </div>

            @if (serverError) {
              <p class="text-[11px] tracking-label uppercase text-red-500">{{ serverError }}</p>
            }

            <button type="submit" [disabled]="loading"
                    class="w-full py-4 text-[12px] tracking-brand uppercase font-medium
                           bg-black text-white hover:bg-gray-900 transition-colors
                           disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed mt-4">
              {{ loading ? 'Creating...' : 'Create Account' }}
            </button>
          </form>

          <p class="mt-8 text-xs text-gray-400">
            Already have an account?
            <a routerLink="/login" class="text-black border-b border-black pb-0.5 hover:opacity-50 transition-opacity ml-1">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  payload = { username: '', email: '', password: '', password_confirm: '' };
  loading = false;
  serverError = '';
  fieldErrors: Record<string, string> = {};

  onSubmit(form: NgForm): void {
    if (form.invalid || this.payload.password !== this.payload.password_confirm) return;
    this.loading = true;
    this.serverError = '';
    this.fieldErrors = {};
    this.authService.register(this.payload).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/login']); },
      error: (err) => {
        this.loading = false;
        if (err.error?.username) this.fieldErrors['username'] = err.error.username[0];
        if (err.error?.email) this.fieldErrors['email'] = err.error.email[0];
        if (err.error?.detail) this.serverError = err.error.detail;
        if (err.error?.password_confirm) this.serverError = err.error.password_confirm[0];
        if (!this.serverError && !Object.keys(this.fieldErrors).length) this.serverError = 'Registration failed';
      },
    });
  }
}
