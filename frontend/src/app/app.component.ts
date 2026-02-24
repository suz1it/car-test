import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private navSubscription: ReturnType<typeof this.router.events.subscribe> | null = null;

  ngOnInit(): void {
    this.initFlowbiteWhenReady();
    this.navSubscription = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.initFlowbiteWhenReady());
  }

  ngOnDestroy(): void {
    this.navSubscription?.unsubscribe();
  }

  private initFlowbiteWhenReady(): void {
    setTimeout(() => initFlowbite(), 100);
  }
}
