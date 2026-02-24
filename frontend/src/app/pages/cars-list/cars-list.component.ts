import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CarsStore } from '../../stores/cars.store';

@Component({
  selector: 'app-cars-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cars-list.component.html',
  styleUrl: './cars-list.component.scss',
})
export class CarsListComponent implements OnInit {
  readonly store = inject(CarsStore);
  private readonly destroyRef = inject(DestroyRef);

  private readonly searchInput$ = new Subject<string>();

  ngOnInit(): void {
    this.searchInput$
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        const make = value.trim() || undefined;
        this.store.loadCars(make);
      });
  }

  onSearchInput(value: string): void {
    this.store.setMakeFilter(value);
    this.searchInput$.next(value);
  }
}
