import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { ApplicationStatus, Job } from '../../core/models';
import { JobDescription } from '../../shared/components/job-description/job-description';
import { TalentCard, TalentCardMode } from '../../shared/components/talent-card/talent-card';
import { TabItem, Tabs } from '../../shared/ui/tabs/tabs';

type DetailTab = 'overview' | 'applicants' | 'invited' | 'offered' | 'rejected';

const TAB_CONFIG: Record<Exclude<DetailTab, 'overview'>, { status: ApplicationStatus; mode: TalentCardMode; empty: string }> = {
  applicants: { status: 'APPLIED', mode: 'posted', empty: 'No Applicants Yet' },
  invited: { status: 'INTERVIEWING', mode: 'invited', empty: 'No Applicants Invited Yet' },
  offered: { status: 'OFFERED', mode: 'offered', empty: 'No Applicants Offered Yet' },
  rejected: { status: 'REJECTED', mode: 'offered', empty: 'No Applicants Rejected Yet' },
};

/** Selected job with its applicant pipeline. (React: PostedJob/PostedJobDesc.) */
@Component({
  selector: 'app-posted-job-detail',
  imports: [Tabs, JobDescription, TalentCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (job(); as j) {
      <h1 class="flex items-center gap-3 text-2xl font-semibold max-xs:text-xl">
        {{ j.jobTitle }}
        <span class="rounded-full bg-bright-sun-400/10 px-2 py-0.5 text-xs font-bold text-bright-sun-400">{{ j.jobStatus }}</span>
      </h1>
      <div class="mb-5 font-medium text-mine-shaft-300 max-xs:text-sm">{{ j.location }}</div>

      <app-tabs [tabs]="tabs" [(value)]="tab" />
      @if (tab() === 'overview') {
        <app-job-description [job]="j" [editable]="true" (jobClosed)="changed.emit()" />
      } @else {
        <div class="mt-10 flex flex-wrap justify-around gap-5">
          @for (applicant of applicants(); track applicant.applicantId) {
            <app-talent-card [talent]="applicant" [mode]="config().mode" [jobId]="j.id" (statusChanged)="changed.emit()" />
          } @empty {
            <p>{{ config().empty }}</p>
          }
        </div>
      }
    } @else {
      <p class="flex min-h-[70vh] items-center justify-center text-2xl font-semibold">Job Not Found.</p>
    }
  `,
})
export class PostedJobDetail {
  readonly job = input<Job | null>(null);
  /** Fired when the job or one of its applications changed, so the page reloads. */
  readonly changed = output<void>();

  protected readonly tabs: TabItem<DetailTab>[] = [
    { value: 'overview', label: 'Overview' },
    { value: 'applicants', label: 'Applicants' },
    { value: 'invited', label: 'Invited' },
    { value: 'offered', label: 'Offered' },
    { value: 'rejected', label: 'Rejected' },
  ];
  protected readonly tab = signal<string>('overview');

  protected readonly config = computed(() => TAB_CONFIG[this.tab() as Exclude<DetailTab, 'overview'>] ?? TAB_CONFIG.applicants);
  protected readonly applicants = computed(
    () => this.job()?.applicants?.filter((a) => a.applicationStatus === this.config().status) ?? [],
  );

  constructor() {
    // Switching to another job goes back to its overview.
    let lastId: number | undefined;
    effect(() => {
      const id = this.job()?.id;
      if (id !== lastId) this.tab.set('overview');
      lastId = id;
    });
  }
}
