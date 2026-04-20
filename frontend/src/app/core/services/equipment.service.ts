import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Equipment, EquipmentFilters } from '../interfaces/equipment.interface';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EquipmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/equipment`;

  getAll(filters?: EquipmentFilters): Observable<Equipment[]> {
    let params = new HttpParams();
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.min_price != null) params = params.set('min_price', filters.min_price.toString());
    if (filters?.max_price != null) params = params.set('max_price', filters.max_price.toString());
    if (filters?.is_available != null) params = params.set('is_available', filters.is_available.toString());
    return this.http.get<Equipment[]>(`${this.baseUrl}/`, { params });
  }

  getById(id: number): Observable<Equipment> {
    return this.http.get<Equipment>(`${this.baseUrl}/${id}/`);
  }
}
