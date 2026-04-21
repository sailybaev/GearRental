import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  styleUrls: ['./not-found.component.css'],
  template: `
    <div class="not-found">
      <p class="label" style="margin-bottom:1rem">Error</p>
      <h1 class="not-found-code">404</h1>
      <p class="not-found-msg">This page does not exist.</p>
      <a routerLink="/catalog" class="back-link">← Back to Catalog</a>
    </div>
  `,
})
export class NotFoundComponent {}
