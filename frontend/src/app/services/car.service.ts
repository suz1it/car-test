import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Car } from '../models/car.model';
import { PagedResult } from '../models/paged-result.model';
import {
  RegistrationStatus,
  type RegistrationStatusType,
} from '../models/registration-status.model';
import { environment } from '../../environments/environment';
import type { CarsSortColumn, CarsSortDirection } from '../utils/cars.utils';

export interface RegistrationStatusQueryParams {
  search?: string;
  statusFilter?: RegistrationStatusType | 'all';
  page?: number;
  pageSize?: number;
  sortColumn?: 'registrationNumber' | 'make' | 'model' | 'registrationExpiryDate' | 'status';
  sortDirection?: 'asc' | 'desc';
}

export interface CarsQueryParams {
  make?: string;
  page?: number;
  pageSize?: number;
  sortColumn?: CarsSortColumn;
  sortDirection?: CarsSortDirection;
}

@Injectable({ providedIn: 'root' })
export class CarService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/cars`;

  getCars(params: CarsQueryParams = {}): Observable<PagedResult<Car>> {
    let httpParams = new HttpParams();
    if (params.make?.trim()) {
      httpParams = httpParams.set('make', params.make.trim());
    }
    return this.http.get<PagedResult<Car>>(this.apiUrl, {
      params: httpParams
        .set('page', String(params.page ?? 1))
        .set('pageSize', String(params.pageSize ?? 10))
        .set('sortColumn', params.sortColumn ?? 'make')
        .set('sortDirection', params.sortDirection ?? 'asc'),
    });
  }

  getRegistrationStatuses(params: RegistrationStatusQueryParams = {}): Observable<PagedResult<RegistrationStatus>> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 1))
      .set('pageSize', String(params.pageSize ?? 10))
      .set('sortColumn', params.sortColumn ?? 'registrationExpiryDate')
      .set('sortDirection', params.sortDirection ?? 'asc');
    if (params.search?.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params.statusFilter && params.statusFilter !== 'all') {
      httpParams = httpParams.set('statusFilter', params.statusFilter);
    }
    return this.http.get<PagedResult<RegistrationStatus>>(`${this.apiUrl}/registration-status`, {
      params: httpParams,
    });
  }

  getMakes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/makes`);
  }
}
