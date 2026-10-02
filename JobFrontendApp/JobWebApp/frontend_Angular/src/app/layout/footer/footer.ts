import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FOOTER_LINKS } from '../../data/landing.data';
import { Icon } from '../../shared/ui/icon/icon';

@Component({
  selector: 'app-footer',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="flex flex-col gap-2">
      <div class="flex flex-wrap justify-around gap-8 bg-mine-shaft-950 p-4 pt-20 pb-5">
        <div class="flex w-1/4 flex-col gap-4 max-sm:w-1/3 max-xs:w-1/2 max-xsm:w-full" data-aos="fade-up" data-aos-offset="0">
          <div class="flex items-center gap-1 text-bright-sun-400">
            <app-icon name="anchor" [size]="24" [stroke]="2.5" />
            <div class="text-xl font-semibold">JobHook</div>
          </div>
          <p class="text-sm text-mine-shaft-300">
            Job portal with user profiles, skill updates, certifications, work experience and admin job postings.
          </p>
          <div class="flex gap-3 text-bright-sun-400">
            @for (social of socials; track social.url) {
              <a class="rounded-full bg-mine-shaft-900 p-2 hover:bg-mine-shaft-700" [href]="social.url" target="_blank" rel="noopener" [attr.aria-label]="social.label">
                <app-icon [name]="social.icon" />
              </a>
            }
          </div>
        </div>
        @for (group of footerLinks; track group.title) {
          <div data-aos="fade-up" data-aos-offset="0">
            <div class="mb-4 text-lg font-semibold text-bright-sun-400">{{ group.title }}</div>
            @for (link of group.links; track link) {
              <div class="mb-1 cursor-pointer text-sm text-mine-shaft-300 transition duration-300 ease-in-out hover:translate-x-2 hover:text-bright-sun-400">
                {{ link }}
              </div>
            }
          </div>
        }
      </div>
      <hr class="divider" />
      <div class="p-5 text-center font-medium" data-aos="flip-left" data-aos-offset="0">
        Designed &amp; Developed By
        <a class="font-semibold text-bright-sun-400 hover:underline" href="https://github.com/Code-Mars" target="_blank" rel="noopener">Chandrabhan Maurya</a>
      </div>
    </footer>
  `,
})
export class Footer {
  protected readonly footerLinks = FOOTER_LINKS;
  protected readonly socials = [
    { icon: 'brand-instagram' as const, url: 'https://www.instagram.com/code.marshal_/', label: 'Instagram' },
    { icon: 'brand-telegram' as const, url: 'https://t.me/code_Marshal', label: 'Telegram' },
    { icon: 'brand-youtube' as const, url: 'https://www.youtube.com/@Code.Marshal', label: 'YouTube' },
  ];
}
