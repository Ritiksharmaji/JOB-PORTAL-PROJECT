import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountType } from '../../core/models';
import { UserApiService } from '../../core/services/api/user-api.service';
import { ToastService } from '../../core/services/toast.service';
import { getErrorMessage } from '../../core/utils/http-error.utils';
import { AppValidators, PASSWORD_HINT } from '../../core/utils/validators';
import { Icon } from '../../shared/ui/icon/icon';

type SignupField = 'name' | 'email' | 'password' | 'confirmPassword';

@Component({
  selector: 'app-signup-form',
  imports: [ReactiveFormsModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="contents" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <h1 class="text-2xl font-semibold">Create Account</h1>

      <div class="field">
        <label class="field-label required" for="signup-name">Full Name</label>
        <input id="signup-name" class="field-input" [class.invalid]="!!error('name')" formControlName="name" placeholder="Your name" autocomplete="name" />
        @if (error('name'); as message) {
          <span class="field-error">{{ message }}</span>
        }
      </div>

      <div class="field">
        <label class="field-label required" for="signup-email">Email</label>
        <div class="relative">
          <app-icon name="at" [size]="16" class="absolute top-1/2 left-3 -translate-y-1/2 text-mine-shaft-400" />
          <input id="signup-email" type="email" class="field-input pl-9" [class.invalid]="!!error('email')" formControlName="email" placeholder="Your email" autocomplete="email" />
        </div>
        @if (error('email'); as message) {
          <span class="field-error">{{ message }}</span>
        }
      </div>

      <div class="field">
        <label class="field-label required" for="signup-password">Password</label>
        <div class="relative">
          <app-icon name="lock" [size]="16" class="absolute top-1/2 left-3 -translate-y-1/2 text-mine-shaft-400" />
          <input id="signup-password" type="password" class="field-input pl-9" [class.invalid]="!!error('password')" formControlName="password" placeholder="Password" autocomplete="new-password" />
        </div>
        @if (error('password'); as message) {
          <span class="field-error">{{ message }}</span>
        }
      </div>

      <div class="field">
        <label class="field-label required" for="signup-confirm">Confirm Password</label>
        <div class="relative">
          <app-icon name="lock" [size]="16" class="absolute top-1/2 left-3 -translate-y-1/2 text-mine-shaft-400" />
          <input id="signup-confirm" type="password" class="field-input pl-9" [class.invalid]="!!error('confirmPassword')" formControlName="confirmPassword" placeholder="Confirm password" autocomplete="new-password" />
        </div>
        @if (error('confirmPassword'); as message) {
          <span class="field-error">{{ message }}</span>
        }
      </div>

      <fieldset class="field">
        <legend class="field-label required mb-1">You are?</legend>
        <div class="flex gap-6 max-xs:gap-3">
          @for (type of accountTypes; track type.value) {
            <label
              class="flex cursor-pointer items-center gap-2 rounded-lg border px-6 py-4 hover:bg-mine-shaft-900 max-sm:px-4 max-sm:py-2"
              [class]="form.controls.accountType.value === type.value ? 'border-bright-sun-400' : 'border-mine-shaft-800'"
            >
              <input type="radio" class="accent-bright-sun-400" formControlName="accountType" [value]="type.value" />
              {{ type.label }}
            </label>
          }
        </div>
      </fieldset>

      <button type="submit" class="btn btn-filled" [disabled]="loading()">
        @if (loading()) {
          <app-icon name="loader-2" [size]="18" class="animate-spin" />
        }
        Sign up
      </button>
      <p class="text-center max-sm:text-sm max-xs:text-xs">
        Have an account?
        <button type="button" class="text-bright-sun-400 hover:underline" (click)="goToLogin()">Login</button>
      </p>
    </form>
  `,
})
export class SignupForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly userApi = inject(UserApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly submitted = signal(false);
  protected readonly accountTypes: { value: AccountType; label: string }[] = [
    { value: 'APPLICANT', label: 'Applicant' },
    { value: 'EMPLOYER', label: 'Employer' },
  ];

  protected readonly form = this.fb.group(
    {
      name: ['', AppValidators.notEmpty],
      email: ['', [Validators.required, AppValidators.email]],
      password: ['', [Validators.required, AppValidators.strongPassword]],
      confirmPassword: ['', Validators.required],
      accountType: ['APPLICANT' as AccountType],
    },
    { validators: AppValidators.match('password', 'confirmPassword') },
  );

  protected error(name: SignupField): string | null {
    const control = this.form.controls[name];
    if (!control.dirty && !this.submitted()) return null;

    if (control.hasError('required')) {
      const labels: Record<SignupField, string> = {
        name: 'Name',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm password',
      };
      return `${labels[name]} is required.`;
    }
    if (name === 'email' && control.hasError('pattern')) return 'Email is invalid.';
    if (name === 'password' && control.hasError('pattern')) return PASSWORD_HINT;
    if (name === 'confirmPassword' && this.form.hasError('mismatch')) return 'Passwords do not match.';
    return null;
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    const { confirmPassword: _confirm, ...user } = this.form.getRawValue();
    this.loading.set(true);
    this.userApi.register(user).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Registered Successfully', 'Redirecting to login page...');
        this.goToLogin();
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error('Registration Failed', getErrorMessage(err));
      },
    });
  }

  protected goToLogin(): void {
    this.form.reset();
    this.submitted.set(false);
    this.router.navigate(['/login']);
  }
}
