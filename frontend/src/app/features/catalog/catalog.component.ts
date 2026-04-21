import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EquipmentService } from '../../core/services/equipment.service';
import { Equipment, EquipmentFilters, Category } from '../../core/interfaces/equipment.interface';

const CATEGORY_LABELS: Record<string, string> = {
  cameras: 'Cameras',
  lenses: 'Lenses',
  lighting: 'Lighting',
  audio: 'Audio',
  stabilizers: 'Stabilizers',
  drones: 'Drones',
};

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./catalog.component.css'],
  template: `
    <div class="page">
      <div class="container">
        <div class="page-header">
          <div class="page-header-row">
            <div>
              <p class="label">Gear Rental</p>
              <h1 class="page-title">All Equipment</h1>
            </div>
            <span class="item-count">{{ equipment.length }} items</span>
          </div>

          <div class="cat-tabs">
            <button (click)="setCategory(null)" [class.active]="!activeCategory" class="cat-tab">All</button>
            @for (cat of categories; track cat) {
              <button (click)="setCategory(cat)" [class.active]="activeCategory === cat" class="cat-tab">
                {{ LABELS[cat] || cat }}
              </button>
            }
          </div>
        </div>

        <div class="filters-bar">
          <span class="filters-label">Filter:</span>
          <div class="price-range">
            <span>Price/day</span>
            <input type="number" [(ngModel)]="filters.min_price" placeholder="Min" class="form-input-sm" />
            <span class="price-sep">—</span>
            <input type="number" [(ngModel)]="filters.max_price" placeholder="Max" class="form-input-sm" />
            <span class="currency">₸</span>
          </div>
          <label class="avail-check">
            <input type="checkbox" [(ngModel)]="availableOnly" />
            <span>Available only</span>
          </label>
          <button (click)="applyFilters()" class="filter-apply">Apply</button>
          @if (hasActiveFilters()) {
            <button (click)="clearFilters()" class="filter-clear">Clear</button>
          }
        </div>

        <div class="grid-wrap">
          @if (loading) {
            <div class="skeleton-grid">
              @for (i of [1,2,3,4,5,6,7,8,9,10]; track i) {
                <div class="skeleton-card">
                  <div class="skeleton-image skeleton"></div>
                  <div class="skeleton-info">
                    <div class="skeleton skeleton-line skeleton-line-mid"></div>
                    <div class="skeleton skeleton-line skeleton-line-wide"></div>
                    <div class="skeleton skeleton-line skeleton-line-short"></div>
                  </div>
                </div>
              }
            </div>
          }

          @if (error) {
            <div class="error-state">{{ error }}</div>
          }

          @if (!loading && !error) {
            @if (equipment.length === 0) {
              <div class="empty-state">
                <p class="empty-label">No items found</p>
              </div>
            } @else {
              <div class="equipment-grid">
                @for (item of equipment; track item.id) {
                  <div class="equipment-card" (click)="navigateTo(item.id)">
                    <div class="card-image">
                      @if (item.image) {
                        <img [src]="item.image" [alt]="item.name" loading="lazy" />
                      } @else {
                        <div class="card-placeholder">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      }
                    </div>
                    <div class="card-info">
                      <p class="card-category">{{ item.category_detail?.name }}</p>
                      <p class="card-name">{{ item.name }}</p>
                      <div class="card-footer">
                        <p class="card-price">₸{{ item.daily_rate | number:'1.0-0' }}<span> / day</span></p>
                        @if (!item.is_available) {
                          <span class="card-unavailable">Unavailable</span>
                        }
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class CatalogComponent implements OnInit {
  private readonly equipmentService = inject(EquipmentService);
  private readonly router = inject(Router);

  equipment: Equipment[] = [];
  loading = false;
  error = '';
  filters: EquipmentFilters = {};
  availableOnly = false;
  activeCategory: string | null = null;
  categories = Object.keys(CATEGORY_LABELS);
  readonly LABELS = CATEGORY_LABELS;

  ngOnInit(): void { this.loadEquipment(); }

  loadEquipment(): void {
    this.loading = true;
    this.error = '';
    const f: EquipmentFilters = { ...this.filters };
    if (this.activeCategory) f.category = this.activeCategory;
    if (this.availableOnly) f.is_available = true;

    this.equipmentService.getAll(f).subscribe({
      next: (data) => { this.equipment = data; this.loading = false; },
      error: () => { this.error = 'Failed to load equipment.'; this.loading = false; },
    });
  }

  setCategory(cat: string | null): void { this.activeCategory = cat; this.loadEquipment(); }
  applyFilters(): void { this.loadEquipment(); }

  clearFilters(): void {
    this.filters = {};
    this.availableOnly = false;
    this.activeCategory = null;
    this.loadEquipment();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.min_price || this.filters.max_price || this.availableOnly);
  }

  navigateTo(id: number): void { this.router.navigate(['/equipment', id]); }
}
