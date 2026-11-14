import { ChangeDetectionStrategy, Component, booleanAttribute, computed, effect, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconName } from '../icon/icons';
import { Icon } from '../icon/icon';

let nextId = 0;

/**
 * Searchable single-select that also lets the user create a new option.
 * Works with Reactive Forms (formControlName) via ControlValueAccessor.
 * (React: PostJob/SelectInput + Profile/SelectInput.)
 */
@Component({
  selector: 'app-creatable-select',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CreatableSelect), multi: true }],
  template: `
    <div class="field relative">
      @if (label()) {
        <label class="field-label" [class.required]="required()" [for]="inputId">{{ label() }}</label>
      }
      <div class="relative">
        @if (icon(); as iconName) {
          <app-icon [name]="iconName" [size]="18" class="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-mine-shaft-300" />
        }
        <input
          [id]="inputId"
          class="field-input pr-8"
          [class.pl-9]="!!icon()"
          [class.invalid]="!!error()"
          [placeholder]="placeholder()"
          [value]="search()"
          [disabled]="disabled()"
          autocomplete="off"
          role="combobox"
          [attr.aria-expanded]="open()"
          (focus)="open.set(true)"
          (click)="open.set(true)"
          (input)="onSearch($any($event.target).value)"
          (blur)="onBlur()"
          (keydown.enter)="$event.preventDefault(); onEnter()"
          (keydown.escape)="open.set(false)"
        />
        <app-icon name="chevron-down" [size]="16" class="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-mine-shaft-400" />
      </div>
      @if (open() && (filtered().length || canCreate())) {
        <div class="dropdown top-full right-0 left-0 max-h-52 overflow-y-auto" role="listbox">
          @for (option of filtered(); track option) {
            <button
              type="button"
              role="option"
              class="dropdown-item"
              [class.text-bright-sun-400]="option === value()"
              (mousedown)="$event.preventDefault(); select(option)"
            >
              {{ option }}
            </button>
          }
          @if (canCreate()) {
            <button type="button" class="dropdown-item" (mousedown)="$event.preventDefault(); create()">
              + Create {{ search() }}
            </button>
          }
        </div>
      }
      @if (error()) {
        <span class="field-error">{{ error() }}</span>
      }
    </div>
  `,
})
export class CreatableSelect implements ControlValueAccessor {
  readonly label = input('');
  readonly placeholder = input('');
  readonly options = input<string[]>([]);
  readonly icon = input<IconName | null>(null);
  readonly required = input(false, { transform: booleanAttribute });
  readonly error = input<string | null>(null);

  protected readonly inputId = `creatable-select-${nextId++}`;
  protected readonly value = signal('');
  protected readonly search = signal('');
  protected readonly open = signal(false);
  protected readonly disabled = signal(false);
  private readonly created = signal<string[]>([]);

  private readonly allOptions = computed(() => [...this.options(), ...this.created()]);
  private readonly exactMatch = computed(() => this.allOptions().includes(this.search()));
  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.exactMatch() ? this.allOptions() : this.allOptions().filter((o) => o.toLowerCase().includes(term));
  });
  protected readonly canCreate = computed(() => !this.exactMatch() && this.search().trim().length > 0);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    // A value written by the form that is not in the list (e.g. loaded from the API) stays selectable.
    effect(() => {
      const current = this.value();
      if (current && !this.options().includes(current) && !this.created().includes(current)) {
        this.created.update((list) => [...list, current]);
      }
    });
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
    this.search.set(value ?? '');
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onSearch(term: string): void {
    this.search.set(term);
    this.open.set(true);
  }

  protected select(option: string): void {
    this.value.set(option);
    this.search.set(option);
    this.onChange(option);
    this.open.set(false);
  }

  protected create(): void {
    const option = this.search().trim();
    if (!option) return;
    this.created.update((list) => [...list, option]);
    this.select(option);
  }

  protected onEnter(): void {
    const [first] = this.filtered();
    if (this.canCreate() && !first) this.create();
    else if (first) this.select(first);
  }

  protected onBlur(): void {
    this.open.set(false);
    this.search.set(this.value());
    this.onTouched();
  }
}
