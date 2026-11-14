import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { EMAIL_PATTERN } from '../../../core/utils/validators';

@Component({
  selector: 'app-subscribe',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-20 mt-20 flex flex-wrap items-center justify-around gap-4 rounded-xl bg-mine-shaft-900 py-3 max-sm:mx-5" data-aos="zoom-out">
      <h2 class="w-2/5 text-center text-4xl font-semibold text-mine-shaft-100 max-bs:w-4/5 max-md:text-3xl max-sm:text-2xl max-xs:text-xl">
        Never Wants to Miss Any <span class="text-bright-sun-400">Job News?</span>
      </h2>
      <form class="flex gap-4 rounded-xl bg-mine-shaft-700 px-3 py-2 max-xs:flex-col xs:items-center" (submit)="$event.preventDefault(); subscribe()">
        <input
          type="email"
          class="bg-transparent px-2 text-xl font-semibold text-mine-shaft-100 outline-none placeholder:text-mine-shaft-300 max-sm:text-base"
          placeholder="Your@email.com"
          aria-label="Email address"
          [value]="email()"
          (input)="email.set($any($event.target).value)"
        />
        <button type="submit" class="btn btn-filled btn-lg rounded-lg max-sm:h-9 max-sm:text-sm">Subscribe</button>
      </form>
    </section>
  `,
})
export class Subscribe {
  private readonly toast = inject(ToastService);
  protected readonly email = signal('');

  protected subscribe(): void {
    if (!EMAIL_PATTERN.test(this.email())) {
      this.toast.error('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    this.toast.success('Subscribed', 'You will now receive job news in your inbox.');
    this.email.set('');
  }
}
