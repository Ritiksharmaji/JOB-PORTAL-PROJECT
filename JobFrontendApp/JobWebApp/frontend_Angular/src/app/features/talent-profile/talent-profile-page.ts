import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { Profile } from '../../core/models';
import { ProfileApiService } from '../../core/services/api/profile-api.service';
import { LoadingStore } from '../../core/state/loading.store';
import { CertificationItem, ExperienceItem } from '../../shared/components/profile-sections/profile-sections';
import { TalentCard } from '../../shared/components/talent-card/talent-card';
import { PicturePipe } from '../../shared/pipes/picture.pipe';
import { Icon } from '../../shared/ui/icon/icon';

/** Employer view of a candidate profile, with recommended talents alongside. */
@Component({
  selector: 'app-talent-profile-page',
  imports: [Icon, PicturePipe, ExperienceItem, CertificationItem, TalentCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page p-4">
      <hr class="divider mx-4" />
      <button type="button" class="btn btn-light my-3" (click)="location.back()"><app-icon name="arrow-left" /> Back</button>

      <div class="flex gap-5 max-lg:flex-wrap">
        @if (profile(); as p) {
          <article class="w-2/3 max-lg:w-full" data-aos="zoom-out">
            <div class="relative">
              <img class="w-full rounded-t-2xl max-xl:h-40 max-xs:h-32" src="/Profile/banner.jpg" alt="" />
              <img class="absolute -bottom-1/3 left-6 h-48 w-48 rounded-full border-8 border-mine-shaft-950 object-cover max-md:-bottom-10 max-md:h-40 max-md:w-40 max-sm:-bottom-16 max-sm:h-36 max-sm:w-36 max-xs:h-32 max-xs:w-32" [src]="p.picture | picture" [alt]="p.name" />
            </div>
            <div class="mt-16 px-3">
              <div class="flex justify-between text-3xl font-semibold max-xs:text-2xl">
                {{ p.name }}
                <button type="button" class="btn btn-light">Message</button>
              </div>
              <div class="flex items-center gap-1 text-xl max-xs:text-base">
                <app-icon name="briefcase" [stroke]="1.5" /> {{ p.jobTitle }} &bull; {{ p.company }}
              </div>
              <div class="flex items-center gap-1 text-lg text-mine-shaft-300 max-xs:text-base">
                <app-icon name="map-pin" [stroke]="1.5" /> {{ p.location }}
              </div>
              <div class="flex items-center gap-1 text-lg text-mine-shaft-300 max-xs:text-base">
                <app-icon name="briefcase" [stroke]="1.5" /> Experience: {{ p.totalExp }} Years
              </div>

              <hr class="divider my-8" />
              <h2 class="section-title mb-3">About</h2>
              <p class="text-justify text-sm text-mine-shaft-300">{{ p.about }}</p>

              <hr class="divider my-8" />
              <h2 class="section-title mb-3">Skills</h2>
              <div class="flex flex-wrap gap-2">
                @for (skill of p.skills; track skill) {
                  <span class="skill-pill">{{ skill }}</span>
                }
              </div>

              <hr class="divider my-8" />
              <h2 class="section-title mb-4">Experience</h2>
              <div class="flex flex-col gap-8">
                @for (exp of p.experiences; track $index) {
                  <app-experience-item [experience]="exp" />
                }
              </div>

              <hr class="divider my-8" />
              <h2 class="section-title mb-4">Certifications</h2>
              <div class="flex flex-col gap-8">
                @for (cert of p.certifications; track $index) {
                  <app-certification-item [certification]="cert" />
                }
              </div>
            </div>
          </article>
        }

        <aside data-aos="zoom-out">
          <h2 class="mb-5 text-xl font-semibold">Recommended Talent</h2>
          <div class="flex flex-col gap-5">
            @for (talent of recommended(); track talent.id) {
              <app-talent-card [talent]="talent" />
            }
          </div>
        </aside>
      </div>
    </div>
  `,
})
export class TalentProfilePage {
  private readonly profileApi = inject(ProfileApiService);
  private readonly loading = inject(LoadingStore);
  protected readonly location = inject(Location);

  readonly id = input.required<string>();

  protected readonly profile = signal<Profile | null>(null);
  private readonly talents = signal<Profile[]>([]);
  protected readonly recommended = computed(() =>
    this.talents()
      .filter((t) => String(t.id) !== this.id())
      .slice(0, 4),
  );

  constructor() {
    toObservable(this.id)
      .pipe(
        switchMap((id) => this.profileApi.getProfile(id).pipe(this.loading.track(), catchError(() => of(null)))),
        takeUntilDestroyed(),
      )
      .subscribe((profile) => this.profile.set(profile));

    this.profileApi
      .getAllProfiles()
      .pipe(takeUntilDestroyed())
      .subscribe({ next: (list) => this.talents.set(list), error: () => {} });
  }
}
