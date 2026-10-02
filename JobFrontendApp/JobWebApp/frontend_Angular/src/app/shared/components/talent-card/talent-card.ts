import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Applicant, ApplicationStatus, Profile } from '../../../core/models';
import { JobApiService } from '../../../core/services/api/job-api.service';
import { ProfileApiService } from '../../../core/services/api/profile-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { todayInputValue } from '../../../core/utils/date.utils';
import { openPdf } from '../../../core/utils/file.utils';
import { getErrorMessage } from '../../../core/utils/http-error.utils';
import { InterviewTimePipe } from '../../pipes/date.pipes';
import { PicturePipe } from '../../pipes/picture.pipe';
import { Icon } from '../../ui/icon/icon';
import { Modal } from '../../ui/modal/modal';

/**
 * - `default`  : talent search result (Profile + Message)
 * - `posted`   : new applicant of the employer's job (Profile + Schedule interview)
 * - `invited`  : applicant in interview stage (Accept / Reject)
 * - `offered`  : offered or rejected applicant (read-only)
 */
export type TalentCardMode = 'default' | 'posted' | 'invited' | 'offered';

/** Talent / applicant card. (React: FindTalent/TalentCard.) */
@Component({
  selector: 'app-talent-card',
  imports: [RouterLink, Icon, Modal, PicturePipe, InterviewTimePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-96 max-bs:w-[48%] max-md:w-full', 'data-aos': 'fade-up' },
  template: `
    @let p = profile();
    <article class="card h-full">
      <div class="flex justify-between">
        <div class="flex items-center gap-2">
          <div class="shrink-0 rounded-full bg-mine-shaft-800 p-2">
            <img class="h-14 w-14 rounded-full object-cover" [src]="p?.picture | picture" alt="" />
          </div>
          <div class="flex flex-col gap-1">
            <div class="text-lg font-semibold">{{ talent().name }}</div>
            <div class="text-sm text-mine-shaft-300">{{ p?.jobTitle }} &bull; {{ p?.company }}</div>
          </div>
        </div>
        <app-icon name="heart" [stroke]="1.5" class="text-mine-shaft-300" />
      </div>

      <div class="flex flex-wrap gap-2">
        @for (skill of topSkills(); track skill) {
          <span class="chip">{{ skill }}</span>
        }
      </div>

      <p class="line-clamp-3 text-justify text-xs text-mine-shaft-300">{{ p?.about }}</p>

      <hr class="divider" />
      @if (mode() === 'invited') {
        <div class="flex items-center gap-1 text-sm text-mine-shaft-200">
          <app-icon name="calendar-month" [stroke]="1.5" />
          Interview: {{ applicant()?.interviewTime | interviewTime }}
        </div>
      } @else {
        <div class="flex justify-between">
          <div class="font-medium text-mine-shaft-200">Exp: {{ p?.totalExp || 1 }} Years</div>
          <div class="flex items-center gap-1 text-xs text-mine-shaft-400">
            <app-icon name="map-pin" [size]="18" /> {{ p?.location }}
          </div>
        </div>
      }
      <hr class="divider" />

      <div class="flex gap-2">
        @if (mode() === 'invited') {
          <button type="button" class="btn btn-outline btn-block" (click)="changeStatus('OFFERED')">Accept</button>
          <button type="button" class="btn btn-light btn-block" (click)="changeStatus('REJECTED')">Reject</button>
        } @else {
          <a class="btn btn-outline btn-block" [routerLink]="['/talent-profile', p?.id]">Profile</a>
          @if (mode() === 'posted') {
            <button type="button" class="btn btn-light btn-block" (click)="scheduleOpen.set(true)">
              Schedule <app-icon name="calendar-month" [size]="18" />
            </button>
          } @else {
            <button type="button" class="btn btn-light btn-block">Message</button>
          }
        }
      </div>
      @if (applicant()) {
        <button type="button" class="btn btn-filled btn-block" (click)="applicationOpen.set(true)">View Application</button>
      }
    </article>

    <app-modal [(open)]="scheduleOpen" title="Schedule Interview">
      <div class="flex flex-col gap-4">
        <div class="field">
          <label class="field-label required" for="interview-date">Date</label>
          <input id="interview-date" type="date" class="field-input" [min]="today" [value]="date()" (input)="date.set($any($event.target).value)" />
        </div>
        <div class="field">
          <label class="field-label required" for="interview-time">Time</label>
          <input id="interview-time" type="time" class="field-input" [value]="time()" (input)="time.set($any($event.target).value)" />
        </div>
        <button type="button" class="btn btn-light btn-block" [disabled]="!date() || !time() || saving()" (click)="changeStatus('INTERVIEWING')">
          Schedule
        </button>
      </div>
    </app-modal>

    @if (applicant(); as a) {
      <app-modal [(open)]="applicationOpen" title="Application">
        <dl class="flex flex-col gap-4 text-sm">
          <div class="flex gap-4">
            <dt class="w-24 shrink-0">Email:</dt>
            <dd><a class="text-bright-sun-400 hover:underline" [href]="'mailto:' + a.email">{{ a.email }}</a></dd>
          </div>
          <div class="flex gap-4">
            <dt class="w-24 shrink-0">Website:</dt>
            <dd><a class="break-all text-bright-sun-400 hover:underline" target="_blank" rel="noopener" [href]="a.website">{{ a.website }}</a></dd>
          </div>
          <div class="flex gap-4">
            <dt class="w-24 shrink-0">Resume:</dt>
            <dd><button type="button" class="text-bright-sun-400 hover:underline" (click)="openResume(a)">{{ a.name }}</button></dd>
          </div>
          <div class="flex flex-col gap-1">
            <dt>Cover Letter:</dt>
            <dd class="whitespace-pre-wrap text-mine-shaft-300">{{ a.coverLetter }}</dd>
          </div>
        </dl>
      </app-modal>
    }
  `,
})
export class TalentCard {
  private readonly profileApi = inject(ProfileApiService);
  private readonly jobApi = inject(JobApiService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  /** Either a talent Profile (Find Talent) or an Applicant record of a posted job. */
  readonly talent = input.required<Profile | Applicant>();
  readonly mode = input<TalentCardMode>('default');
  /** Job the applicant applied to (required for posted/invited modes). */
  readonly jobId = input<number | null>(null);
  /** Fired after the application status was changed so the parent can reload. */
  readonly statusChanged = output<ApplicationStatus>();

  protected readonly today = todayInputValue();
  protected readonly profile = signal<Profile | null>(null);
  protected readonly scheduleOpen = signal(false);
  protected readonly applicationOpen = signal(false);
  protected readonly date = signal('');
  protected readonly time = signal('');
  protected readonly saving = signal(false);

  protected readonly applicant = computed(() => {
    const t = this.talent();
    return 'applicantId' in t ? t : null;
  });
  protected readonly topSkills = computed(() => (this.profile()?.skills ?? []).slice(0, 4));

  constructor() {
    // Applicants only carry contact details — fetch their full profile.
    effect((onCleanup) => {
      const t = this.talent();
      if ('applicantId' in t) {
        const sub = this.profileApi
          .getProfile(t.applicantId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({ next: (p) => this.profile.set(p), error: () => this.profile.set(null) });
        onCleanup(() => sub.unsubscribe());
      } else {
        this.profile.set(t);
      }
    });
  }

  protected changeStatus(status: ApplicationStatus): void {
    const jobId = this.jobId();
    const applicantId = this.profile()?.id ?? this.applicant()?.applicantId;
    if (jobId === null || applicantId === undefined) return;

    const interviewTime =
      status === 'INTERVIEWING' ? new Date(`${this.date()}T${this.time()}`).toISOString() : undefined;

    this.saving.set(true);
    this.jobApi
      .changeApplicationStatus({ id: jobId, applicantId, applicationStatus: status, interviewTime })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.scheduleOpen.set(false);
          const messages: Record<ApplicationStatus, [string, string]> = {
            INTERVIEWING: ['Interview Scheduled', 'Interview has been scheduled successfully'],
            OFFERED: ['Offered', 'Offer has been sent successfully'],
            REJECTED: ['Rejected', 'Applicant has been rejected'],
            APPLIED: ['Updated', 'Application updated'],
          };
          this.toast.success(...messages[status]);
          this.statusChanged.emit(status);
        },
        error: (err) => {
          this.saving.set(false);
          this.toast.error('Error', getErrorMessage(err));
        },
      });
  }

  protected openResume(applicant: Applicant): void {
    openPdf(applicant.resume);
  }
}
