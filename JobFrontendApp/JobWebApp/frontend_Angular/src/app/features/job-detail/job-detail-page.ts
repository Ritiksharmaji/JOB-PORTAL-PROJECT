import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { Job } from '../../core/models';
import { JobApiService } from '../../core/services/api/job-api.service';
import { LoadingStore } from '../../core/state/loading.store';
import { JobCard } from '../../shared/components/job-card/job-card';
import { JobDescription } from '../../shared/components/job-description/job-description';
import { Icon } from '../../shared/ui/icon/icon';

@Component({
  selector: 'app-job-detail-page',
  imports: [RouterLink, Icon, JobDescription, JobCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page p-4">
      <hr class="divider" />
      <a routerLink="/find-jobs" class="btn btn-light my-5"><app-icon name="arrow-left" /> Back</a>

      <div class="flex justify-around gap-5 max-bs:flex-wrap">
        <div class="w-2/3 max-bs:w-full">
          @if (job(); as j) {
            <app-job-description [job]="j" />
          } @else if (notFound()) {
            <p class="py-20 text-center text-2xl font-semibold">Job Not Found.</p>
          }
        </div>

        <aside>
          <h2 class="mb-5 text-xl font-semibold">Recommended Job</h2>
          <div class="flex flex-wrap justify-between gap-5 bs:flex-col max-bs:justify-start">
            @for (rec of recommended(); track rec.id) {
              <app-job-card [job]="rec" />
            }
          </div>
        </aside>
      </div>
    </div>
  `,
})
export class JobDetailPage {
  private readonly jobApi = inject(JobApiService);
  private readonly loading = inject(LoadingStore);
  private readonly router = inject(Router);

  /** Bound from the `:id` route param. */
  readonly id = input.required<string>();

  protected readonly job = signal<Job | null>(null);
  protected readonly notFound = signal(false);
  private readonly allJobs = signal<Job[]>([]);

  protected readonly recommended = computed(() =>
    this.allJobs()
      .filter((j) => j.jobStatus === 'ACTIVE' && String(j.id) !== this.id())
      .slice(0, 6),
  );

  constructor() {
    toObservable(this.id)
      .pipe(
        switchMap((id) => {
          this.notFound.set(false);
          return this.jobApi.getJob(id).pipe(
            this.loading.track(),
            catchError(() => of(null)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((job) => {
        if (job?.jobStatus === 'CLOSED') {
          this.router.navigate(['/find-jobs']);
          return;
        }
        this.job.set(job);
        this.notFound.set(!job);
      });

    this.jobApi
      .getAllJobs()
      .pipe(takeUntilDestroyed())
      .subscribe({ next: (jobs) => this.allJobs.set(jobs), error: () => {} });
  }
}
