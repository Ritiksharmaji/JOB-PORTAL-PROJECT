import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApiService } from '../../core/services/api/auth-api.service';
import { ToastService } from '../../core/services/toast.service';
import { SessionStore } from '../../core/state/session.store';
import { getErrorMessage } from '../../core/utils/http-error.utils';
import { Icon } from '../../shared/ui/icon/icon';
import { ResetPasswordModal } from './reset-password-modal';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, Icon, ResetPasswordModal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="contents" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <h1 class="text-2xl font-semibold">Login</h1>

      <div class="field">
        <label class="field-label required" for="login-email">Email</label>
        <div class="relative">
          <app-icon name="at" [size]="16" class="absolute top-1/2 left-3 -translate-y-1/2 text-mine-shaft-400" />
          <input id="login-email" type="email" class="field-input pl-9" [class.invalid]="showError('email')" formControlName="email" placeholder="Your email" autocomplete="email" />
        </div>
        @if (showError('email')) {
          <span class="field-error">Email is required.</span>
        }
      </div>

      <div class="field">
        <label class="field-label required" for="login-password">Password</label>
        <div class="relative">
          <app-icon name="lock" [size]="16" class="absolute top-1/2 left-3 -translate-y-1/2 text-mine-shaft-400" />
          <input
            id="login-password"
            class="field-input px-9"
            [class.invalid]="showError('password')"
            [type]="showPassword() ? 'text' : 'password'"
            formControlName="password"
            placeholder="Password"
            autocomplete="current-password"
          />
          <button type="button" class="absolute top-1/2 right-3 -translate-y-1/2 text-mine-shaft-400" [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'" (click)="showPassword.set(!showPassword())">
            <app-icon [name]="showPassword() ? 'eye-off' : 'eye'" [size]="16" />
          </button>
        </div>
        @if (showError('password')) {
          <span class="field-error">Password is required.</span>
        }
      </div>

      <button type="submit" class="btn btn-filled" [disabled]="loading()">
        @if (loading()) {
          <app-icon name="loader-2" [size]="18" class="animate-spin" />
        }
        Login
      </button>
      <p class="text-center max-sm:text-sm max-xs:text-xs">
        Don't have an account?
        <button type="button" class="text-bright-sun-400 hover:underline" (click)="goToSignup()">SignUp</button>
      </p>
      <button type="button" class="text-center text-bright-sun-400 hover:underline max-sm:text-sm max-xs:text-xs" (click)="resetOpen.set(true)">
        Forget Password?
      </button>
    </form>

    <app-reset-password-modal [(open)]="resetOpen" />
  `,
})
export class LoginForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly session = inject(SessionStore);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly submitted = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly resetOpen = signal(false);

  protected readonly form = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected showError(name: 'email' | 'password'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.dirty || this.submitted());
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    this.loading.set(true);
    this.authApi.login(this.form.getRawValue()).subscribe({
      next: ({ jwt }) => {
        this.loading.set(false);
        if (!this.session.login(jwt)) {
          this.toast.error('Login Failed', 'Received an invalid session token.');
          return;
        }
        this.toast.success('Login Successful', 'Redirecting to home page...');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error('Login Failed', getErrorMessage(err));
      },
    });
  }

  protected goToSignup(): void {
    this.form.reset();
    this.submitted.set(false);
    this.router.navigate(['/signup']);
  }
}
