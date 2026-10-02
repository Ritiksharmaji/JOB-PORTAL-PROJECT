import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FilterStore } from '../../../core/state/filter.store';
import { FilterField } from '../../../data/options.data';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { Icon } from '../icon/icon';

/**
 * Multi-select checkbox dropdown bound directly to one key of the FilterStore.
 * (React: FindJobs/MultiInput.)
 */
@Component({
  selector: 'app-multi-select-filter',
  imports: [Icon, ClickOutsideDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative" (appClickOutside)="open.set(false)">
      <button
        type="button"
        class="flex w-full items-center gap-2 py-1 text-left text-sm"
        [attr.aria-label]="field().title + ' filter'"
        [attr.aria-expanded]="open()"
        (click)="open.set(!open())"
      >
        <span class="mr-1 rounded-full bg-mine-shaft-900 p-1 text-bright-sun-400">
          <app-icon [name]="field().icon" [size]="20" />
        </span>
        <span class="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          @if (selected().length) {
            <span class="inline-flex items-center gap-1 rounded-full bg-mine-shaft-800 px-2 py-0.5 text-xs text-mine-shaft-100">
              {{ shorten(selected()[0]) }}
              <span
                role="button"
                tabindex="0"
                class="text-mine-shaft-300 hover:text-red-400"
                [attr.aria-label]="'Remove ' + selected()[0]"
                (click)="$event.stopPropagation(); toggle(selected()[0])"
                (keydown.enter)="toggle(selected()[0])"
              >
                <app-icon name="x" [size]="12" [stroke]="2.5" />
              </span>
            </span>
            @if (selected().length > 1) {
              <span class="rounded-full bg-mine-shaft-800 px-2 py-0.5 text-xs text-mine-shaft-100">+{{ selected().length - 1 }} more</span>
            }
          } @else {
            <span class="text-mine-shaft-300">{{ field().title }}</span>
          }
        </span>
        <app-icon name="selector" [size]="18" class="text-mine-shaft-300" />
      </button>

      @if (open()) {
        <div class="dropdown top-full left-0 w-full min-w-48">
          <input
            class="w-full border-b border-mine-shaft-800 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-mine-shaft-400"
            placeholder="Search"
            [value]="search()"
            (input)="search.set($any($event.target).value)"
            (keydown.enter)="canCreate() && create()"
          />
          <div class="max-h-52 overflow-y-auto py-1">
            @for (option of visibleOptions(); track option; let i = $index) {
              <button
                type="button"
                class="dropdown-item animate-option opacity-0"
                [style.animation-delay.ms]="i * 30"
                (click)="toggle(option)"
              >
                <span
                  class="flex h-3.5 w-3.5 items-center justify-center rounded-sm border"
                  [class]="selected().includes(option) ? 'border-bright-sun-400 bg-bright-sun-400 text-black' : 'border-mine-shaft-500'"
                >
                  @if (selected().includes(option)) {
                    <app-icon name="check" [size]="10" [stroke]="3" />
                  }
                </span>
                <span class="text-mine-shaft-300">{{ option }}</span>
              </button>
            }
            @if (canCreate()) {
              <button type="button" class="dropdown-item" (click)="create()">+ {{ search() }}</button>
            }
            @if (!visibleOptions().length && !canCreate()) {
              <div class="px-3 py-2 text-sm text-mine-shaft-400">Nothing found</div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class MultiSelectFilter {
  private readonly filterStore = inject(FilterStore);

  readonly field = input.required<FilterField>();

  protected readonly open = signal(false);
  protected readonly search = signal('');
  private readonly created = signal<string[]>([]);

  protected readonly selected = computed(() => this.filterStore.filter()[this.field().key] ?? []);
  private readonly options = computed(() => [...this.field().options, ...this.created()]);
  protected readonly visibleOptions = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.options().filter((o) => o.toLowerCase().includes(term));
  });
  protected readonly canCreate = computed(
    () => this.search().trim().length > 0 && !this.options().includes(this.search().trim()),
  );

  protected toggle(option: string): void {
    const current = this.selected();
    const next = current.includes(option) ? current.filter((v) => v !== option) : [...current, option];
    this.filterStore.update({ [this.field().key]: next });
  }

  protected create(): void {
    const option = this.search().trim();
    this.created.update((list) => [...list, option]);
    this.search.set('');
    this.toggle(option);
  }

  protected shorten(value: string): string {
    return value.length >= 10 ? `${value.substring(0, 8)}..` : value;
  }
}
