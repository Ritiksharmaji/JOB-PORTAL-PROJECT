import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import AOS from 'aos';
import { filter, map } from 'rxjs';
import { ThemeService } from './core/services/theme.service';
import { LoadingStore } from './core/state/loading.store';
import { Footer } from './layout/footer/footer';
import { Header } from './layout/header/header';
import { LoadingOverlay } from './shared/ui/loading-overlay/loading-overlay';
import { ToastContainer } from './shared/ui/toast-container/toast-container';

const CHROMELESS_ROUTES = ['/login', '/signup'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, LoadingOverlay, ToastContainer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-toast-container />
    <app-loading-overlay [visible]="loading.visible()" />
    <div class="relative overflow-hidden">
      @if (showChrome()) {
        <app-header />
      }
      <main>
        <router-outlet />
      </main>
      @if (showChrome()) {
        <app-footer />
      }
    </div>
  `,
})
export class App {
  private readonly router = inject(Router);
  protected readonly loading = inject(LoadingStore);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** Header and footer are hidden on the login/signup screen. */
  protected readonly showChrome = computed(() => !CHROMELESS_ROUTES.includes(this.url().split('?')[0]));

  constructor() {
    inject(ThemeService); // applies the saved light/dark theme on start-up
    afterNextRender(() => {
      AOS.init({ offset: 0, duration: 800, easing: 'ease-out', once: false });
    });
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => setTimeout(() => AOS.refresh()));
  }
}
