import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Job } from '../../../core/models';
import { JobApiService } from '../../../core/services/api/job-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingStore } from '../../../core/state/loading.store';
import { ProfileStore } from '../../../core/state/profile.store';
import { SessionStore } from '../../../core/state/session.store';
import { getErrorMessage } from '../../../core/utils/http-error.utils';
import { JOB_FACTS } from '../../../data/options.data';
import { ImgFallbackDirective } from '../../directives/img-fallback.directive';
import { TimeAgoPipe } from '../../pipes/date.pipes';
import { SanitizeHtmlPipe } from '../../pipes/sanitize-html.pipe';
import { Icon } from '../../ui/icon/icon';

/**
 * Full job description. Applicants see Apply/Applied + bookmark; employers
 * (`editable`) see Edit/Reopen + Close. (React: JobDesc/Job.)
 */
@Component({
  selector: 'app-job-description',
  imports: [RouterLink, Icon, TimeAgoPipe, SanitizeHtmlPipe, ImgFallbackDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block', 'data-aos': 'zoom-out' },
  template: `
    @let j = job();
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <div class="flex shrink-0 rounded-xl bg-mine-shaft-800 p-3">
          <img class="h-14 w-14 object-contain max-xs:h-10 max-xs:w-10" [src]="'/Icons/' + j.company + '.png'" alt="" appImgFallback />
        </div>
        <div class="flex flex-col gap-1">
          <h1 class="text-2xl font-semibold max-xs:text-xl">{{ j.jobTitle }}</h1>
          <div class="flex flex-wrap gap-1 text-lg text-mine-shaft-300 max-xs:text-base">
            <span>{{ j.company }} &bull;</span>
            <span>{{ j.postTime | timeAgo }} &bull;</span>
            <span>{{ j.applicants?.length ?? 0 }} Applicants</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 max-sm:w-full sm:flex-col">
        @if (editable()) {
          <a class="btn btn-light max-sm:flex-1" [routerLink]="['/post-job', j.id]">{{ isClosed() ? 'Reopen' : 'Edit' }}</a>
          @if (!isClosed()) {
            <button type="button" class="btn btn-danger max-sm:flex-1" (click)="closeJob()">Close</button>
          }
        } @else {
          @if (hasApplied()) {
            <span class="btn btn-success max-sm:flex-1">Applied</span>
          } @else {
            <a class="btn btn-light max-sm:flex-1" [routerLink]="['/apply-job', j.id]">Apply</a>
          }
          <button
            type="button"
            [class]="saved() ? 'text-bright-sun-400' : 'text-mine-shaft-300 hover:text-bright-sun-400'"
            [attr.aria-label]="saved() ? 'Remove from saved jobs' : 'Save job'"
            (click)="profileStore.toggleSavedJob(j.id)"
          >
            <app-icon [name]="saved() ? 'bookmark-filled' : 'bookmark'" [size]="24" [stroke]="1.5" />
          </button>
        }
      </div>
    </div>

    <hr class="divider my-8" />
    <div class="flex justify-between gap-4 max-sm:flex-wrap">
      @for (fact of facts; track fact.key) {
        <div class="flex flex-col items-center gap-1 text-sm">
          <span class="flex h-12 w-12 items-center justify-center rounded-full bg-bright-sun-400/10 text-bright-sun-400 max-xs:h-8 max-xs:w-8">
            <app-icon [name]="fact.icon" [size]="26" />
          </span>
          <div class="text-mine-shaft-300 max-xs:text-sm">{{ fact.name }}</div>
          <div class="text-base font-semibold max-xs:text-sm">
            {{ j[fact.key] }}@if (fact.key === 'packageOffered') { LPA}
          </div>
        </div>
      }
    </div>

    <hr class="divider my-8" />
    <h2 class="mb-5 text-xl font-semibold">Required Skills</h2>
    <div class="flex flex-wrap gap-2">
      @for (skill of j.skillsRequired; track skill) {
        <span class="rounded-full bg-bright-sun-400/10 px-3 py-1.5 text-sm font-medium text-bright-sun-400 max-xs:text-xs">{{ skill }}</span>
      }
    </div>

    <hr class="divider my-8" />
    <div class="rich-text" [innerHTML]="j.description | sanitizeHtml"></div>

    <hr class="divider my-8" />
    <h2 class="mb-5 text-xl font-semibold">About Company</h2>
    <div class="mb-3 flex items-center justify-between max-xs:flex-wrap max-xs:gap-2">
      <div class="flex items-center gap-2">
        <div class="flex rounded-xl bg-mine-shaft-800 p-3">
          <img class="h-8 w-8 object-contain" [src]="'/Icons/' + j.company + '.png'" alt="" appImgFallback />
        </div>
        <div>
          <div class="text-lg font-medium">{{ j.company }}</div>
          <div class="text-mine-shaft-300">10k+ Employees</div>
        </div>
      </div>
      <a class="btn btn-light" [routerLink]="['/company', j.company]">Company Page</a>
    </div>
    <p class="text-justify text-mine-shaft-300 max-xs:text-sm">
      {{ j.company }} is a fast-growing organisation building products used by millions of people. The team values
      ownership, curiosity and craftsmanship, and offers an environment where you can learn new technologies, work
      on meaningful problems and grow your career alongside talented colleagues.
    </p>
  `,
})
export class JobDescription {
  protected readonly profileStore = inject(ProfileStore);
  private readonly session = inject(SessionStore);
  private readonly jobApi = inject(JobApiService);
  private readonly loading = inject(LoadingStore);
  private readonly toast = inject(ToastService);

  readonly job = input.required<Job>();
  /** Employer view: shows Edit/Reopen/Close instead of Apply/bookmark. */
  readonly editable = input(false);
  /** Fired after the employer closes the job. */
  readonly jobClosed = output<Job>();

  protected readonly facts = JOB_FACTS;
  protected readonly isClosed = computed(() => this.job().jobStatus === 'CLOSED');
  protected readonly saved = computed(() => this.profileStore.savedJobs().includes(this.job().id));
  protected readonly hasApplied = computed(
    () => !!this.job().applicants?.some((a) => a.applicantId === this.session.userId()),
  );

  protected closeJob(): void {
    this.jobApi
      .postJob({ ...this.job(), jobStatus: 'CLOSED' })
      .pipe(this.loading.track())
      .subscribe({
        next: (job) => {
          this.toast.success('Job Closed', 'Job has been closed successfully');
          this.jobClosed.emit(job);
        },
        error: (err) => this.toast.error('Error', getErrorMessage(err)),
      });
  }
}
