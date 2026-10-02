import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { Icon } from '../icon/icon';

/** Renders ToastService notifications at the top-center of the screen. */
@Component({
  selector: 'app-toast-container',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pointer-events-none fixed inset-x-0 top-4 z-[2001] flex flex-col items-center gap-2 px-4" aria-live="polite">
      @for (toast of toasts.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex w-full max-w-md animate-toast items-start gap-3 rounded-lg border bg-mine-shaft-900 p-3 shadow-xl"
          [class]="toast.type === 'success' ? 'border-green-500' : 'border-red-500'"
          role="alert"
        >
          <span
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
            [class]="toast.type === 'success' ? 'bg-teal-600' : 'bg-red-600'"
          >
            <app-icon [name]="toast.type === 'success' ? 'check' : 'x'" [size]="16" [stroke]="2.5" />
          </span>
          <div class="min-w-0 flex-1">
            <div class="text-sm font-semibold text-mine-shaft-100">{{ toast.title }}</div>
            <div class="text-sm text-mine-shaft-300">{{ toast.message }}</div>
          </div>
          <button type="button" class="text-mine-shaft-400 hover:text-mine-shaft-100" (click)="toasts.dismiss(toast.id)" aria-label="Dismiss">
            <app-icon name="x" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainer {
  protected readonly toasts = inject(ToastService);
}
