import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Job } from '../../core/models';
import { JobApiService } from '../../core/services/api/job-api.service';
import { LoadingStore } from '../../core/state/loading.store';
import { SessionStore } from '../../core/state/session.store';
import { Drawer } from '../../shared/ui/drawer/drawer';
import { PostedJobDetail } from './posted-job-detail';
import { PostedJobList } from './posted-job-list';

/** Employer dashboard: `/posted-jobs/0` opens the first active job. */
@Component({
  selector: 'app-posted-jobs-page',
  imports: [PostedJobList, PostedJobDetail, Drawer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page px-5">
      <hr class="divider" />
      <button type="button" class="btn btn-filled my-2 md:hidden" (click)="drawerOpen.set(true)">All Jobs</button>

      <app-drawer [(open)]="drawerOpen" title="All Jobs" position="left" [width]="250">
        <app-posted-job-list [jobs]="jobs()" [selected]="selected()" (click)="drawerOpen.set(false)" />
      </app-drawer>

      <div class="flex justify-around gap-5 py-5">
        <app-posted-job-list class="w-1/5 max-md:hidden" [jobs]="jobs()" [selected]="selected()" />
        <app-posted-job-detail class="w-3/4 px-5 max-md:w-full max-md:p-0" data-aos="zoom-out" [job]="selected()" (changed)="load()" />
      </div>
    </div>
  `,
})
export class PostedJobsPage implements OnInit {
  private readonly jobApi = inject(JobApiService);
  private readonly session = inject(SessionStore);
  private readonly loading = inject(LoadingStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /** Bound from the `:id` route param. */
  readonly id = input.required<string>();

  protected readonly drawerOpen = signal(false);
  protected readonly jobs = signal<Job[]>([]);
  protected readonly selected = computed(() => this.jobs().find((j) => String(j.id) === this.id()) ?? null);

  constructor() {
    // "/posted-jobs/0" (nav link) opens the newest active job once jobs are loaded.
    effect(() => {
      const jobs = this.jobs();
      if (Number(this.id()) !== 0 || !jobs.length) return;
      const first = jobs.find((j) => j.jobStatus === 'ACTIVE') ?? jobs[0];
      this.router.navigate(['/posted-jobs', first.id], { replaceUrl: true });
    });
  }

  ngOnInit(): void {
    // Inputs (the :id param) are available from ngOnInit onwards.
    this.load();
  }

  protected load(): void {
    const userId = this.session.userId();
    if (userId === null) return;
    this.jobApi
      .getJobsPostedBy(userId)
      .pipe(this.loading.track(), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (jobs) => this.jobs.set(jobs),
        error: () => {},
      });
  }
}
