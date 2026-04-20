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
  template: `
    <div class="min-h-screen bg-white">
      <!-- Page header -->
      <div class="max-w-screen-2xl mx-auto px-6 pt-8 pb-4 border-b border-black/10">
        <div class="flex items-end justify-between">
          <div>
            <p class="text-[10px] tracking-label uppercase text-gray-400 mb-1">Gear Rental</p>
            <h1 class="text-2xl font-bold uppercase tracking-tight">All Equipment</h1>
          </div>
          <span class="text-xs text-gray-400 pb-1">{{ equipment.length }} items</span>
        </div>

        <!-- Category filter tabs -->
        <div class="flex items-center gap-0 mt-5 -mb-px overflow-x-auto">
          <button
            (click)="setCategory(null)"
            [class]="!activeCategory
              ? 'border-b-2 border-black text-black text-[11px] tracking-label uppercase px-4 py-2 font-medium whitespace-nowrap'
              : 'border-b-2 border-transparent text-gray-400 text-[11px] tracking-label uppercase px-4 py-2 hover:text-black transition-colors whitespace-nowrap'"
          >All</button>
          @for (cat of categories; track cat) {
            <button
              (click)="setCategory(cat)"
              [class]="activeCategory === cat
                ? 'border-b-2 border-black text-black text-[11px] tracking-label uppercase px-4 py-2 font-medium whitespace-nowrap'
                : 'border-b-2 border-transparent text-gray-400 text-[11px] tracking-label uppercase px-4 py-2 hover:text-black transition-colors whitespace-nowrap'"
            >{{ LABELS[cat] || cat }}</button>
          }
        </div>
      </div>

      <!-- Filters bar -->
      <div class="max-w-screen-2xl mx-auto px-6">
        <div class="flex items-center gap-4 py-3 border-b border-black/10 text-[11px]">
          <span class="text-gray-400 tracking-label uppercase">Filter:</span>
          <div class="flex items-center gap-2">
            <span class="text-gray-400">Price/day</span>
            <input type="number" [(ngModel)]="filters.min_price" placeholder="Min"
                   class="w-20 border-b border-gray-300 focus:border-black outline-none px-1 py-0.5 text-[11px] bg-transparent placeholder:text-gray-300" />
            <span class="text-gray-300">—</span>
            <input type="number" [(ngModel)]="filters.max_price" placeholder="Max"
                   class="w-20 border-b border-gray-300 focus:border-black outline-none px-1 py-0.5 text-[11px] bg-transparent placeholder:text-gray-300" />
            <span class="text-gray-400 ml-2">₸</span>
          </div>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" [(ngModel)]="availableOnly"
                   class="accent-black w-3 h-3" />
            <span class="text-gray-500">Available only</span>
          </label>
          <button (click)="applyFilters()"
                  class="ml-auto text-[11px] tracking-label uppercase border-b border-black pb-0.5 hover:opacity-50 transition-opacity">
            Apply
          </button>
          @if (hasActiveFilters()) {
            <button (click)="clearFilters()"
                    class="text-[11px] tracking-label uppercase text-gray-400 border-b border-gray-400 pb-0.5 hover:opacity-50 transition-opacity">
              Clear
            </button>
          }
        </div>
      </div>

      <!-- Grid -->
      <div class="max-w-screen-2xl mx-auto px-6 py-6">
        @if (loading) {
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-white">
            @for (i of [1,2,3,4,5,6,7,8,9,10]; track i) {
              <div class="bg-white">
                <div class="aspect-[3/4] bg-gray-100 animate-pulse"></div>
                <div class="p-3 space-y-1.5">
                  <div class="h-2.5 bg-gray-100 animate-pulse w-1/2"></div>
                  <div class="h-3 bg-gray-100 animate-pulse w-3/4"></div>
                  <div class="h-2.5 bg-gray-100 animate-pulse w-1/4 mt-2"></div>
                </div>
              </div>
            }
          </div>
        }

        @if (error) {
          <div class="py-20 text-center">
            <p class="text-sm text-gray-400">{{ error }}</p>
          </div>
        }

        @if (!loading && !error) {
          @if (equipment.length === 0) {
            <div class="py-32 text-center">
              <p class="text-xs tracking-label uppercase text-gray-300">No items found</p>
            </div>
          } @else {
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-white">
              @for (item of equipment; track item.id) {
                <div
                  (click)="navigateTo(item.id)"
                  class="bg-white group cursor-pointer"
                >
                  <div class="aspect-[3/4] overflow-hidden bg-gray-50">
                    @if (item.image) {
                      <img
                        [src]="item.image"
                        [alt]="item.name"
                        class="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                        loading="lazy"
                      />
                    } @else {
                      <div class="w-full h-full flex items-center justify-center bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    }
                  </div>
                  <div class="p-3">
                    <p class="text-[10px] tracking-label uppercase text-gray-400">{{ item.category_detail?.name }}</p>
                    <p class="text-[13px] font-medium mt-0.5 leading-snug">{{ item.name }}</p>
                    <div class="flex items-center justify-between mt-2">
                      <p class="text-[12px]">₸{{ item.daily_rate | number:'1.0-0' }}<span class="text-gray-400"> / day</span></p>
                      @if (!item.is_available) {
                        <span class="text-[10px] tracking-label uppercase text-gray-300">Unavailable</span>
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

  setCategory(cat: string | null): void {
    this.activeCategory = cat;
    this.loadEquipment();
  }

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
