import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Certification } from '../../../core/models';
import { fromMonthInputValue, toMonthInputValue } from '../../../core/utils/date.utils';
import { AppValidators } from '../../../core/utils/validators';
import { COMPANY_NAMES } from '../../../data/options.data';
import { CreatableSelect } from '../../../shared/ui/creatable-select/creatable-select';

@Component({
  selector: 'app-certification-form',
  imports: [ReactiveFormsModule, CreatableSelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" data-aos="zoom-out" novalidate>
      <h3 class="text-lg font-semibold">Add Certificate</h3>
      <div class="my-3 flex gap-10 *:w-1/2 max-md:gap-5 max-xs:flex-wrap max-xs:*:w-full">
        <div class="field">
          <label class="field-label required" for="cert-name">Title</label>
          <input id="cert-name" class="field-input" [class.invalid]="!!error('name', 'Title')" formControlName="name" placeholder="Enter title" />
          @if (error('name', 'Title'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </div>
        <app-creatable-select formControlName="issuer" label="Issuer" placeholder="Enter Company Name" icon="briefcase" [options]="companies" required [error]="error('issuer', 'Issuer')" />
      </div>
      <div class="my-3 flex gap-10 *:w-1/2 max-md:gap-5 max-xs:flex-wrap max-xs:*:w-full">
        <div class="field">
          <label class="field-label required" for="cert-date">Issue Date</label>
          <input id="cert-date" type="month" class="field-input" formControlName="issueDate" [max]="thisMonth" />
        </div>
        <div class="field">
          <label class="field-label required" for="cert-id">Certificate ID</label>
          <input id="cert-id" class="field-input" [class.invalid]="!!error('certificateId', 'Certificate ID')" formControlName="certificateId" placeholder="Enter ID" />
          @if (error('certificateId', 'Certificate ID'); as message) {
            <span class="field-error">{{ message }}</span>
          }
        </div>
      </div>
      <div class="my-3 flex gap-5">
        <button type="submit" class="btn btn-success">Save</button>
        <button type="button" class="btn btn-danger" (click)="cancelled.emit()">Cancel</button>
      </div>
    </form>
  `,
})
export class CertificationForm {
  private readonly fb = inject(NonNullableFormBuilder);
  readonly saved = output<Certification>();
  readonly cancelled = output<void>();

  protected readonly companies = COMPANY_NAMES;
  protected readonly thisMonth = toMonthInputValue();
  private readonly submitted = signal(false);

  protected readonly form = this.fb.group({
    name: ['', AppValidators.notEmpty],
    issuer: ['', AppValidators.notEmpty],
    issueDate: [this.thisMonth, AppValidators.notEmpty],
    certificateId: ['', AppValidators.notEmpty],
  });

  protected error(name: 'name' | 'issuer' | 'certificateId', label: string): string | null {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted()) ? `${label} cannot be empty` : null;
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.saved.emit({ ...value, issueDate: fromMonthInputValue(value.issueDate) });
  }
}
