import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { JobApiService } from '../../core/services/api/job-api.service';
import { Job } from '../../core/models';
import { FilterStore } from '../../core/state/filter.store';
import { LoadingStore } from '../../core/state/loading.store';
import { SortStore } from '../../core/state/sort.store';
import { JobCard } from '../../shared/components/job-card/job-card';
import { Icon } from '../../shared/ui/icon/icon';
import { JOB_SORT_OPTIONS, SortMenu } from '../../shared/ui/sort-menu/sort-menu';
import { filterJobs, sortJobs } from './job-filtering';
import { JobSearchBar } from './job-search-bar';

@Component({
  selector: 'app-find-jobs-page',
  imports: [JobSearchBar, JobCard, SortMenu, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <hr class="divider mx-4" />
      <app-job-search-bar />
      <hr class="divider mx-4" />

      <section class="p-5">
        <div class="mt-5 flex flex-wrap justify-between gap-2">
          <h1 class="flex items-center gap-3 text-2xl font-semibold max-xs:text-xl">
            Recommended jobs
            @if (filterStore.hasActiveFilters()) {
              <button type="button" class="btn btn-filled btn-sm" (click)="filterStore.reset()">
                <app-icon name="x" [size]="18" /> Clear Filters
              </button>
            }
          </h1>
          <app-sort-menu [options]="sortOptions" />
        </div>

        <div class="mt-10 flex flex-wrap gap-5">
          @for (job of visibleJobs(); track job.id) {
            <app-job-card [job]="job" />
          } @empty {
            @if (loaded()) {
              <p class="text-lg font-medium">No job found</p>
            }
          }
        </div>
      </section>
    </div>
  `,
})
export class FindJobsPage {
  private readonly jobApi = inject(JobApiService);
  private readonly loading = inject(LoadingStore);
  private readonly sortStore = inject(SortStore);
  protected readonly filterStore = inject(FilterStore);

  protected readonly sortOptions = JOB_SORT_OPTIONS;
  protected readonly loaded = signal(false);
  private readonly jobs = signal<Job[]>([]);

  protected readonly visibleJobs = computed(() =>
    sortJobs(filterJobs(this.jobs(), this.filterStore.filter()), this.sortStore.sort()),
  );

  constructor() {
    this.sortStore.reset();
    // Filters may have been pre-filled by the home page search; clear them on leave.
    inject(DestroyRef).onDestroy(() => this.filterStore.reset());

    this.jobApi
      .getAllJobs()
      .pipe(this.loading.track())
      .subscribe({
        next: (jobs) => {
          this.jobs.set(jobs.filter((job) => job.jobStatus === 'ACTIVE'));
          this.loaded.set(true);
        },
        error: () => this.loaded.set(true),
      });
  }
}
