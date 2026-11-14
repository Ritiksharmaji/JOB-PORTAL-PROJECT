import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { Job } from '../../core/models';
import { JobApiService } from '../../core/services/api/job-api.service';
import { LoadingStore } from '../../core/state/loading.store';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';
import { TimeAgoPipe } from '../../shared/pipes/date.pipes';
import { Icon } from '../../shared/ui/icon/icon';
import { ApplicationForm } from './application-form';

@Component({
  selector: 'app-apply-job-page',
  imports: [Icon, TimeAgoPipe, ApplicationForm, ImgFallbackDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page p-4">
      <hr class="divider mb-2" />
      <button type="button" class="btn btn-light mb-2" (click)="location.back()"><app-icon name="arrow-left" /> Back</button>

      <div class="m-auto w-2/3 max-bs:w-4/5 max-sm:w-full">
        @if (job(); as j) {
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
          <hr class="divider my-8" />
          <app-application-form [jobId]="id()" />
        }
      </div>
    </div>
  `,
})
export class ApplyJobPage {
  private readonly jobApi = inject(JobApiService);
  private readonly loading = inject(LoadingStore);
  protected readonly location = inject(Location);

  readonly id = input.required<string>();
  protected readonly job = signal<Job | null>(null);

  constructor() {
    toObservable(this.id)
      .pipe(
        switchMap((id) => this.jobApi.getJob(id).pipe(this.loading.track(), catchError(() => of(null)))),
        takeUntilDestroyed(),
      )
      .subscribe((job) => this.job.set(job));
  }
}
