import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { Profile, SearchFilter, SortOption } from '../../core/models';
import { ProfileApiService } from '../../core/services/api/profile-api.service';
import { FilterStore } from '../../core/state/filter.store';
import { LoadingStore } from '../../core/state/loading.store';
import { SortStore } from '../../core/state/sort.store';
import { TalentCard } from '../../shared/components/talent-card/talent-card';
import { Icon } from '../../shared/ui/icon/icon';
import { SortMenu, TALENT_SORT_OPTIONS } from '../../shared/ui/sort-menu/sort-menu';
import { TalentSearchBar } from './talent-search-bar';

const matchesAny = (value: string | undefined, terms?: string[]) =>
  !terms?.length || terms.some((t) => value?.toLowerCase().includes(t.toLowerCase()));

function filterTalents(talents: Profile[], f: SearchFilter): Profile[] {
  return talents.filter(
    (t) =>
      (!f.name || t.name?.toLowerCase().includes(f.name.toLowerCase())) &&
      matchesAny(t.jobTitle, f.jobTitle) &&
      matchesAny(t.location, f.location) &&
      (!f.skills?.length || f.skills.some((s) => t.skills?.some((ts) => ts.toLowerCase().includes(s.toLowerCase())))) &&
      (!f.exp || (f.exp[0] <= (t.totalExp ?? 0) && (t.totalExp ?? 0) <= f.exp[1])),
  );
}

function sortTalents(talents: Profile[], sort: SortOption): Profile[] {
  const list = [...talents];
  if (sort === 'Experience: Low to High') return list.sort((a, b) => (a.totalExp ?? 0) - (b.totalExp ?? 0));
  if (sort === 'Experience: High to Low') return list.sort((a, b) => (b.totalExp ?? 0) - (a.totalExp ?? 0));
  return list;
}

@Component({
  selector: 'app-find-talent-page',
  imports: [TalentSearchBar, TalentCard, SortMenu, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <hr class="divider mx-4" />
      <app-talent-search-bar />
      <hr class="divider mx-4" />

      <section class="p-5">
        <div class="mt-5 flex flex-wrap justify-between gap-2">
          <h1 class="flex items-center gap-3 text-2xl font-semibold">
            Talents
            @if (filterStore.hasActiveFilters()) {
              <button type="button" class="btn btn-filled btn-sm" (click)="filterStore.reset()">
                <app-icon name="x" [size]="18" /> Clear Filters
              </button>
            }
          </h1>
          <app-sort-menu [options]="sortOptions" />
        </div>
        <div class="mt-10 flex flex-wrap justify-between gap-5">
          @for (talent of visibleTalents(); track talent.id) {
            <app-talent-card [talent]="talent" />
          } @empty {
            @if (loaded()) {
              <p class="text-lg font-medium">No talent found</p>
            }
          }
        </div>
      </section>
    </div>
  `,
})
export class FindTalentPage {
  private readonly profileApi = inject(ProfileApiService);
  private readonly loading = inject(LoadingStore);
  private readonly sortStore = inject(SortStore);
  protected readonly filterStore = inject(FilterStore);

  protected readonly sortOptions = TALENT_SORT_OPTIONS;
  protected readonly loaded = signal(false);
  private readonly talents = signal<Profile[]>([]);

  protected readonly visibleTalents = computed(() =>
    sortTalents(filterTalents(this.talents(), this.filterStore.filter()), this.sortStore.sort()),
  );

  constructor() {
    this.filterStore.reset();
    this.sortStore.reset();
    inject(DestroyRef).onDestroy(() => this.filterStore.reset());

    this.profileApi
      .getAllProfiles()
      .pipe(this.loading.track())
      .subscribe({
        next: (talents) => {
          this.talents.set(talents);
          this.loaded.set(true);
        },
        error: () => this.loaded.set(true),
      });
  }
}
