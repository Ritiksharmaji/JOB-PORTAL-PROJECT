import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Certification, Experience } from '../../../core/models';
import { ImgFallbackDirective } from '../../directives/img-fallback.directive';
import { MonthYearPipe } from '../../pipes/date.pipes';

/** Read-only experience entry (talent profile + own profile list). */
@Component({
  selector: 'app-experience-item',
  imports: [MonthYearPipe, ImgFallbackDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-2', 'data-aos': 'fade-up' },
  template: `
    @let e = experience();
    <div class="flex flex-wrap justify-between gap-2">
      <div class="flex items-center gap-2">
        <div class="logo-box"><img class="h-7 w-7 object-contain" [src]="'/Icons/' + e.company + '.png'" alt="" appImgFallback /></div>
        <div class="flex flex-col">
          <div class="font-semibold">{{ e.title }}</div>
          <div class="text-sm text-mine-shaft-300">{{ e.company }} &bull; {{ e.location }}</div>
        </div>
      </div>
      <div class="text-sm text-mine-shaft-300">{{ e.startDate | monthYear }} - {{ e.working ? 'Present' : (e.endDate | monthYear) }}</div>
    </div>
    <p class="text-justify text-sm text-mine-shaft-300 max-xs:text-xs">{{ e.description }}</p>
    <ng-content />
  `,
})
export class ExperienceItem {
  readonly experience = input.required<Experience>();
}

/** Read-only certification entry. */
@Component({
  selector: 'app-certification-item',
  imports: [MonthYearPipe, ImgFallbackDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-wrap justify-between gap-2 max-sm:flex-wrap', 'data-aos': 'fade-up' },
  template: `
    @let c = certification();
    <div class="flex items-center gap-2">
      <div class="logo-box"><img class="h-7 w-7 object-contain" [src]="'/Icons/' + c.issuer + '.png'" alt="" appImgFallback /></div>
      <div class="flex flex-col">
        <div class="font-semibold max-xs:text-sm">{{ c.name }}</div>
        <div class="text-sm text-mine-shaft-300 max-xs:text-xs">{{ c.issuer }}</div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <div class="flex flex-col items-end max-sm:flex-row max-sm:gap-2">
        <div class="text-sm text-mine-shaft-300 max-xs:text-xs">Issued {{ c.issueDate | monthYear }}</div>
        <div class="text-sm text-mine-shaft-300 max-xs:text-xs">ID: {{ c.certificateId }}</div>
      </div>
      <ng-content />
    </div>
  `,
})
export class CertificationItem {
  readonly certification = input.required<Certification>();
}
