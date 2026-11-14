import { ChangeDetectionStrategy, Component } from '@angular/core';
import { COMPANIES } from '../../../data/landing.data';

/** "Trusted by" logo marquee (pure CSS animation; pauses on hover). */
@Component({
  selector: 'app-companies',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mt-20 pb-5">
      <h2 class="heading-xl mb-10!" data-aos="zoom-out">Trusted By <span class="text-bright-sun-400">1000+</span> Companies</h2>
      <div class="group overflow-hidden">
        <div class="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
          @for (company of loop; track $index) {
            <div class="mx-8 cursor-pointer rounded-xl px-2 py-1 hover:bg-mine-shaft-900 max-sm:mx-6 max-xs:mx-4 max-xsm:mx-2">
              <img class="h-14" [src]="'/Companies/' + company + '.png'" [alt]="company" />
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class Companies {
  /** Rendered twice so the -50% translate loops seamlessly. */
  protected readonly loop = [...COMPANIES, ...COMPANIES];
}
