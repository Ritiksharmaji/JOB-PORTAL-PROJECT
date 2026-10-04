import { Injectable, computed, signal } from '@angular/core';
import { MonoTypeOperatorFunction, defer, finalize } from 'rxjs';

/**
 * Global loading overlay. Uses a counter so overlapping requests keep the
 * overlay visible until the last one completes. (React: OverlaySlice.)
 */
@Injectable({ providedIn: 'root' })
export class LoadingStore {
  private readonly pending = signal(0);
  readonly visible = computed(() => this.pending() > 0);

  show(): void {
    this.pending.update((n) => n + 1);
  }

  hide(): void {
    this.pending.update((n) => Math.max(0, n - 1));
  }

  /** RxJS operator: shows the overlay while the source observable is running. */
  track<T>(): MonoTypeOperatorFunction<T> {
    return (source) =>
      defer(() => {
        this.show();
        return source.pipe(finalize(() => this.hide()));
      });
  }
}
