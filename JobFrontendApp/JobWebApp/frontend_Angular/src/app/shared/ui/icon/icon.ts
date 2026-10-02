import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FILLED_ICONS, ICONS, IconName } from './icons';

/**
 * Inline Tabler icon. Only the icons listed in icons.ts are bundled, so the app
 * does not ship the full 700 KB icon font.
 *
 * Usage: <app-icon name="search" [size]="20" />
 */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0 items-center justify-center', 'aria-hidden': 'true' },
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.fill]="filled() ? 'currentColor' : 'none'"
      [attr.stroke]="filled() ? 'none' : 'currentColor'"
      [attr.stroke-width]="stroke()"
      stroke-linecap="round"
      stroke-linejoin="round"
      [innerHTML]="markup()"
    ></svg>
  `,
})
export class Icon {
  private readonly sanitizer = inject(DomSanitizer);

  readonly name = input.required<IconName>();
  readonly size = input<number | string>(20);
  readonly stroke = input<number>(1.75);

  protected readonly filled = computed(() => FILLED_ICONS.has(this.name()));
  // Markup comes from the static, build-time ICONS map — never from user input.
  protected readonly markup = computed(() => this.sanitizer.bypassSecurityTrustHtml(ICONS[this.name()]));
}
