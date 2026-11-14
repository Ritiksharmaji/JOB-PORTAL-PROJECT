import { ChangeDetectionStrategy, Component, OnInit, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Experience } from '../../../core/models';
import { fromMonthInputValue, toMonthInputValue } from '../../../core/utils/date.utils';
import { AppValidators } from '../../../core/utils/validators';
import { COMPANY_NAMES, JOB_TITLES, LOCATIONS } from '../../../data/options.data';
import { CreatableSelect } from '../../../shared/ui/creatable-select/creatable-select';

/** Add / edit one work experience. Emits the saved entry; the parent persists it. */
@Component({
  selector: 'app-experience-form',
  imports: [ReactiveFormsModule, CreatableSelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" data-aos="zoom-out" novalidate>
      <h3 class="text-lg font-semibold">{{ experience() ? 'Edit' : 'Add' }} Experience</h3>
      <div class="my-3 flex gap-10 *:w-1/2 max-md:gap-5 max-xs:flex-wrap max-xs:*:w-full">
        <app-creatable-select formControlName="title" label="Job Title" placeholder="Enter Job Title" icon="briefcase" [options]="jobTitles" required [error]="error('title', 'Title')" />
        <app-creatable-select formControlName="company" label="Company" placeholder="Enter Company Name" icon="briefcase" [options]="companies" required [error]="error('company', 'Company')" />
      </div>
      <app-creatable-select formControlName="location" label="Location" placeholder="Enter Job Location" icon="map-pin" [options]="locations" required [error]="error('location', 'Location')" />
      <div class="field my-3">
        <label class="field-label required" for="exp-summary">Summary</label>
        <textarea id="exp-summary" rows="3" class="field-input" [class.invalid]="!!error('description', 'Summary')" formControlName="description" placeholder="Enter Summary"></textarea>
        @if (error('description', 'Summary'); as message) {
          <span class="field-error">{{ message }}</span>
        }
      </div>
      <div class="my-3 flex gap-10 *:w-1/2 max-md:gap-5 max-xs:flex-wrap max-xs:*:w-full">
        <div class="field">
          <label class="field-label required" for="exp-start">Start Date</label>
          <input id="exp-start" type="month" class="field-input" formControlName="startDate" [max]="form.controls.endDate.value" />
        </div>
        <div class="field">
          <label class="field-label required" for="exp-end">End Date</label>
          <input id="exp-end" type="month" class="field-input" formControlName="endDate" [min]="form.controls.startDate.value" [max]="thisMonth" />
        </div>
      </div>
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" class="accent-bright-sun-400" formControlName="working" (change)="syncWorking()" /> Currently working here
      </label>
      <div class="my-3 flex gap-5">
        <button type="submit" class="btn btn-success">Save</button>
        <button type="button" class="btn btn-danger" (click)="cancelled.emit()">Cancel</button>
      </div>
    </form>
  `,
})
export class ExperienceForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);

  /** Existing entry to edit; omit to add a new one. */
  readonly experience = input<Experience | null>(null);
  readonly saved = output<Experience>();
  readonly cancelled = output<void>();

  protected readonly jobTitles = JOB_TITLES;
  protected readonly companies = COMPANY_NAMES;
  protected readonly locations = LOCATIONS;
  protected readonly thisMonth = toMonthInputValue();
  private readonly submitted = signal(false);

  protected readonly form = this.fb.group({
    title: ['', AppValidators.notEmpty],
    company: ['', AppValidators.notEmpty],
    location: ['', AppValidators.notEmpty],
    description: ['', AppValidators.notEmpty],
    startDate: [this.thisMonth],
    endDate: [this.thisMonth],
    working: [false],
  });

  ngOnInit(): void {
    const exp = this.experience();
    if (exp) {
      this.form.reset({
        ...exp,
        startDate: toMonthInputValue(exp.startDate),
        endDate: toMonthInputValue(exp.endDate),
      });
    }
    this.syncWorking();
  }

  protected syncWorking(): void {
    const end = this.form.controls.endDate;
    if (this.form.controls.working.value) end.disable();
    else end.enable();
  }

  protected error(name: 'title' | 'company' | 'location' | 'description', label: string): string | null {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted()) ? `${label} cannot be empty` : null;
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.saved.emit({
      ...value,
      startDate: fromMonthInputValue(value.startDate),
      endDate: fromMonthInputValue(value.endDate),
    });
  }
}
