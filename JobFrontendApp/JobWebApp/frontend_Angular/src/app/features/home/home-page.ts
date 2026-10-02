import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Companies } from './sections/companies';
import { DreamJob } from './sections/dream-job';
import { HowItWorks } from './sections/how-it-works';
import { JobCategories } from './sections/job-categories';
import { Subscribe } from './sections/subscribe';
import { Testimonials } from './sections/testimonials';

@Component({
  selector: 'app-home-page',
  imports: [DreamJob, Companies, JobCategories, HowItWorks, Testimonials, Subscribe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-dream-job />
      <app-companies />
      <app-job-categories />
      <app-how-it-works />
      <app-testimonials />
      <app-subscribe />
    </div>
  `,
})
export class HomePage {}
