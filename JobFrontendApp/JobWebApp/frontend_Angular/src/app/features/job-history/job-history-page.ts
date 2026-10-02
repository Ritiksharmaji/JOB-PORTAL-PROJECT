import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApplicationStatus, Job } from '../../core/models';
import { JobApiService } from '../../core/services/api/job-api.service';
import { LoadingStore } from '../../core/state/loading.store';
import { ProfileStore } from '../../core/state/profile.store';
import { SessionStore } from '../../core/state/session.store';
import { JobCard, JobCardVariant } from '../../shared/components/job-card/job-card';
import { TabItem, Tabs } from '../../shared/ui/tabs/tabs';

type HistoryTab = 'APPLIED' | 'SAVED' | 'OFFERED' | 'INTERVIEWING';

/** Applicant's applications grouped by status, plus saved jobs. */
@Component({
  selector: 'app-job-history-page',
  imports: [Tabs, JobCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page px-4">
      <hr class="divider" />
      <section class="my-5">
        <h1 class="section-title mb-5">Job History</h1>
        <app-tabs [tabs]="tabs" [(value)]="activeTab" />
        <div class="mt-10 flex flex-wrap gap-5">
          @for (job of visibleJobs(); track job.id) {
            <app-job-card [job]="job" [variant]="cardVariant()" />
          } @empty {
            <p class="text-lg font-medium">Nothing to show..</p>
          }
        </div>
      </section>
    </div>
  `,
})
export class JobHistoryPage {
  private readonly jobApi = inject(JobApiService);
  private readonly loading = inject(LoadingStore);
  private readonly session = inject(SessionStore);
  private readonly profileStore = inject(ProfileStore);

  protected readonly tabs: TabItem<HistoryTab>[] = [
    { value: 'APPLIED', label: 'Applied' },
    { value: 'SAVED', label: 'Saved' },
    { value: 'OFFERED', label: 'Offered' },
    { value: 'INTERVIEWING', label: 'In Progress' },
  ];
  protected readonly activeTab = signal<string>('APPLIED');
  private readonly jobs = signal<Job[]>([]);

  protected readonly cardVariant = computed(() => this.activeTab().toLowerCase() as JobCardVariant);

  protected readonly visibleJobs = computed(() => {
    const tab = this.activeTab() as HistoryTab;
    if (tab === 'SAVED') {
      const saved = this.profileStore.savedJobs();
      return this.jobs().filter((job) => saved.includes(job.id));
    }
    const userId = this.session.userId();
    return this.jobs().filter((job) =>
      job.applicants?.some((a) => a.applicantId === userId && a.applicationStatus === (tab as ApplicationStatus)),
    );
  });

  constructor() {
    this.jobApi
      .getAllJobs()
      .pipe(this.loading.track(), takeUntilDestroyed())
      .subscribe({ next: (jobs) => this.jobs.set(jobs), error: () => {} });
  }
}
