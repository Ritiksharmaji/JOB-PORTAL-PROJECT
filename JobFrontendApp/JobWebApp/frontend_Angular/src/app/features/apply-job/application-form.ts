import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JobApiService } from '../../core/services/api/job-api.service';
import { ToastService } from '../../core/services/toast.service';
import { LoadingStore } from '../../core/state/loading.store';
import { SessionStore } from '../../core/state/session.store';
import { fileToBase64 } from '../../core/utils/file.utils';
import { getErrorMessage } from '../../core/utils/http-error.utils';
import { AppValidators } from '../../core/utils/validators';
import { Icon } from '../../shared/ui/icon/icon';

type ApplicationField = 'name' | 'email' | 'phone' | 'website' | 'coverLetter';

/** Two-step application: fill in -> preview -> submit. (React: ApplyJob/ApplicationForm.) */
@Component({
  selector: 'app-application-form',
  imports: [ReactiveFormsModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 class="mb-5 text-xl font-semibold">Submit Your Application</h2>
    <form class="flex flex-col gap-5" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <div class="flex gap-10 *:w-1/2 max-md:gap-5 max-sm:flex-wrap max-sm:*:w-full!">
        <div class="field">
          <label class="field-label required" for="app-name">Full Name</label>
          <input id="app-name" class="field-input" [class.plain]="preview()" formControlName="name" readonly />
        </div>
        <div class="field">
          <label class="field-label required" for="app-email">Email</label>
          <input id="app-email" class="field-input" [class.plain]="preview()" formControlName="email" readonly />
        </div>
      </div>

      <div class="flex gap-10 *:w-1/2 max-md:gap-5 max-sm:flex-wrap max-sm:*:w-full!">
        <div class="field">
          <label class="field-label required" for="app-phone">Phone Number</label>
          <input id="app-phone" type="tel" inputmode="numeric" maxlength="10" class="field-input" [class.plain]="preview()" [class.invalid]="showError('phone')" formControlName="phone" placeholder="Enter phone" [readonly]="preview()" />
          @if (showError('phone')) {
            <span class="field-error">Enter a valid 10 digit phone number</span>
          }
        </div>
        <div class="field">
          <label class="field-label required" for="app-website">Personal Website</label>
          <input id="app-website" type="url" class="field-input" [class.plain]="preview()" [class.invalid]="showError('website')" formControlName="website" placeholder="Enter url" [readonly]="preview()" />
          @if (showError('website')) {
            <span class="field-error">Website cannot be empty</span>
          }
        </div>
      </div>

      <div class="field">
        <label class="field-label required" for="app-resume">Resume/CV</label>
        @if (preview()) {
          <div class="flex items-center gap-2 font-semibold text-mine-shaft-300"><app-icon name="paperclip" [stroke]="1.5" /> {{ resume()?.name }}</div>
        } @else {
          <label class="field-input flex cursor-pointer items-center gap-2" [class.invalid]="showResumeError()">
            <app-icon name="paperclip" [stroke]="1.5" class="text-mine-shaft-400" />
            <span [class.text-mine-shaft-400]="!resume()">{{ resume()?.name ?? 'Attach Resume/CV (PDF)' }}</span>
            <input id="app-resume" type="file" accept="application/pdf" class="sr-only" (change)="onFile($any($event.target))" />
          </label>
          @if (showResumeError()) {
            <span class="field-error">Resume cannot be empty</span>
          }
        }
      </div>

      <div class="field">
        <label class="field-label" for="app-cover">Cover Letter</label>
        <textarea id="app-cover" rows="4" class="field-input" [class.plain]="preview()" formControlName="coverLetter" placeholder="Type something about yourself" [readonly]="preview()"></textarea>
      </div>

      @if (preview()) {
        <div class="flex gap-10">
          <button type="button" class="btn btn-outline btn-block" (click)="togglePreview()">Edit</button>
          <button type="submit" class="btn btn-light btn-block" [disabled]="submitting()">Submit</button>
        </div>
      } @else {
        <button type="button" class="btn btn-light" (click)="togglePreview()">Preview</button>
      }
    </form>
  `,
})
export class ApplicationForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly session = inject(SessionStore);
  private readonly jobApi = inject(JobApiService);
  private readonly loading = inject(LoadingStore);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly jobId = input.required<string>();

  protected readonly preview = signal(false);
  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);
  protected readonly resume = signal<File | null>(null);

  protected readonly form = this.fb.group({
    name: [this.session.user()?.name ?? '', AppValidators.notEmpty],
    email: [this.session.user()?.email ?? '', AppValidators.notEmpty],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    website: ['', AppValidators.notEmpty],
    coverLetter: [''],
  });

  protected showError(name: ApplicationField): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.dirty || this.submitted());
  }

  protected showResumeError(): boolean {
    return this.submitted() && !this.resume();
  }

  protected onFile(input: HTMLInputElement): void {
    this.resume.set(input.files?.[0] ?? null);
  }

  protected togglePreview(): void {
    this.submitted.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (this.form.invalid || !this.resume()) return;
    this.preview.update((p) => !p);
  }

  protected async submit(): Promise<void> {
    const file = this.resume();
    const user = this.session.user();
    if (!file || !user || this.form.invalid) return;

    this.submitting.set(true);
    const resume = await fileToBase64(file);
    const value = this.form.getRawValue();
    this.jobApi
      .applyJob(this.jobId(), { ...value, phone: Number(value.phone), applicantId: user.id, resume })
      .pipe(this.loading.track())
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.toast.success('Success', 'Job Applied Successfully');
          this.router.navigate(['/job-history']);
        },
        error: (err) => {
          this.submitting.set(false);
          this.toast.error('Error', getErrorMessage(err));
        },
      });
  }
}
