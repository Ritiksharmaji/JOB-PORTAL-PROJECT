import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { SortOption } from '../../../core/models';
import { SortStore } from '../../../core/state/sort.store';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { Icon } from '../icon/icon';

export const JOB_SORT_OPTIONS: SortOption[] = ['Relevance', 'Most Recent', 'Salary: Low to High', 'Salary: High to Low'];
export const TALENT_SORT_OPTIONS: SortOption[] = ['Relevance', 'Experience: Low to High', 'Experience: High to Low'];

/** Sort dropdown bound to the SortStore. (React: FindJobs/Sort.) */
@Component({
  selector: 'app-sort-menu',
  imports: [Icon, ClickOutsideDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative" (appClickOutside)="open.set(false)">
      <button
        type="button"
        class="flex items-center gap-1 rounded-xl border border-bright-sun-400 px-2 py-1 text-sm hover:bg-mine-shaft-900 max-xs:px-1 max-xs:py-0 max-xs:text-xs max-xsm:mt-2"
        [attr.aria-expanded]="open()"
        (click)="open.set(!open())"
      >
        {{ sortStore.sort() }}
        <app-icon name="adjustments" [size]="18" class="text-bright-sun-400" />
      </button>
      @if (open()) {
        <div class="dropdown top-full left-0 w-44 py-1" role="listbox">
          @for (option of options(); track option) {
            <button
              type="button"
              role="option"
              class="dropdown-item text-xs"
              [class.text-bright-sun-400]="option === sortStore.sort()"
              (click)="select(option)"
            >
              {{ option }}
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class SortMenu {
  protected readonly sortStore = inject(SortStore);
  readonly options = input<SortOption[]>(JOB_SORT_OPTIONS);
  protected readonly open = signal(false);

  protected select(option: SortOption): void {
    this.sortStore.sort.set(option);
    this.open.set(false);
  }
}
