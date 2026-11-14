import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject, model, signal, viewChildren } from '@angular/core';
import { UserApiService } from '../../core/services/api/user-api.service';
import { ToastService } from '../../core/services/toast.service';
import { getErrorMessage } from '../../core/utils/http-error.utils';
import { PASSWORD_HINT, PASSWORD_PATTERN } from '../../core/utils/validators';
import { Icon } from '../../shared/ui/icon/icon';
import { Modal } from '../../shared/ui/modal/modal';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

/** Forgot-password flow: email -> OTP -> new password. (React: SignUpLogin/ResetPassword.) */
@Component({
  selector: 'app-reset-password-modal',
  imports: [Modal, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [(open)]="open" title="Reset Password">
      <div class="flex flex-col gap-6">
        <div class="field">
          <label class="field-label required" for="reset-email">Email</label>
          <div class="relative">
            <app-icon name="at" [size]="16" class="absolute top-1/2 left-3 -translate-y-1/2 text-mine-shaft-400" />
            <input
              id="reset-email"
              type="email"
              class="field-input h-11 pr-28 pl-9"
              placeholder="Your email"
              [value]="email()"
              [disabled]="otpSent()"
              (input)="email.set($any($event.target).value)"
            />
            <button type="button" class="btn btn-filled btn-sm absolute top-1/2 right-1.5 -translate-y-1/2" [disabled]="!email() || otpSent() || sending()" (click)="sendOtp()">
              @if (sending() && !otpSent()) {
                <app-icon name="loader-2" [size]="14" class="animate-spin" />
              }
              Send OTP
            </button>
          </div>
        </div>

        @if (otpSent()) {
          <div class="mx-auto flex gap-3" (paste)="onPaste($event)">
            @for (digit of otp(); track $index) {
              <input
                #otpBox
                class="field-input h-11 w-11 text-center text-lg"
                inputmode="numeric"
                maxlength="1"
                [attr.aria-label]="'OTP digit ' + ($index + 1)"
                [value]="digit"
                [disabled]="verified()"
                (input)="onDigit($index, $any($event.target))"
                (keydown.backspace)="onBackspace($index)"
              />
            }
          </div>
        }

        @if (otpSent() && !verified()) {
          <div class="flex gap-2">
            <button type="button" class="btn btn-light btn-block" [disabled]="countdown() > 0 || sending()" (click)="sendOtp()">
              {{ countdown() > 0 ? countdown() : 'Resend' }}
            </button>
            <button type="button" class="btn btn-filled btn-block" (click)="changeEmail()">Change Email</button>
          </div>
        }

        @if (verified()) {
          <div class="field">
            <label class="field-label required" for="reset-password">Password</label>
            <div class="relative">
              <app-icon name="lock" [size]="16" class="absolute top-1/2 left-3 -translate-y-1/2 text-mine-shaft-400" />
              <input id="reset-password" type="password" class="field-input pl-9" [class.invalid]="!!passwordError()" placeholder="Password" [value]="password()" (input)="password.set($any($event.target).value)" />
            </div>
            @if (passwordError(); as message) {
              <span class="field-error">{{ message }}</span>
            }
          </div>
          <button type="button" class="btn btn-filled" [disabled]="!password() || !!passwordError()" (click)="resetPassword()">Reset Password</button>
        }
      </div>
    </app-modal>
  `,
})
export class ResetPasswordModal {
  private readonly userApi = inject(UserApiService);
  private readonly toast = inject(ToastService);
  private readonly otpBoxes = viewChildren<ElementRef<HTMLInputElement>>('otpBox');

  readonly open = model(false);

  protected readonly email = signal('');
  protected readonly otp = signal<string[]>(Array(OTP_LENGTH).fill(''));
  protected readonly otpSent = signal(false);
  protected readonly sending = signal(false);
  protected readonly verified = signal(false);
  protected readonly countdown = signal(0);
  protected readonly password = signal('');
  protected readonly passwordError = computed(() =>
    this.password() && !PASSWORD_PATTERN.test(this.password()) ? PASSWORD_HINT : null,
  );

  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopTimer());
  }

  protected sendOtp(): void {
    this.sending.set(true);
    this.userApi.sendOtp(this.email()).subscribe({
      next: () => {
        this.sending.set(false);
        this.otpSent.set(true);
        this.toast.success('OTP Sent Successfully.', 'Enter OTP to reset password.');
        this.startTimer();
      },
      error: (err) => {
        this.sending.set(false);
        this.toast.error('OTP Sending Failed.', getErrorMessage(err));
      },
    });
  }

  protected changeEmail(): void {
    this.otpSent.set(false);
    this.verified.set(false);
    this.otp.set(Array(OTP_LENGTH).fill(''));
    this.stopTimer();
  }

  protected onDigit(index: number, el: HTMLInputElement): void {
    const digit = el.value.replace(/\D/g, '').slice(-1);
    el.value = digit;
    this.otp.update((list) => list.map((d, i) => (i === index ? digit : d)));
    if (digit) this.otpBoxes()[index + 1]?.nativeElement.focus();
    this.verifyIfComplete();
  }

  protected onBackspace(index: number): void {
    if (!this.otp()[index] && index > 0) this.otpBoxes()[index - 1]?.nativeElement.focus();
  }

  protected onPaste(event: ClipboardEvent): void {
    const digits = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!digits) return;
    event.preventDefault();
    this.otp.set(Array.from({ length: OTP_LENGTH }, (_, i) => digits[i] ?? ''));
    this.verifyIfComplete();
  }

  protected resetPassword(): void {
    this.userApi.resetPassword(this.email(), this.password()).subscribe({
      next: () => {
        this.toast.success('Password Reset Successfully.', 'You can now log in with your new password.');
        this.resetState();
        this.open.set(false);
      },
      error: (err) => this.toast.error('Password Reset Failed.', getErrorMessage(err)),
    });
  }

  private verifyIfComplete(): void {
    const code = this.otp().join('');
    if (code.length !== OTP_LENGTH) return;
    this.userApi.verifyOtp(this.email(), code).subscribe({
      next: () => {
        this.verified.set(true);
        this.stopTimer();
        this.toast.success('OTP Verified Successfully.', 'Enter new password.');
      },
      error: (err) => this.toast.error('OTP Verification Failed.', getErrorMessage(err)),
    });
  }

  private startTimer(): void {
    this.stopTimer();
    this.countdown.set(RESEND_SECONDS);
    this.timer = setInterval(() => {
      this.countdown.update((s) => s - 1);
      if (this.countdown() <= 0) this.stopTimer();
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.countdown.set(0);
  }

  private resetState(): void {
    this.changeEmail();
    this.email.set('');
    this.password.set('');
  }
}
