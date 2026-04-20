import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Booking,
  CreateBookingPayload,
  AvailabilityPayload,
  AvailabilityResponse,
} from '../interfaces/booking.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/bookings`;

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/`);
  }

  create(data: CreateBookingPayload): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/`, data);
  }

  cancel(id: number): Observable<Booking> {
    return this.http.patch<Booking>(`${this.baseUrl}/${id}/cancel/`, {});
  }

  checkAvailability(payload: AvailabilityPayload): Observable<AvailabilityResponse> {
    return this.http.post<AvailabilityResponse>(`${this.baseUrl}/check-availability/`, payload);
  }
}
