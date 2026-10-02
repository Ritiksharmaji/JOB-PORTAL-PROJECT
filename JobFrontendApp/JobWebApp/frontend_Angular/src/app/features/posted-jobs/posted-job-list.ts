import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Job, JobStatus } from '../../core/models';
import { TimeAgoPipe } from '../../shared/pipes/date.pipes';
import { TabItem, Tabs } from '../../shared/ui/tabs/tabs';

/** Sidebar of the employer's jobs grouped by status. (React: PostedJob/PostedJob.) */
@Component({
  selector: 'app-posted-job-list',
  imports: [RouterLink, Tabs, TimeAgoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 class="section-title mb-5">Jobs</h2>
    <app-tabs variant="pills" [tabs]="tabs()" [(value)]="status" />
    <div class="mt-5 flex flex-col gap-5">
      @for (job of visible(); track job.id) {
        <a
          [routerLink]="['/posted-jobs', job.id]"
          class="w-52 cursor-pointer rounded-xl border-l-2 border-l-bright-sun-400 p-2 hover:opacity-80 max-lg:w-48 max-bs:w-44"
          [class]="job.id === selectedId() ? 'bg-bright-sun-400 text-black' : 'bg-mine-shaft-900 text-mine-shaft-300'"
          data-aos="fade-up"
        >
          <div class="text-sm font-semibold">{{ job.jobTitle }}</div>
          <div class="text-xs font-medium">{{ job.location }}</div>
          <div class="text-xs">{{ statusLabel[job.jobStatus] }} {{ job.postTime | timeAgo }}</div>
        </a>
      }
    </div>
  `,
})
export class PostedJobList {
  readonly jobs = input.required<Job[]>();
  readonly selected = input<Job | null>(null);

  protected readonly status = signal<string>('ACTIVE');
  protected readonly statusLabel: Record<JobStatus, string> = { ACTIVE: 'Posted', DRAFT: 'Drafted', CLOSED: 'Closed' };

  protected readonly selectedId = computed(() => this.selected()?.id ?? null);
  protected readonly tabs = computed<TabItem[]>(() => {
    const count = (s: JobStatus) => this.jobs().filter((j) => j.jobStatus === s).length;
    return [
      { value: 'ACTIVE', label: `Active [${count('ACTIVE')}]` },
      { value: 'DRAFT', label: `Drafts [${count('DRAFT')}]` },
      { value: 'CLOSED', label: `Closed [${count('CLOSED')}]` },
    ];
  });
  protected readonly visible = computed(() =>
    this.jobs()
      .filter((j) => j.jobStatus === this.status())
      .sort((a, b) => new Date(b.postTime).getTime() - new Date(a.postTime).getTime()),
  );

  constructor() {
    // Open the tab that contains the selected job.
    effect(() => this.status.set(this.selected()?.jobStatus ?? 'ACTIVE'));
  }
}
