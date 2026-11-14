import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { Icon } from '../../shared/ui/icon/icon';
import { LoginForm } from './login-form';
import { SignupForm } from './signup-form';

/**
 * /login and /signup on one sliding canvas: [ Login | Brand | Sign up ].
 * The canvas translates left on /signup. (React: Pages/SignUpPage.)
 */
@Component({
  selector: 'app-auth-page',
  imports: [RouterLink, Icon, LoginForm, SignupForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative h-screen w-screen overflow-hidden max-sm:overflow-y-auto" data-aos="zoom-out">
      <a routerLink="/" class="btn btn-light absolute top-5 left-5 z-10"><app-icon name="arrow-left" /> Home</a>

      <div
        class="relative flex transition-transform duration-1000 ease-in-out *:shrink-0"
        [class]="isSignup() ? '-translate-x-1/2 max-sm:-translate-x-full' : 'translate-x-0'"
      >
        <app-login-form class="flex w-1/2 flex-col justify-center gap-3 px-20 max-bs:px-10 max-md:px-5 max-sm:w-full" />

        <div
          class="flex h-screen w-1/2 flex-col items-center justify-center gap-5 bg-mine-shaft-900 transition-all duration-1000 max-sm:hidden"
          [class]="isSignup() ? 'rounded-r-[200px]' : 'rounded-l-[200px]'"
        >
          <div class="flex items-center gap-1 text-bright-sun-400">
            <app-icon name="anchor" [size]="64" [stroke]="2.5" />
            <div class="text-6xl font-semibold max-bs:text-5xl max-md:text-4xl max-sm:text-3xl">JobHook</div>
          </div>
          <div class="text-2xl font-semibold text-mine-shaft-200 max-bs:text-xl max-md:text-lg">Find the job made for you</div>
        </div>

        <app-signup-form class="flex w-1/2 flex-col justify-center gap-3 px-20 max-bs:px-10 max-md:px-5 max-sm:w-full max-sm:py-20" />
      </div>
    </div>
  `,
})
export class AuthPage {
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly isSignup = computed(() => this.url().startsWith('/signup'));
}
