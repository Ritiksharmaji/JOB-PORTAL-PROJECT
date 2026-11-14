import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { FilterStore } from '../../core/state/filter.store';
import { JOB_FILTER_FIELDS } from '../../data/options.data';
import { MultiSelectFilter } from '../../shared/ui/multi-select-filter/multi-select-filter';
import { RangeSlider } from '../../shared/ui/range-slider/range-slider';

const DEFAULT_SALARY: [number, number] = [0, 300];

/** Filters for Find Jobs. Collapsible on small screens. (React: FindJobs/SearchBar.) */
@Component({
  selector: 'app-job-search-bar',
  imports: [MultiSelectFilter, RangeSlider],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex justify-end xs:hidden">
      <button type="button" class="btn btn-outline m-3 rounded-full" (click)="expanded.set(!expanded())">
        {{ expanded() ? 'Close' : 'Filters' }}
      </button>
    </div>
    <div class="flex items-center px-5 py-8 text-mine-shaft-100 max-lg:flex-wrap max-xs:py-2" [class]="expanded() ? '' : 'max-xs:hidden'">
      @for (field of fields; track field.key) {
        <div class="w-1/5 max-lg:w-1/4 max-bs:w-[30%] max-sm:w-[48%] max-xs:mb-1 max-xs:w-full">
          <app-multi-select-filter [field]="field" />
        </div>
        <div class="mr-2 h-10 border-l border-mine-shaft-800 max-sm:hidden"></div>
      }
      <div class="w-1/5 text-sm text-mine-shaft-300 max-lg:mt-7 max-lg:w-1/4 max-bs:w-[30%] max-sm:w-[48%] max-xs:mb-1 max-xs:w-full">
        <div class="mb-1 flex justify-between">
          <span>Salary</span>
          <span>&#8377;{{ salary()[0] }} LPA - &#8377;{{ salary()[1] }} LPA</span>
        </div>
        <app-range-slider [min]="0" [max]="300" [(value)]="salary" (changeEnd)="filterStore.update({ salary: $event })" />
      </div>
    </div>
  `,
})
export class JobSearchBar {
  protected readonly filterStore = inject(FilterStore);
  protected readonly fields = JOB_FILTER_FIELDS;
  protected readonly expanded = signal(false);
  protected readonly salary = signal<[number, number]>(DEFAULT_SALARY);

  constructor() {
    // "Clear Filters" resets the slider too.
    effect(() => {
      if (!this.filterStore.filter().salary) this.salary.set(DEFAULT_SALARY);
    });
  }
}
