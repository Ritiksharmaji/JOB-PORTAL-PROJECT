import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WORK_STEPS } from '../../../data/landing.data';

@Component({
  selector: 'app-how-it-works',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mt-20 overflow-hidden pb-5">
      <h2 class="heading-xl" data-aos="zoom-out">How it <span class="text-bright-sun-400">Works</span></h2>
      <p class="mx-auto mb-10 w-1/2 text-center text-lg text-mine-shaft-300 max-sm:w-11/12 max-sm:text-base max-xs:text-sm" data-aos="zoom-out">
        Effortlessly navigate through the process and land your dream job.
      </p>
      <div class="flex items-center justify-between gap-2 px-16 max-bs:px-10 max-md:flex-col max-md:px-5">
        <div class="relative" data-aos="fade-right">
          <img class="w-[30rem]" src="/Working/Girl.png" alt="Applicant completing her profile" />
          <div class="absolute top-[15%] right-0 flex w-36 flex-col items-center gap-1 rounded-xl border border-bright-sun-400 px-1 py-3 backdrop-blur-md max-xs:w-28">
            <img class="h-16 w-16 rounded-full object-cover max-xs:h-12 max-xs:w-12" src="/avatar1.png" alt="" />
            <div class="text-center text-sm font-semibold text-mine-shaft-200 max-sm:text-xs">Complete your profile</div>
            <div class="text-xs text-mine-shaft-300">70% Completed</div>
          </div>
        </div>
        <div class="flex flex-col gap-10" data-aos="fade-left">
          @for (step of steps; track step.name) {
            <div class="flex items-center gap-4">
              <div class="rounded-full bg-bright-sun-300 p-2.5">
                <img class="h-12 w-12 max-md:h-9 max-md:w-9 max-sm:h-7 max-sm:w-7" [src]="'/Working/' + step.image + '.png'" [alt]="step.name" />
              </div>
              <div>
                <div class="text-xl font-semibold text-mine-shaft-200 max-md:text-lg max-sm:text-base">{{ step.name }}</div>
                <div class="text-mine-shaft-300 max-md:text-sm max-sm:text-xs">{{ step.desc }}</div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class HowItWorks {
  protected readonly steps = WORK_STEPS;
}
