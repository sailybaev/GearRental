import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../core/interfaces/booking.interface';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-white">
      <!-- Header -->
      <div class="max-w-screen-2xl mx-auto px-6 pt-8 pb-4 border-b border-black/10">
        <p class="text-[10px] tracking-label uppercase text-gray-400 mb-1">Account</p>
        <h1 class="text-2xl font-bold uppercase tracking-tight">My Bookings</h1>
      </div>

      <div class="max-w-screen-2xl mx-auto px-6 py-8">
        @if (loading) {
          <div class="space-y-px bg-gray-100">
            @for (i of [1,2,3,4]; track i) {
              <div class="bg-white h-16 animate-pulse"></div>
            }
          </div>
        }

        @if (error) {
          <p class="text-xs tracking-label uppercase text-gray-400 py-20 text-center">{{ error }}</p>
        }

        @if (!loading && !error) {
          @if (bookings.length === 0) {
            <div class="py-32 text-center">
              <p class="text-xs tracking-label uppercase text-gray-300 mb-4">No bookings yet</p>
              <a routerLink="/catalog"
                 class="text-xs tracking-label uppercase border-b border-black pb-0.5 hover:opacity-50 transition-opacity">
                Browse Equipment →
              </a>
            </div>
          } @else {
            <!-- Table -->
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-100">
                  <th class="text-left py-3 text-[10px] tracking-label uppercase text-gray-400 font-normal w-12">#</th>
                  <th class="text-left py-3 text-[10px] tracking-label uppercase text-gray-400 font-normal">Equipment</th>
                  <th class="text-left py-3 text-[10px] tracking-label uppercase text-gray-400 font-normal hidden md:table-cell">Period</th>
                  <th class="text-left py-3 text-[10px] tracking-label uppercase text-gray-400 font-normal hidden sm:table-cell">Total</th>
                  <th class="text-left py-3 text-[10px] tracking-label uppercase text-gray-400 font-normal">Status</th>
                  <th class="text-right py-3 text-[10px] tracking-label uppercase text-gray-400 font-normal"></th>
                </tr>
              </thead>
              <tbody>
                @for (booking of bookings; track booking.id; let i = $index) {
                  <tr class="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td class="py-4 text-xs text-gray-300">{{ i + 1 }}</td>
                    <td class="py-4">
                      <div class="flex items-center gap-3">
                        @if (booking.equipment_image) {
                          <img [src]="booking.equipment_image" [alt]="booking.equipment_name"
                               class="w-10 h-12 object-cover bg-gray-50 flex-shrink-0" />
                        } @else {
                          <div class="w-10 h-12 bg-gray-100 flex-shrink-0"></div>
                        }
                        <span class="text-sm font-medium">{{ booking.equipment_name }}</span>
                      </div>
                    </td>
                    <td class="py-4 hidden md:table-cell">
                      <div class="text-xs text-gray-500">
                        <span>{{ booking.start_date }}</span>
                        <span class="text-gray-300 mx-1.5">→</span>
                        <span>{{ booking.end_date }}</span>
                      </div>
                    </td>
                    <td class="py-4 hidden sm:table-cell">
                      <span class="text-sm">₸{{ booking.total_price | number:'1.0-0' }}</span>
                    </td>
                    <td class="py-4">
                      <span [class]="statusClass(booking.status)">
                        {{ booking.status | uppercase }}
                      </span>
                    </td>
                    <td class="py-4 text-right">
                      @if (booking.status !== 'cancelled') {
                        <button
                          (click)="cancelBooking(booking)"
                          [disabled]="cancellingId === booking.id"
                          class="text-[11px] tracking-label uppercase text-gray-400 border-b border-gray-300
                                 hover:text-black hover:border-black transition-colors pb-0.5
                                 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {{ cancellingId === booking.id ? '...' : 'Cancel' }}
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>

            @if (cancelError) {
              <p class="mt-4 text-xs tracking-label uppercase text-red-500">{{ cancelError }}</p>
            }
          }
        }
      </div>
    </div>
  `,
})
export class BookingsComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  bookings: Booking[] = [];
  loading = false;
  error = '';
  cancellingId: number | null = null;
  cancelError = '';

  ngOnInit(): void { this.loadBookings(); }

  loadBookings(): void {
    this.loading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (data) => { this.bookings = data; this.loading = false; },
      error: () => { this.error = 'Failed to load bookings.'; this.loading = false; },
    });
  }

  cancelBooking(booking: Booking): void {
    this.cancellingId = booking.id;
    this.cancelError = '';
    this.bookingService.cancel(booking.id).subscribe({
      next: (updated) => {
        const idx = this.bookings.findIndex(b => b.id === updated.id);
        if (idx !== -1) this.bookings[idx] = updated;
        this.cancellingId = null;
      },
      error: (err) => {
        this.cancelError = err.error?.detail || 'Failed to cancel.';
        this.cancellingId = null;
      },
    });
  }

  statusClass(status: string): string {
    const base = 'text-[10px] tracking-label uppercase';
    if (status === 'confirmed') return `${base} text-green-600`;
    if (status === 'pending') return `${base} text-yellow-600`;
    return `${base} text-gray-300`;
  }
}
