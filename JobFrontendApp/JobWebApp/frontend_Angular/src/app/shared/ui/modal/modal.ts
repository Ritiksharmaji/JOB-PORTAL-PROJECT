import { ChangeDetectionStrategy, Component, ElementRef, effect, input, model, viewChild } from '@angular/core';
import { Icon } from '../icon/icon';

/**
 * Centered modal built on the native <dialog> element. `showModal()` renders it
 * in the browser's top layer, so it is never clipped or offset by transformed
 * ancestors (e.g. AOS-animated cards), and it gets focus trapping + Esc for free.
 *
 * Usage: <app-modal [(open)]="isOpen" title="Reset Password">...content...</app-modal>
 */
@Component({
  selector: 'app-modal',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog
      #dialog
      [attr.aria-label]="title()"
      class="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl border border-mine-shaft-800 bg-mine-shaft-950 p-0 text-mine-shaft-100 shadow-2xl backdrop:bg-black/55 backdrop:backdrop-blur-[3px]"
      (close)="open.set(false)"
      (click)="onBackdropClick($event)"
    >
      @if (open()) {
        <div class="p-5">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold">{{ title() }}</h2>
            <button type="button" class="icon-btn text-mine-shaft-300" (click)="close()" aria-label="Close">
              <app-icon name="x" />
            </button>
          </div>
          <ng-content />
        </div>
      }
    </dialog>
  `,
})
export class Modal {
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly open = model(false);
  readonly title = input('');

  constructor() {
    effect(() => {
      const el = this.dialog().nativeElement;
      if (this.open() && !el.open) el.showModal();
      else if (!this.open() && el.open) el.close();
    });
  }

  close(): void {
    this.open.set(false);
  }

  /** A click on the dialog element itself (not its content) is a backdrop click. */
  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.close();
  }
}
