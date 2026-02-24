import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarsStore } from '../../stores/cars.store';

@Component({
  selector: 'app-cars-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cars-list.component.html',
  styleUrl: './cars-list.component.scss',
})
export class CarsListComponent {
  readonly store = inject(CarsStore);

  onMakeSelect(value: string): void {
    this.store.setMakeFilter(value);
    this.store.loadCars(value.trim() || undefined);
  }
}
