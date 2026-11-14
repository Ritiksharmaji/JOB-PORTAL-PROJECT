import { ChangeDetectionStrategy, Component, booleanAttribute, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Icon } from '../icon/icon';

let nextId = 0;

/**
 * Free-text tags. Enter, comma, space or "|" adds a tag; Backspace on an empty
 * input removes the last one. Works with Reactive Forms or [(ngModel)].
 */
@Component({
  selector: 'app-tags-input',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TagsInput), multi: true }],
  template: `
    <div class="field">
      @if (label()) {
        <label class="field-label" [class.required]="required()" [for]="inputId">{{ label() }}</label>
      }
      <div
        class="field-input flex h-auto min-h-9 flex-wrap items-center gap-1.5 py-1.5"
        [class.invalid]="!!error()"
        (click)="inputEl.focus()"
      >
        @for (tag of tags(); track $index) {
          <span class="inline-flex items-center gap-1 rounded-full bg-mine-shaft-800 px-2 py-0.5 text-xs text-mine-shaft-100">
            {{ tag }}
            <button type="button" class="text-mine-shaft-300 hover:text-red-400" (click)="remove($index)" [attr.aria-label]="'Remove ' + tag">
              <app-icon name="x" [size]="12" [stroke]="2.5" />
            </button>
          </span>
        }
        <input
          #inputEl
          [id]="inputId"
          class="min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-mine-shaft-400"
          [placeholder]="placeholder()"
          [value]="draft()"
          (input)="draft.set($any($event.target).value)"
          (keydown)="onKeydown($event)"
          (paste)="onPaste($event)"
          (blur)="commitDraft(); onTouched()"
        />
        @if (clearable() && tags().length) {
          <button type="button" class="ml-auto text-mine-shaft-400 hover:text-mine-shaft-100" (click)="clear()" aria-label="Clear all">
            <app-icon name="x" [size]="16" />
          </button>
        }
      </div>
      @if (error()) {
        <span class="field-error">{{ error() }}</span>
      }
    </div>
  `,
})
export class TagsInput implements ControlValueAccessor {
  private static readonly SPLIT_KEYS = ['Enter', ',', ' ', '|'];

  readonly label = input('');
  readonly placeholder = input('');
  readonly required = input(false, { transform: booleanAttribute });
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly error = input<string | null>(null);

  protected readonly inputId = `tags-input-${nextId++}`;
  protected readonly tags = signal<string[]>([]);
  protected readonly draft = signal('');

  private onChange: (value: string[]) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: string[] | null): void {
    this.tags.set(Array.isArray(value) ? [...value] : []);
  }
  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (TagsInput.SPLIT_KEYS.includes(event.key)) {
      event.preventDefault();
      this.commitDraft();
    } else if (event.key === 'Backspace' && !this.draft() && this.tags().length) {
      this.remove(this.tags().length - 1);
    }
  }

  protected onPaste(event: ClipboardEvent): void {
    const text = event.clipboardData?.getData('text') ?? '';
    if (!/[,| ]/.test(text)) return;
    event.preventDefault();
    this.add(text.split(/[,| ]+/));
  }

  protected commitDraft(): void {
    if (this.draft().trim()) this.add([this.draft()]);
    this.draft.set('');
  }

  protected remove(index: number): void {
    this.emit(this.tags().filter((_, i) => i !== index));
  }

  protected clear(): void {
    this.emit([]);
  }

  private add(values: string[]): void {
    const next = [...this.tags()];
    for (const raw of values) {
      const tag = raw.trim();
      if (tag && !next.includes(tag)) next.push(tag);
    }
    this.emit(next);
  }

  private emit(tags: string[]): void {
    this.tags.set(tags);
    this.onChange(tags);
  }
}
