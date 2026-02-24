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

type CarsState = {
  cars: Car[];
  loading: boolean;
  error: string | null;
  makeFilter: string;
};

const initialState: CarsState = {
  cars: [],
  loading: true,
  error: null,
  makeFilter: '',
};

export const CarsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ cars, makeFilter }) => ({
    filteredCars: computed(() => {
      const list = cars();
      const filter = makeFilter().trim().toLowerCase();
      if (!filter) return list;
      return list.filter((car) => car.make.toLowerCase().includes(filter));
    }),
  })),
  withMethods((store, carService = inject(CarService)) => {
    const loadCars = (make?: string): void => {
      patchState(store, { loading: true, error: null });
      carService.getCars(make).subscribe({
        next: (cars) => patchState(store, { cars, loading: false }),
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
      applyFilter(): void {
        loadCars(store.makeFilter().trim() || undefined);
      },
    };
  }),
  withHooks((store) => {
    const carService = inject(CarService);
    return {
      onInit() {
        patchState(store, { loading: true, error: null });
        carService.getCars().subscribe({
          next: (cars) => patchState(store, { cars, loading: false }),
          error: (err) =>
            patchState(store, {
              error: err?.message ?? 'Failed to load cars',
              loading: false,
            }),
        });
      },
    };
  })
);
