import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-white flex flex-col items-center justify-center">
      <p class="text-[10px] tracking-brand uppercase text-gray-300 mb-4">Error</p>
      <h1 class="text-[120px] font-bold leading-none tracking-tighter text-gray-100 select-none">404</h1>
      <p class="text-sm text-gray-400 mt-2 mb-8">This page does not exist.</p>
      <a routerLink="/catalog"
         class="text-[12px] tracking-brand uppercase border-b border-black pb-0.5 hover:opacity-50 transition-opacity">
        ← Back to Catalog
      </a>
    </div>
  `,
})
export class NotFoundComponent {}
