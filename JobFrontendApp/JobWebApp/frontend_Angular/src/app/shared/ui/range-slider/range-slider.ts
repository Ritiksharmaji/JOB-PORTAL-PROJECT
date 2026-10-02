import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';

/**
 * Two-thumb range slider built from two native range inputs.
 * `value` updates while dragging; `changeEnd` fires when the thumb is released
 * (that is when filters are applied, like Mantine's onChangeEnd).
 */
@Component({
  selector: 'app-range-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './range-slider.css',
  template: `
    <div class="range">
      <div class="track"></div>
      <div class="fill" [style.left.%]="startPct()" [style.width.%]="endPct() - startPct()"></div>
      <input
        type="range"
        [min]="min()"
        [max]="max()"
        [value]="value()[0]"
        aria-label="Minimum"
        (input)="onInput(0, $any($event.target).valueAsNumber)"
        (change)="changeEnd.emit(value())"
      />
      <input
        type="range"
        [min]="min()"
        [max]="max()"
        [value]="value()[1]"
        aria-label="Maximum"
        (input)="onInput(1, $any($event.target).valueAsNumber)"
        (change)="changeEnd.emit(value())"
      />
    </div>
  `,
})
export class RangeSlider {
  readonly min = input(0);
  readonly max = input(100);
  readonly value = model<[number, number]>([0, 100]);
  readonly changeEnd = output<[number, number]>();

  protected readonly startPct = computed(() => this.toPct(this.value()[0]));
  protected readonly endPct = computed(() => this.toPct(this.value()[1]));

  protected onInput(thumb: 0 | 1, raw: number): void {
    const [low, high] = this.value();
    this.value.set(thumb === 0 ? [Math.min(raw, high), high] : [low, Math.max(raw, low)]);
  }

  private toPct(n: number): number {
    const span = this.max() - this.min() || 1;
    return ((n - this.min()) / span) * 100;
  }
}
