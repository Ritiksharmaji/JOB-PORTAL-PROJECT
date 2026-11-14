import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FilterStore } from '../../../core/state/filter.store';
import { Icon } from '../../../shared/ui/icon/icon';

/** Hero section with a quick job search that pre-fills the Find Jobs filters. */
@Component({
  selector: 'app-dream-job',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="flex items-center px-16 max-bs:px-10 max-md:px-5 max-sm:flex-col-reverse">
      <div class="flex w-[45%] flex-col gap-3 max-sm:w-full" data-aos="zoom-out-right">
        <h1 class="text-6xl leading-tight font-bold text-mine-shaft-100 max-bs:text-5xl max-md:text-4xl max-sm:text-3xl">
          Find your <span class="text-bright-sun-400">dream</span>&ngsp;<span class="text-bright-sun-400">job</span> with us
        </h1>
        <p class="text-lg text-mine-shaft-200 max-md:text-base max-sm:text-sm">
          Good life begins with a good company. Start explore thousands of jobs in one place.
        </p>
        <form class="mt-5 flex items-stretch gap-3" (submit)="$event.preventDefault(); search()">
          <label class="flex min-w-0 flex-1 flex-col rounded-lg bg-mine-shaft-900 p-1 px-2 text-sm text-mine-shaft-100">
            Job Title
            <input class="w-full bg-transparent py-1 outline-none placeholder:text-mine-shaft-400" placeholder="Software Engineer" [value]="jobTitle()" (input)="jobTitle.set($any($event.target).value)" />
          </label>
          <label class="flex min-w-0 flex-1 flex-col rounded-lg bg-mine-shaft-900 p-1 px-2 text-sm text-mine-shaft-100">
            Job Type
            <input class="w-full bg-transparent py-1 outline-none placeholder:text-mine-shaft-400" placeholder="Fulltime" [value]="jobType()" (input)="jobType.set($any($event.target).value)" />
          </label>
          <button type="submit" class="flex w-20 shrink-0 items-center justify-center rounded-lg bg-bright-sun-400 p-2 max-xs:w-12 text-mine-shaft-100 hover:bg-bright-sun-500" aria-label="Search jobs">
            <app-icon name="search" [size]="34" />
          </button>
        </form>
      </div>

      <div class="flex w-[55%] items-center justify-center max-sm:w-full" data-aos="zoom-out-left">
        <div class="relative w-[30rem]">
          <img src="/Boy.png" alt="Job seeker" />
          <div class="absolute top-[50%] -right-10 w-fit rounded-lg border border-bright-sun-400 p-2 backdrop-blur-md max-bs:right-0 max-xs:top-[10%] max-xs:-left-5">
            <div class="mb-1 text-center text-sm text-mine-shaft-100">10K+ got job</div>
            <div class="flex -space-x-3">
              @for (avatar of avatars; track avatar) {
                <img class="h-9 w-9 rounded-full border-2 border-mine-shaft-950 object-cover" [src]="avatar" alt="" />
              }
              <span class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-mine-shaft-950 bg-mine-shaft-800 text-xs">+9K</span>
            </div>
          </div>
          <div class="absolute top-[28%] flex w-fit flex-col gap-3 rounded-lg border border-bright-sun-400 p-2 backdrop-blur-md xs:-left-5 max-bs:top-[35%] max-xs:top-[60%] max-xs:right-0">
            <div class="flex items-center gap-2">
              <div class="h-10 w-10 rounded-lg bg-mine-shaft-900 p-1"><img src="/Google.png" alt="" /></div>
              <div class="text-sm text-mine-shaft-100">
                <div>Software Engineer</div>
                <div class="text-xs text-mine-shaft-200">New York</div>
              </div>
            </div>
            <div class="flex justify-around gap-2 text-xs text-mine-shaft-200">
              <span>1 day ago</span>
              <span>120 Applicants</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class DreamJob {
  private readonly filterStore = inject(FilterStore);
  private readonly router = inject(Router);

  protected readonly jobTitle = signal('');
  protected readonly jobType = signal('');
  protected readonly avatars = ['/avatar.png', '/avatar1.png', '/avatar2.png'];

  protected search(): void {
    const title = this.jobTitle().trim();
    const type = this.jobType().trim();
    this.filterStore.reset();
    this.filterStore.update({ jobTitle: title ? [title] : [], jobType: type ? [type] : [] });
    this.router.navigate(['/find-jobs']);
  }
}
