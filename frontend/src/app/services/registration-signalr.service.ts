import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { RegistrationStatus } from '../models/registration-status.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RegistrationSignalRService implements OnDestroy {
  readonly registrationStatuses = signal<RegistrationStatus[]>([]);
  readonly isConnected = signal(false);
  readonly error = signal<string | null>(null);

  private hubConnection: signalR.HubConnection | null = null;

  ngOnDestroy(): void {
    this.disconnect();
  }

  async connect(): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/registration`, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('RegistrationStatusUpdated', (statuses: RegistrationStatus[]) => {
      this.registrationStatuses.set(statuses);
    });

    this.hubConnection.onreconnecting(() => this.isConnected.set(false));
    this.hubConnection.onreconnected(() => this.isConnected.set(true));
    this.hubConnection.onclose(() => this.isConnected.set(false));

    try {
      await this.hubConnection.start();
      this.isConnected.set(true);
      this.error.set(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      this.error.set(message);
      this.isConnected.set(false);
    }
  }

  disconnect(): void {
    this.hubConnection?.stop();
    this.hubConnection = null;
    this.isConnected.set(false);
  }
}
