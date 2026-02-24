import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { RegistrationSignalRService } from '../../services/registration-signalr.service';
import { CarService } from '../../services/car.service';
import {
  RegistrationStatus,
  RegistrationStatusType,
  EXPIRING_SOON_DAYS,
} from '../../models/registration-status.model';

type SortColumn =
  | 'registrationNumber'
  | 'make'
  | 'model'
  | 'registrationExpiryDate'
  | 'status';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-registration-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration-status.component.html',
  styleUrl: './registration-status.component.scss',
})
export class RegistrationStatusComponent implements OnInit, OnDestroy {
  readonly signalr = inject(RegistrationSignalRService);
  readonly carService = inject(CarService);
  private readonly destroyRef = inject(DestroyRef);

  statuses = signal<RegistrationStatus[]>([]);
  totalCount = signal(0);
  page = signal(1);
  pageSize = signal(10);
  loading = signal(true);
  error = signal<string | null>(null);
  searchQuery = signal('');
  statusFilter = signal<RegistrationStatusType | 'all'>('all');
  sortColumn = signal<SortColumn>('registrationExpiryDate');
  sortDirection = signal<SortDirection>('asc');

  private readonly searchSubject = new Subject<string>();

  readonly Math = Math;

  /** Get status type for a registration (valid, expiringSoon, expired) */
  getStatusType(status: RegistrationStatus): RegistrationStatusType {
    if (status.isExpired) return 'expired';
    const expiry = new Date(status.registrationExpiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= EXPIRING_SOON_DAYS ? 'expiringSoon' : 'valid';
  }

  totalPages = (): number =>
    Math.ceil(this.totalCount() / this.pageSize()) || 1;
  hasNextPage = (): boolean => this.page() < this.totalPages();
  hasPrevPage = (): boolean => this.page() > 1;

  loadStatuses(): void {
    this.loading.set(true);
    this.error.set(null);
    this.carService
      .getRegistrationStatuses({
        search: this.searchQuery().trim() || undefined,
        statusFilter: this.statusFilter(),
        page: this.page(),
        pageSize: this.pageSize(),
        sortColumn: this.sortColumn(),
        sortDirection: this.sortDirection(),
      })
      .subscribe({
        next: (result) => {
          this.statuses.set(result.items);
          this.totalCount.set(result.totalCount);
          this.page.set(result.page);
          this.pageSize.set(result.pageSize);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.message ?? 'Failed to load registration statuses');
          this.loading.set(false);
        },
      });
  }

  ngOnInit(): void {
    this.signalr.connect();
    this.loadStatuses();
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.searchQuery.set(value);
        this.page.set(1);
        this.loadStatuses();
      });
  }

  ngOnDestroy(): void {
    this.signalr.disconnect();
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  setStatusFilter(value: RegistrationStatusType | 'all'): void {
    this.statusFilter.set(value);
    this.page.set(1);
    this.loadStatuses();
  }

  setSort(column: SortColumn): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(
        this.sortDirection() === 'asc' ? 'desc' : 'asc'
      );
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.page.set(1);
    this.loadStatuses();
  }

  getSortIcon(column: SortColumn): 'asc' | 'desc' | 'none' {
    if (this.sortColumn() !== column) return 'none';
    return this.sortDirection();
  }

  goToPage(p: number): void {
    this.page.set(p);
    this.loadStatuses();
  }

  onPageSizeChange(pageSize: number | string): void {
    this.pageSize.set(Number(pageSize));
    this.page.set(1);
    this.loadStatuses();
  }

  getPageNumbers(): number[] {
    const total: number = this.totalPages();
    const current: number = this.page();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const set = new Set<number>([1, total]);
    for (
      let i = Math.max(1, current - 2);
      i <= Math.min(total, current + 2);
      i++
    ) {
      set.add(i);
    }
    return Array.from(set).sort((a, b) => a - b);
  }
}
