import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Job } from '../../../core/models';
import { ProfileStore } from '../../../core/state/profile.store';
import { SessionStore } from '../../../core/state/session.store';
import { ImgFallbackDirective } from '../../directives/img-fallback.directive';
import { InterviewTimePipe, TimeAgoPipe } from '../../pipes/date.pipes';
import { Icon } from '../../ui/icon/icon';

export type JobCardVariant = 'default' | 'applied' | 'saved' | 'offered' | 'interviewing';

/** Job summary card used by Find Jobs, Recommended Jobs, Company Jobs and Job History. */
@Component({
  selector: 'app-job-card',
  imports: [RouterLink, Icon, TimeAgoPipe, InterviewTimePipe, ImgFallbackDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-72 max-sm:w-full', 'data-aos': 'fade-up' },
  template: `
    @let j = job();
    <article class="card h-full">
      <div class="flex justify-between gap-2">
        <div class="flex items-center gap-2">
          <div class="logo-box">
            <img class="h-7 w-7 object-contain" [src]="'/Icons/' + j.company + '.png'" alt="" appImgFallback />
          </div>
          <div class="flex flex-col gap-1">
            <div class="font-semibold">{{ j.jobTitle }}</div>
            <div class="text-xs text-mine-shaft-300">
              <a class="hover:text-mine-shaft-200" [routerLink]="['/company', j.company]">{{ j.company }}</a>
              &bull; {{ j.applicants?.length ?? 0 }} Applicants
            </div>
          </div>
        </div>
        <button
          type="button"
          class="h-fit"
          [class]="saved() ? 'text-bright-sun-400' : 'text-mine-shaft-300 hover:text-bright-sun-400'"
          [attr.aria-label]="saved() ? 'Remove from saved jobs' : 'Save job'"
          (click)="profileStore.toggleSavedJob(j.id)"
        >
          <app-icon [name]="saved() ? 'bookmark-filled' : 'bookmark'" [size]="22" [stroke]="1.5" />
        </button>
      </div>

      <div class="flex flex-wrap gap-2">
        <span class="chip">{{ j.experience }}</span>
        <span class="chip">{{ j.jobType }}</span>
        <span class="chip">{{ j.location }}</span>
      </div>

      <p class="line-clamp-3 text-justify text-xs! text-mine-shaft-300">{{ j.about }}</p>

      <hr class="divider" />
      <div class="flex justify-between gap-2">
        <div class="font-semibold text-mine-shaft-200">&#8377;{{ j.packageOffered }} LPA</div>
        <div class="flex items-center gap-1 text-xs text-mine-shaft-400">
          <app-icon name="clock-hour-3" [size]="18" [stroke]="1.5" />
          {{ timeLabel() }} {{ j.postTime | timeAgo }}
        </div>
      </div>

      @if (variant() === 'offered' || variant() === 'interviewing') {
        <hr class="divider" />
      }
      @if (variant() === 'offered') {
        <div class="flex gap-2">
          <button type="button" class="btn btn-outline btn-block">Accept</button>
          <button type="button" class="btn btn-light btn-block">Reject</button>
        </div>
      }
      @if (variant() === 'interviewing') {
        <div class="flex items-center gap-1 text-sm">
          <app-icon name="calendar-month" [size]="18" class="text-bright-sun-400" />
          @if (interviewTime(); as time) {
            {{ time | interviewTime }}
          } @else {
            Interview being scheduled
          }
        </div>
      }

      <a class="btn btn-light btn-block mt-auto" [routerLink]="['/jobs', j.id]">View Job</a>
    </article>
  `,
})
export class JobCard {
  protected readonly profileStore = inject(ProfileStore);
  private readonly session = inject(SessionStore);

  readonly job = input.required<Job>();
  readonly variant = input<JobCardVariant>('default');

  protected readonly saved = computed(() => this.profileStore.savedJobs().includes(this.job().id));
  /** The logged-in applicant's interview slot for this job, if one is scheduled. */
  protected readonly interviewTime = computed(
    () => this.job().applicants?.find((a) => a.applicantId === this.session.userId())?.interviewTime ?? null,
  );
  protected readonly timeLabel = computed(() => {
    switch (this.variant()) {
      case 'applied':
      case 'interviewing':
        return 'Applied';
      case 'offered':
        return 'Interviewed';
      default:
        return 'Posted';
    }
  });
}
