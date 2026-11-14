import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { Icon } from '../icon/icon';

/**
 * Slide-in side panel.
 *
 * Usage: <app-drawer [(open)]="menuOpen" position="right">...</app-drawer>
 */
@Component({
  selector: 'app-drawer',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'close()' },
  template: `
    <div class="fixed inset-0 z-[1400]" [class.pointer-events-none]="!open()">
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
        [class.opacity-0]="!open()"
        [class.invisible]="!open()"
        (click)="close()"
      ></div>
      <aside
        class="absolute top-0 flex h-full flex-col bg-mine-shaft-950 p-4 shadow-2xl transition-all duration-300"
        [class.invisible]="!open()"
        [style.width.px]="width()"
        [class.right-0]="position() === 'right'"
        [class.left-0]="position() === 'left'"
        [class.translate-x-full]="!open() && position() === 'right'"
        [class.-translate-x-full]="!open() && position() === 'left'"
        [attr.aria-hidden]="!open()"
      >
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold">{{ title() }}</h2>
          <button type="button" class="icon-btn text-mine-shaft-200" (click)="close()" aria-label="Close">
            <app-icon name="x" [size]="28" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto"><ng-content /></div>
      </aside>
    </div>
  `,
})
export class Drawer {
  readonly open = model(false);
  readonly title = input('');
  readonly position = input<'left' | 'right'>('right');
  readonly width = input(320);

  close(): void {
    this.open.set(false);
  }
}
