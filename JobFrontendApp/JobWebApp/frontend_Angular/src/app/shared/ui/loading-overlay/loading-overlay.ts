import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Blurred overlay with an animated bars loader. Fixed to the viewport. */
@Component({
  selector: 'app-loading-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        class="fixed inset-0 z-[2000] flex items-center justify-center bg-mine-shaft-950/40 backdrop-blur-[2px]"
        role="status"
        aria-label="Loading"
      >
        <div class="flex h-10 items-end gap-1.5">
          @for (bar of bars; track bar) {
            <span
              class="w-2 animate-pulse rounded-sm bg-bright-sun-400"
              [style.height.%]="bar"
              [style.animation-delay.ms]="bar * 4"
            ></span>
          }
        </div>
      </div>
    }
  `,
})
export class LoadingOverlay {
  readonly visible = input(false);
  protected readonly bars = [60, 100, 75];
}
