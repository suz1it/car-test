import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarsStore, CarsSortColumn } from '../../stores/cars.store';

@Component({
  selector: 'app-cars-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cars-list.component.html',
  styleUrl: './cars-list.component.scss',
})
export class CarsListComponent {
  readonly store = inject(CarsStore);
  readonly Math = Math;

  onMakeSelect(value: string): void {
    this.store.setMakeFilter(value);
    this.store.applyFilter();
  }

  setSort(column: CarsSortColumn): void {
    this.store.setSort(column);
  }

  goToPage(page: number): void {
    this.store.setPage(page);
  }

  onPageSizeChange(pageSize: number | string): void {
    this.store.setPageSize(Number(pageSize));
  }

  getPageNumbers(): number[] {
    const total: number = this.store.totalPages();
    const current: number = this.store.page();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const set = new Set<number>([1, total]);
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
      set.add(i);
    }
    return Array.from(set).sort((a, b) => a - b);
  }

  getSortIcon(column: CarsSortColumn): 'asc' | 'desc' | 'none' {
    if (this.store.sortColumn() !== column) return 'none';
    return this.store.sortDirection();
  }
}
