import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EquipmentService } from '../../core/services/equipment.service';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { Equipment } from '../../core/interfaces/equipment.interface';

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white">

      @if (loading) {
        <div class="max-w-screen-xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div class="aspect-[4/3] bg-gray-100 animate-pulse"></div>
          <div class="space-y-4 py-4">
            <div class="h-2.5 bg-gray-100 animate-pulse w-1/4"></div>
            <div class="h-7 bg-gray-100 animate-pulse w-4/5"></div>
            <div class="h-5 bg-gray-100 animate-pulse w-1/3 mt-2"></div>
          </div>
        </div>
      }

      @if (error && !loading) {
        <div class="max-w-screen-xl mx-auto px-6 py-40 text-center">
          <p class="text-[11px] tracking-label uppercase text-gray-300 mb-4">Not found</p>
          <a routerLink="/catalog" class="text-xs tracking-label uppercase border-b border-black pb-0.5">← Catalog</a>
        </div>
      }

      @if (!loading && equipment) {
        <!-- Breadcrumb -->
        <div class="border-b border-gray-100">
          <div class="max-w-screen-xl mx-auto px-6 py-2.5">
            <nav class="flex items-center gap-2 text-[11px] text-gray-400 tracking-label uppercase">
              <a routerLink="/catalog" class="hover:text-black transition-colors">Catalog</a>
              <span class="text-gray-200">/</span>
              <span class="hover:text-black transition-colors cursor-pointer">{{ equipment.category_detail?.name }}</span>
              <span class="text-gray-200">/</span>
              <span class="text-black truncate max-w-[200px]">{{ equipment.name }}</span>
            </nav>
          </div>
        </div>

        <!-- Main layout -->
        <div class="max-w-screen-xl mx-auto px-6 py-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

            <!-- LEFT: Image -->
            <div>
              <div class="aspect-[3/4] overflow-hidden bg-gray-50">
                @if (equipment.image) {
                  <img [src]="equipment.image" [alt]="equipment.name"
                       class="w-full h-full object-cover" />
                } @else {
                  <div class="w-full h-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                }
              </div>

              <!-- Description below image -->
              <div class="mt-6 pt-6 border-t border-gray-100">
                <p class="text-[10px] tracking-label uppercase text-gray-400 mb-3">About</p>
                <p class="text-sm text-gray-500 leading-relaxed">{{ equipment.description }}</p>
              </div>
            </div>

            <!-- RIGHT: Info + Booking -->
            <div class="flex flex-col">
              <!-- Header -->
              <div class="mb-6">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-[10px] tracking-label uppercase text-gray-400">
                    {{ equipment.category_detail?.name }}
                  </p>
                  <span [class]="equipment.is_available
                    ? 'flex items-center gap-1.5 text-[10px] tracking-label uppercase text-emerald-600'
                    : 'flex items-center gap-1.5 text-[10px] tracking-label uppercase text-gray-300'">
                    <span [class]="equipment.is_available ? 'w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block' : 'w-1.5 h-1.5 rounded-full bg-gray-300 inline-block'"></span>
                    {{ equipment.is_available ? 'Available' : 'Unavailable' }}
                  </span>
                </div>

                <h1 class="text-3xl font-bold uppercase tracking-tight leading-tight mb-4">
                  {{ equipment.name }}
                </h1>

                <div class="flex items-baseline gap-1.5">
                  <span class="text-3xl font-semibold tracking-tight">
                    ₸{{ equipment.daily_rate | number:'1.0-0' }}
                  </span>
                  <span class="text-sm text-gray-400">/ day</span>
                </div>
              </div>

              <!-- Divider -->
              <div class="border-t border-gray-100 my-6"></div>

              <!-- Booking form -->
              <div class="flex-1">
                <p class="text-[10px] tracking-label uppercase text-gray-400 mb-4">Rental Period</p>

                <div class="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label class="block text-[10px] tracking-label uppercase text-gray-400 mb-2">From</label>
                    <input type="date" [(ngModel)]="startDate" [min]="today"
                           class="w-full border-b border-gray-200 focus:border-black outline-none pb-2 text-sm bg-transparent transition-colors" />
                  </div>
                  <div>
                    <label class="block text-[10px] tracking-label uppercase text-gray-400 mb-2">To</label>
                    <input type="date" [(ngModel)]="endDate" [min]="startDate || today"
                           class="w-full border-b border-gray-200 focus:border-black outline-none pb-2 text-sm bg-transparent transition-colors" />
                  </div>
                </div>

                <!-- Duration + total -->
                @if (getDays() > 0) {
                  <div class="bg-gray-50 px-4 py-3 mb-5">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-gray-500">
                        {{ getDays() }} {{ getDays() === 1 ? 'day' : 'days' }}
                        × ₸{{ equipment.daily_rate | number:'1.0-0' }}
                      </span>
                      <span class="font-semibold">₸{{ getTotal() | number:'1.0-0' }}</span>
                    </div>
                  </div>
                }

                <!-- Status messages -->
                @if (availabilityMessage) {
                  <div [class]="isAvailable
                    ? 'flex items-center gap-2 text-[11px] tracking-label uppercase text-emerald-600 mb-4'
                    : 'flex items-center gap-2 text-[11px] tracking-label uppercase text-red-500 mb-4'">
                    <span [class]="isAvailable ? 'w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0' : 'w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0'"></span>
                    {{ availabilityMessage }}
                  </div>
                }

                @if (bookingMessage) {
                  <div [class]="bookingSuccess
                    ? 'flex items-center gap-2 text-[11px] tracking-label uppercase text-emerald-600 mb-4'
                    : 'flex items-center gap-2 text-[11px] tracking-label uppercase text-red-500 mb-4'">
                    <span [class]="bookingSuccess ? 'w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0' : 'w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0'"></span>
                    {{ bookingMessage }}
                  </div>
                }

                <!-- Action buttons -->
                <div class="space-y-2">
                  <button
                    (click)="checkAvailability()"
                    [disabled]="!startDate || !endDate || checkingAvailability"
                    class="w-full py-3.5 text-[11px] tracking-brand uppercase font-medium
                           border border-black hover:bg-black hover:text-white transition-colors
                           disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed">
                    {{ checkingAvailability ? 'Checking...' : 'Check Availability' }}
                  </button>

                  <button
                    (click)="bookEquipment()"
                    [disabled]="!startDate || !endDate || booking || !equipment.is_available"
                    class="w-full py-3.5 text-[11px] tracking-brand uppercase font-medium
                           bg-black text-white hover:bg-gray-900 transition-colors
                           disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed">
                    {{ booking ? 'Booking...' : (authService.isAuthenticated() ? 'Book Now' : 'Sign In to Book') }}
                  </button>
                </div>

                @if (!authService.isAuthenticated()) {
                  <p class="mt-3 text-center text-[11px] text-gray-400">
                    <a routerLink="/login" class="border-b border-gray-300 hover:border-black hover:text-black transition-colors pb-0.5">Sign in</a>
                    &nbsp;to make a booking
                  </p>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class EquipmentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly equipmentService = inject(EquipmentService);
  private readonly bookingService = inject(BookingService);
  public readonly authService = inject(AuthService);

  equipment: Equipment | null = null;
  loading = false;
  error = '';
  startDate = '';
  endDate = '';
  today = new Date().toISOString().split('T')[0];
  checkingAvailability = false;
  availabilityMessage = '';
  isAvailable = false;
  booking = false;
  bookingMessage = '';
  bookingSuccess = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    this.equipmentService.getById(id).subscribe({
      next: (data) => { this.equipment = data; this.loading = false; },
      error: () => { this.error = 'Not found.'; this.loading = false; },
    });
  }

  getDays(): number {
    if (!this.startDate || !this.endDate) return 0;
    return Math.max(0, Math.round(
      (new Date(this.endDate).getTime() - new Date(this.startDate).getTime()) / 86400000
    ));
  }

  getTotal(): number {
    if (!this.equipment) return 0;
    return this.getDays() * parseFloat(this.equipment.daily_rate);
  }

  checkAvailability(): void {
    if (!this.equipment || !this.startDate || !this.endDate) return;
    this.checkingAvailability = true;
    this.availabilityMessage = '';
    this.bookingService.checkAvailability({
      equipment_id: this.equipment.id,
      start_date: this.startDate,
      end_date: this.endDate,
    }).subscribe({
      next: (res) => {
        this.isAvailable = res.available;
        this.availabilityMessage = res.available
          ? 'Available for selected dates'
          : 'Not available for selected dates';
        this.checkingAvailability = false;
      },
      error: (err) => {
        this.availabilityMessage = err.error?.end_date?.[0] || err.error?.start_date?.[0] || 'Check failed';
        this.isAvailable = false;
        this.checkingAvailability = false;
      },
    });
  }

  bookEquipment(): void {
    if (!this.equipment || !this.startDate || !this.endDate) return;
    if (!this.authService.isAuthenticated()) { this.router.navigate(['/login']); return; }
    this.booking = true;
    this.bookingMessage = '';
    this.bookingService.create({
      equipment: this.equipment.id,
      start_date: this.startDate,
      end_date: this.endDate,
    }).subscribe({
      next: () => {
        this.bookingSuccess = true;
        this.bookingMessage = 'Booking confirmed — view in My Bookings';
        this.booking = false;
      },
      error: (err) => {
        this.bookingSuccess = false;
        this.bookingMessage = err.error?.non_field_errors?.[0]
          || err.error?.detail
          || 'Booking failed — please try again';
        this.booking = false;
      },
    });
  }
}
