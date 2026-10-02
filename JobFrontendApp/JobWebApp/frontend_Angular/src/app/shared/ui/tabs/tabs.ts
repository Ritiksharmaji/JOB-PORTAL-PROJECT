import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export interface TabItem<T extends string = string> {
  value: T;
  label: string;
}

/**
 * Tab header. The parent renders the matching panel with @switch.
 *
 * Usage: <app-tabs [tabs]="tabs" [(value)]="activeTab" />
 */
@Component({
  selector: 'app-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (variant() === 'pills') {
      <div role="tablist" class="flex flex-wrap gap-2">
        @for (tab of tabs(); track tab.value) {
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="tab.value === value()"
            class="rounded-md px-3 py-1.5 text-sm font-medium transition"
            [class]="tab.value === value() ? 'bg-bright-sun-400 text-black' : 'bg-mine-shaft-900 text-mine-shaft-200 hover:bg-mine-shaft-800'"
            (click)="value.set(tab.value)"
          >
            {{ tab.label }}
          </button>
        }
      </div>
    } @else {
      <div role="tablist" class="tab-list">
        @for (tab of tabs(); track tab.value) {
          <button
            type="button"
            role="tab"
            class="tab"
            [class.active]="tab.value === value()"
            [attr.aria-selected]="tab.value === value()"
            (click)="value.set(tab.value)"
          >
            {{ tab.label }}
          </button>
        }
      </div>
    }
  `,
})
export class Tabs {
  readonly tabs = input.required<TabItem[]>();
  readonly value = model.required<string>();
  readonly variant = input<'outline' | 'pills'>('outline');
}
