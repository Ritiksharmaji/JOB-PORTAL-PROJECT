import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EMPTY, catchError, switchMap } from 'rxjs';
import { JobStatus } from '../../core/models';
import { JobApiService } from '../../core/services/api/job-api.service';
import { ToastService } from '../../core/services/toast.service';
import { LoadingStore } from '../../core/state/loading.store';
import { SessionStore } from '../../core/state/session.store';
import { getErrorMessage } from '../../core/utils/http-error.utils';
import { AppValidators } from '../../core/utils/validators';
import {
  COMPANY_NAMES,
  EXPERIENCE_LEVELS,
  JOB_DESCRIPTION_TEMPLATE,
  JOB_TITLES,
  JOB_TYPES,
  LOCATIONS,
} from '../../data/options.data';
import { CreatableSelect } from '../../shared/ui/creatable-select/creatable-select';
import { RichTextEditor } from '../../shared/ui/rich-text-editor/rich-text-editor';
import { TagsInput } from '../../shared/ui/tags-input/tags-input';

type JobField =
  | 'jobTitle' | 'company' | 'experience' | 'jobType' | 'location'
  | 'packageOffered' | 'skillsRequired' | 'about' | 'description';

/** Create (`/post-job/0`) or edit (`/post-job/:id`) a job. (React: PostJob/PostJob.) */
@Component({
  selector: 'app-post-job-page',
  imports: [ReactiveFormsModule, CreatableSelect, TagsInput, RichTextEditor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <hr class="divider mx-4" />
      <section class="px-16 py-5 max-bs:px-10 max-md:px-5" data-aos="zoom-out">
        <h1 class="section-title mb-5">{{ isEdit() ? 'Edit Job' : 'Post a Job' }}</h1>
        <form class="flex flex-col gap-5" [formGroup]="form" novalidate>
          <div class="flex gap-10 *:w-1/2 max-md:gap-5 max-sm:flex-wrap max-sm:*:w-full!">
            <app-creatable-select formControlName="jobTitle" label="Job Title" placeholder="Enter Job Title" [options]="options.jobTitles" required [error]="error('jobTitle', 'Title')" />
            <app-creatable-select formControlName="company" label="Company" placeholder="Enter Company Name" [options]="options.companies" required [error]="error('company', 'Company')" />
          </div>
          <div class="flex gap-10 *:w-1/2 max-md:gap-5 max-sm:flex-wrap max-sm:*:w-full!">
            <app-creatable-select formControlName="experience" label="Experience" placeholder="Enter Experience Level" [options]="options.experience" required [error]="error('experience', 'Experience')" />
            <app-creatable-select formControlName="jobType" label="Job Type" placeholder="Enter Job Type" [options]="options.jobTypes" required [error]="error('jobType', 'Job Type')" />
          </div>
          <div class="flex gap-10 *:w-1/2 max-md:gap-5 max-sm:flex-wrap max-sm:*:w-full!">
            <app-creatable-select formControlName="location" label="Location" placeholder="Enter Job Location" [options]="options.locations" required [error]="error('location', 'Location')" />
            <div class="field">
              <label class="field-label required" for="job-salary">Salary (LPA)</label>
              <input id="job-salary" type="number" min="1" max="300" class="field-input" [class.invalid]="!!error('packageOffered', 'Salary')" formControlName="packageOffered" placeholder="Enter Salary" />
              @if (error('packageOffered', 'Salary'); as message) {
                <span class="field-error">{{ message }}</span>
              }
            </div>
          </div>

          <app-tags-input formControlName="skillsRequired" label="Skills" placeholder="Enter skill" required clearable [error]="error('skillsRequired', 'Skills')" />

          <div class="field">
            <label class="field-label required" for="job-about">About Job</label>
            <textarea id="job-about" rows="2" class="field-input" [class.invalid]="!!error('about', 'About')" formControlName="about" placeholder="Enter about job.."></textarea>
            @if (error('about', 'About'); as message) {
              <span class="field-error">{{ message }}</span>
            }
          </div>

          <div class="field">
            <span class="field-label required">Job Description</span>
            <app-rich-text-editor formControlName="description" />
            @if (error('description', 'Description'); as message) {
              <span class="field-error">{{ message }}</span>
            }
          </div>

          <div class="flex gap-4">
            <button type="button" class="btn btn-light" (click)="save('ACTIVE')">Publish Job</button>
            <button type="button" class="btn btn-outline" (click)="save('DRAFT')">Save as Draft</button>
          </div>
        </form>
      </section>
    </div>
  `,
})
export class PostJobPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly jobApi = inject(JobApiService);
  private readonly session = inject(SessionStore);
  private readonly loading = inject(LoadingStore);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  /** Bound from the `:id` route param. "0" means a new job. */
  readonly id = input.required<string>();
  protected readonly isEdit = signal(false);
  protected readonly submitted = signal(false);

  protected readonly options = {
    jobTitles: JOB_TITLES,
    companies: COMPANY_NAMES,
    experience: EXPERIENCE_LEVELS,
    jobTypes: JOB_TYPES,
    locations: LOCATIONS,
  };

  protected readonly form = this.fb.group({
    jobTitle: ['', AppValidators.notEmpty],
    company: ['', AppValidators.notEmpty],
    experience: ['', AppValidators.notEmpty],
    jobType: ['', AppValidators.notEmpty],
    location: ['', AppValidators.notEmpty],
    packageOffered: [null as number | null, [Validators.required, Validators.min(1), Validators.max(300)]],
    skillsRequired: [[] as string[], AppValidators.notEmpty],
    about: ['', AppValidators.notEmpty],
    description: [JOB_DESCRIPTION_TEMPLATE, AppValidators.notEmpty],
  });

  constructor() {
    toObservable(this.id)
      .pipe(
        switchMap((id) => {
          this.submitted.set(false);
          this.isEdit.set(Number(id) !== 0);
          if (Number(id) === 0) {
            this.form.reset();
            return EMPTY;
          }
          return this.jobApi.getJob(id).pipe(this.loading.track(), catchError(() => EMPTY));
        }),
        takeUntilDestroyed(),
      )
      .subscribe((job) =>
        this.form.reset({
          jobTitle: job.jobTitle,
          company: job.company,
          experience: job.experience,
          jobType: job.jobType,
          location: job.location,
          packageOffered: job.packageOffered,
          skillsRequired: job.skillsRequired ?? [],
          about: job.about,
          description: job.description,
        }),
      );
  }

  protected error(name: JobField, label: string): string | null {
    const control = this.form.controls[name];
    if (!control.invalid || (!control.touched && !this.submitted())) return null;
    if (control.hasError('min') || control.hasError('max')) return `${label} must be between 1 and 300`;
    return `${label} cannot be empty`;
  }

  protected save(status: JobStatus): void {
    this.submitted.set(true);
    // Drafts may be incomplete; publishing requires every field.
    if (status === 'ACTIVE' && this.form.invalid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const user = this.session.user();
    if (!user) return;

    const value = this.form.getRawValue();
    const id = Number(this.id()) || undefined;
    this.jobApi
      .postJob({ ...value, packageOffered: Number(value.packageOffered ?? 0), id, postedBy: user.id, jobStatus: status })
      .pipe(this.loading.track())
      .subscribe({
        next: (job) => {
          this.toast.success('Success', status === 'ACTIVE' ? 'Job Posted Successfully' : 'Job Saved as Draft');
          this.router.navigate(['/posted-jobs', job.id]);
        },
        error: (err) => this.toast.error('Error', getErrorMessage(err)),
      });
  }
}
