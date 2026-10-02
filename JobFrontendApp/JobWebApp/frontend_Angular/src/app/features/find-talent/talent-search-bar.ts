import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FilterStore } from '../../core/state/filter.store';
import { TALENT_FILTER_FIELDS } from '../../data/options.data';
import { Icon } from '../../shared/ui/icon/icon';
import { MultiSelectFilter } from '../../shared/ui/multi-select-filter/multi-select-filter';
import { RangeSlider } from '../../shared/ui/range-slider/range-slider';

const DEFAULT_EXP: [number, number] = [0, 50];

/** Filters for Find Talent. (React: FindTalent/SearchBar.) */
@Component({
  selector: 'app-talent-search-bar',
  imports: [Icon, MultiSelectFilter, RangeSlider],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex justify-end xs:hidden">
      <button type="button" class="btn btn-outline m-3 rounded-full" (click)="expanded.set(!expanded())">
        {{ expanded() ? 'Close' : 'Filters' }}
      </button>
    </div>
    <div class="flex items-center px-5 py-8 text-mine-shaft-100 max-lg:flex-wrap max-xs:py-2" [class]="expanded() ? '' : 'max-xs:hidden'">
      <div class="flex w-1/5 items-center max-lg:w-1/4 max-bs:w-[30%] max-sm:w-[48%] max-xs:mb-1 max-xs:w-full">
        <span class="mr-2 rounded-full bg-mine-shaft-900 p-1 text-bright-sun-400"><app-icon name="user-circle" [size]="20" /></span>
        <input
          class="w-full bg-transparent text-sm outline-none placeholder:text-mine-shaft-300"
          placeholder="Talent Name"
          aria-label="Talent name"
          [value]="filterStore.filter().name ?? ''"
          (input)="filterStore.update({ name: $any($event.target).value })"
        />
      </div>
      <div class="mr-2 h-10 border-l border-mine-shaft-800 max-sm:hidden"></div>
      @for (field of fields; track field.key) {
        <div class="w-1/5 max-lg:w-1/4 max-bs:w-[30%] max-sm:w-[48%] max-xs:mb-1 max-xs:w-full">
          <app-multi-select-filter [field]="field" />
        </div>
        <div class="mr-2 h-10 border-l border-mine-shaft-800 max-sm:hidden"></div>
      }
      <div class="w-1/5 text-sm text-mine-shaft-300 max-lg:mt-7 max-lg:w-1/4 max-bs:w-[30%] max-sm:w-[48%] max-xs:mb-1 max-xs:w-full">
        <div class="mb-1 flex justify-between">
          <span>Experience (Year)</span>
          <span>{{ exp()[0] }} - {{ exp()[1] }}</span>
        </div>
        <app-range-slider [min]="0" [max]="50" [(value)]="exp" (changeEnd)="filterStore.update({ exp: $event })" />
      </div>
    </div>
  `,
})
export class TalentSearchBar {
  protected readonly filterStore = inject(FilterStore);
  protected readonly fields = TALENT_FILTER_FIELDS;
  protected readonly expanded = signal(false);
  protected readonly exp = signal<[number, number]>(DEFAULT_EXP);

  constructor() {
    effect(() => {
      if (!this.filterStore.filter().exp) this.exp.set(DEFAULT_EXP);
    });
  }
}
