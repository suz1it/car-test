import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Car } from '../models/car.model';
import { CarService } from '../services/car.service';
import type { CarsSortColumn, CarsSortDirection } from '../utils/cars.utils';

export type { CarsSortColumn, CarsSortDirection };

type CarsState = {
  cars: Car[];
  totalCount: number;
  page: number;
  pageSize: number;
  makes: string[];
  loading: boolean;
  error: string | null;
  makeFilter: string;
  sortColumn: CarsSortColumn;
  sortDirection: CarsSortDirection;
};

const initialState: CarsState = {
  cars: [],
  totalCount: 0,
  page: 1,
  pageSize: 10,
  makes: [],
  loading: true,
  error: null,
  makeFilter: '',
  sortColumn: 'make',
  sortDirection: 'asc',
};

export const CarsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ totalCount, page, pageSize }) => ({
    totalPages: computed(() => Math.ceil(totalCount() / pageSize()) || 1),
    hasNextPage: computed(() => page() < Math.ceil(totalCount() / pageSize())),
    hasPrevPage: computed(() => page() > 1),
  })),
  withMethods((store, carService = inject(CarService)) => {
    const loadCars = (): void => {
      patchState(store, { loading: true, error: null });
      carService
        .getCars({
          make: store.makeFilter().trim() || undefined,
          page: store.page(),
          pageSize: store.pageSize(),
          sortColumn: store.sortColumn(),
          sortDirection: store.sortDirection(),
        })
        .subscribe({
          next: (result) =>
            patchState(store, {
              cars: result.items,
              totalCount: result.totalCount,
              page: result.page,
              pageSize: result.pageSize,
              loading: false,
            }),
          error: (err) =>
            patchState(store, {
              error: err?.message ?? 'Failed to load cars',
              loading: false,
            }),
        });
    };
    return {
      loadCars,
      setMakeFilter(value: string): void {
        patchState(store, { makeFilter: value });
      },
      setSort(column: CarsSortColumn): void {
        const current = store.sortColumn();
        const dir = store.sortDirection();
        if (current === column) {
          patchState(store, { sortDirection: dir === 'asc' ? 'desc' : 'asc' });
        } else {
          patchState(store, { sortColumn: column, sortDirection: 'asc' });
        }
        patchState(store, { page: 1 });
        loadCars();
      },
      setPage(page: number): void {
        patchState(store, { page });
        loadCars();
      },
      setPageSize(pageSize: number): void {
        patchState(store, { pageSize, page: 1 });
        loadCars();
      },
      applyFilter(): void {
        patchState(store, { page: 1 });
        loadCars();
      },
    };
  }),
  withHooks((store) => {
    const carService = inject(CarService);
    return {
      onInit() {
        store.loadCars();
        carService.getMakes().subscribe({
          next: (makes) => patchState(store, { makes }),
        });
      },
    };
  })
);
