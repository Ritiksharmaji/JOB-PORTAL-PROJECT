import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TESTIMONIALS } from '../../../data/landing.data';
import { Icon } from '../../../shared/ui/icon/icon';

@Component({
  selector: 'app-testimonials',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mt-20 overflow-hidden p-5 pb-5">
      <h2 class="heading-xl" data-aos="zoom-out">What <span class="text-bright-sun-400">User</span> says about us?</h2>
      <div class="mt-10 flex justify-evenly gap-5 max-md:flex-wrap">
        @for (item of testimonials; track item.name) {
          <figure class="flex w-[23%] flex-col gap-3 rounded-xl border border-bright-sun-400 p-3 max-md:w-[48%] max-xs:w-full" data-aos="zoom-in">
            <div class="flex items-center gap-2">
              <img class="h-14 w-14 rounded-full object-cover" src="/avatar.png" alt="" />
              <div>
                <figcaption class="text-lg font-semibold text-mine-shaft-100 max-sm:text-base max-xs:text-sm">{{ item.name }}</figcaption>
                <div class="flex text-bright-sun-400" [attr.aria-label]="item.rating + ' out of 5 stars'">
                  @for (star of stars; track star) {
                    <app-icon [name]="star <= item.rating ? 'star-filled' : 'star'" [size]="16" [class]="star <= item.rating ? '' : 'text-mine-shaft-600'" />
                  }
                </div>
              </div>
            </div>
            <blockquote class="text-xs text-mine-shaft-300">{{ item.testimonial }}</blockquote>
          </figure>
        }
      </div>
    </section>
  `,
})
export class Testimonials {
  protected readonly testimonials = TESTIMONIALS;
  protected readonly stars = [1, 2, 3, 4, 5];
}
