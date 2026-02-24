import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegistrationSignalRService } from '../../services/registration-signalr.service';

@Component({
  selector: 'app-registration-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration-status.component.html',
  styleUrl: './registration-status.component.scss',
})
export class RegistrationStatusComponent implements OnInit, OnDestroy {
  readonly signalr = inject(RegistrationSignalRService);
  searchQuery = signal('');

  filteredStatuses = computed(() => {
    const statuses = this.signalr.registrationStatuses();
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return statuses;
    return statuses.filter(
      (s) =>
        s.make.toLowerCase().includes(query) ||
        s.model.toLowerCase().includes(query) ||
        s.registrationNumber.toLowerCase().includes(query) ||
        s.carId.toString().includes(query)
    );
  });

  ngOnInit(): void {
    this.signalr.connect();
  }

  ngOnDestroy(): void {
    this.signalr.disconnect();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }
}
