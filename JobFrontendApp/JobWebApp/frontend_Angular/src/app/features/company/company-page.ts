import { DecimalPipe, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Job, Profile } from '../../core/models';
import { JobApiService } from '../../core/services/api/job-api.service';
import { ProfileApiService } from '../../core/services/api/profile-api.service';
import { LoadingStore } from '../../core/state/loading.store';
import { COMPANY_DETAILS, SIMILAR_COMPANIES } from '../../data/company.data';
import { JobCard } from '../../shared/components/job-card/job-card';
import { TalentCard } from '../../shared/components/talent-card/talent-card';
import { ImgFallbackDirective } from '../../shared/directives/img-fallback.directive';
import { Icon } from '../../shared/ui/icon/icon';
import { TabItem, Tabs } from '../../shared/ui/tabs/tabs';

/**
 * Company page. "Jobs" and "Employees" are the real jobs / profiles whose
 * company matches the route; the About section is static demo content.
 */
@Component({
  selector: 'app-company-page',
  imports: [RouterLink, DecimalPipe, Icon, Tabs, JobCard, TalentCard, ImgFallbackDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page p-4">
      <hr class="divider" />
      <button type="button" class="btn btn-light my-5" (click)="location.back()"><app-icon name="arrow-left" /> Back</button>

      <div class="flex justify-between gap-5 max-lg:flex-wrap">
        <div class="w-3/4 max-lg:w-full">
          <div class="relative">
            <img class="w-full rounded-t-2xl" src="/Profile/banner.jpg" alt="" />
            <img class="absolute -bottom-1/4 left-5 h-36 w-36 rounded-3xl border-8 border-mine-shaft-950 bg-mine-shaft-950 object-contain p-2 max-md:h-24 max-md:w-24" [src]="'/Icons/' + name() + '.png'" [alt]="name() + ' logo'" appImgFallback />
          </div>
          <div class="mt-12 px-7">
            <div class="flex justify-between text-3xl font-semibold">
              {{ name() }}
              <div class="flex -space-x-3">
                @for (avatar of avatars; track avatar) {
                  <img class="h-9 w-9 rounded-full border-2 border-mine-shaft-950 object-cover" [src]="avatar" alt="" />
                }
                <span class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-mine-shaft-950 bg-mine-shaft-800 text-xs">+10k</span>
              </div>
            </div>
            <div class="flex items-center gap-1 text-lg text-mine-shaft-300">
              <app-icon name="map-pin" [stroke]="1.5" /> New York, United States
            </div>
          </div>

          <hr class="divider my-8" />
          <app-tabs [tabs]="tabs" [(value)]="tab" />
          @switch (tab()) {
            @case ('about') {
              <div class="flex flex-col gap-5">
                @for (item of details; track item.title) {
                  <div>
                    <h3 class="mb-3 text-xl font-semibold">{{ item.title }}</h3>
                    @if (item.link) {
                      <a class="text-sm text-bright-sun-400 hover:text-bright-sun-300" [href]="item.value" target="_blank" rel="noopener">{{ item.value }}</a>
                    } @else if (isList(item.value)) {
                      <div class="text-justify text-sm text-mine-shaft-300">
                        @for (s of item.value; track s) {
                          <span> &bull; {{ s }}</span>
                        }
                      </div>
                    } @else {
                      <p class="text-justify text-sm text-mine-shaft-300">{{ item.value }}</p>
                    }
                  </div>
                }
              </div>
            }
            @case ('jobs') {
              <div class="mt-10 flex flex-wrap gap-5">
                @for (job of companyJobs(); track job.id) {
                  <app-job-card [job]="job" />
                } @empty {
                  <p class="text-lg font-medium">No open jobs at {{ name() }} right now.</p>
                }
              </div>
            }
            @case ('employees') {
              <div class="mt-10 flex flex-wrap gap-10">
                @for (person of employees(); track person.id) {
                  <app-talent-card [talent]="person" />
                } @empty {
                  <p class="text-lg font-medium">No employees listed yet.</p>
                }
              </div>
            }
          }
        </div>

        <aside class="w-1/4 max-lg:w-full">
          <h2 class="mb-5 text-xl font-semibold">Similar Companies</h2>
          <div class="flex flex-col gap-5">
            @for (company of similar(); track company.name) {
              <div class="flex items-center justify-between rounded-lg bg-mine-shaft-900 p-2">
                <div class="flex items-center gap-2">
                  <div class="logo-box"><img class="h-7 w-7 object-contain" [src]="'/Icons/' + company.name + '.png'" alt="" appImgFallback /></div>
                  <div>
                    <div class="font-semibold">{{ company.name }}</div>
                    <div class="text-xs text-mine-shaft-300">{{ company.employees | number }} Employees</div>
                  </div>
                </div>
                <a class="icon-btn" [routerLink]="['/company', company.name]" [attr.aria-label]="'Open ' + company.name"><app-icon name="external-link" /></a>
              </div>
            }
          </div>
        </aside>
      </div>
    </div>
  `,
})
export class CompanyPage {
  private readonly jobApi = inject(JobApiService);
  private readonly profileApi = inject(ProfileApiService);
  private readonly loading = inject(LoadingStore);
  protected readonly location = inject(Location);

  /** Bound from the `:name` route param. */
  readonly name = input.required<string>();

  protected readonly tabs: TabItem[] = [
    { value: 'about', label: 'About' },
    { value: 'jobs', label: 'Jobs' },
    { value: 'employees', label: 'Employees' },
  ];
  protected readonly tab = signal('about');
  protected readonly details = COMPANY_DETAILS;
  protected readonly avatars = ['/avatar.png', '/avatar1.png', '/avatar2.png'];

  private readonly jobs = signal<Job[]>([]);
  private readonly profiles = signal<Profile[]>([]);

  private readonly matches = (company?: string) => company?.toLowerCase() === this.name().toLowerCase();
  protected readonly companyJobs = computed(() => this.jobs().filter((j) => j.jobStatus === 'ACTIVE' && this.matches(j.company)));
  protected readonly employees = computed(() => this.profiles().filter((p) => this.matches(p.company)).slice(0, 6));
  protected readonly similar = computed(() => SIMILAR_COMPANIES.filter((c) => !this.matches(c.name)));

  constructor() {
    this.jobApi
      .getAllJobs()
      .pipe(this.loading.track(), takeUntilDestroyed())
      .subscribe({ next: (jobs) => this.jobs.set(jobs), error: () => {} });
    this.profileApi
      .getAllProfiles()
      .pipe(takeUntilDestroyed())
      .subscribe({ next: (profiles) => this.profiles.set(profiles), error: () => {} });
  }

  protected isList(value: string | string[]): value is string[] {
    return Array.isArray(value);
  }
}
