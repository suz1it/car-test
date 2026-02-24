import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Car } from '../models/car.model';
import { RegistrationStatus } from '../models/registration-status.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CarService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/cars`;

  getCars(make?: string): Observable<Car[]> {
    let params = new HttpParams();
    if (make?.trim()) {
      params = params.set('make', make.trim());
    }
    return this.http.get<Car[]>(this.apiUrl, { params });
  }

  getRegistrationStatuses(): Observable<RegistrationStatus[]> {
    return this.http.get<RegistrationStatus[]>(`${this.apiUrl}/registration-status`);
  }
}
