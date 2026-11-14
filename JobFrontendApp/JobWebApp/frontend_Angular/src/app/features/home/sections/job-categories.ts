import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';
import { JOB_CATEGORIES } from '../../../data/landing.data';
import { Icon } from '../../../shared/ui/icon/icon';

/** Horizontally scrollable category carousel (scroll-snap + arrow controls). */
@Component({
  selector: 'app-job-categories',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mt-20 overflow-hidden pb-5">
      <h2 class="heading-xl" data-aos="zoom-out">Browse <span class="text-bright-sun-400">Job</span> Category</h2>
      <p class="mx-auto mb-10 w-1/2 text-center text-lg text-mine-shaft-300 max-sm:w-11/12 max-sm:text-base max-xs:text-sm" data-aos="zoom-out">
        Explore diverse job opportunities tailored to your skills. Start your career journey today!
      </p>
      <div class="group relative">
        <button type="button" class="absolute top-1/2 left-3 z-10 -translate-y-1/2 rounded-full bg-bright-sun-400 p-1 text-black opacity-0 transition group-hover:opacity-100 hover:opacity-75" aria-label="Previous" (click)="scroll(-1)">
          <app-icon name="arrow-left" [size]="32" />
        </button>
        <div #track class="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          @for (category of categories; track category.name) {
            <div class="snap-start">
              <div class="my-5 flex w-64 flex-col items-center gap-2 rounded-xl border border-bright-sun-400 p-5 transition duration-300 ease-in-out hover:cursor-pointer hover:shadow-[0_0_5px_2px] hover:shadow-bright-sun-300 max-sm:w-56 max-xs:w-48" data-aos="zoom-out">
                <div class="rounded-full bg-bright-sun-300 p-2">
                  <img class="h-8 w-8 max-sm:h-6 max-sm:w-6 max-xs:h-4 max-xs:w-4" [src]="'/Category/' + category.name + '.png'" [alt]="category.name" />
                </div>
                <div class="text-xl font-semibold text-mine-shaft-100 max-sm:text-lg max-xs:text-base">{{ category.name }}</div>
                <div class="text-center text-sm text-mine-shaft-300 max-xs:text-xs">{{ category.desc }}</div>
                <div class="text-lg text-bright-sun-300 max-sm:text-base max-xs:text-sm">{{ category.jobs }}+ new job posted</div>
              </div>
            </div>
          }
        </div>
        <button type="button" class="absolute top-1/2 right-3 z-10 -translate-y-1/2 rounded-full bg-bright-sun-400 p-1 text-black opacity-0 transition group-hover:opacity-100 hover:opacity-75" aria-label="Next" (click)="scroll(1)">
          <app-icon name="arrow-right" [size]="32" />
        </button>
      </div>
    </section>
  `,
})
export class JobCategories {
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  protected readonly categories = JOB_CATEGORIES;

  /** Scrolls one card; wraps around at either end like a looping carousel. */
  protected scroll(direction: 1 | -1): void {
    const el = this.track().nativeElement;
    const step = 272;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const atStart = el.scrollLeft <= 4;
    if (direction === 1 && atEnd) el.scrollTo({ left: 0 });
    else if (direction === -1 && atStart) el.scrollTo({ left: el.scrollWidth });
    else el.scrollBy({ left: direction * step });
  }
}
