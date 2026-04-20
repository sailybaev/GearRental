export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  id: number;
  equipment: number;
  equipment_name: string;
  equipment_image: string | null;
  start_date: string;
  end_date: string;
  total_price: string;
  status: BookingStatus;
  created_at: string;
}

export interface CreateBookingPayload {
  equipment: number;
  start_date: string;
  end_date: string;
}

export interface AvailabilityPayload {
  equipment_id: number;
  start_date: string;
  end_date: string;
}

export interface AvailabilityResponse {
  available: boolean;
}
