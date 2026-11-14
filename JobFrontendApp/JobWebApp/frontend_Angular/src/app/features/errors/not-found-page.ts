import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ErrorCard } from './error-card';

@Component({
  selector: 'app-not-found-page',
  imports: [ErrorCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-error-card code="404" title="Page Not Found" message="Sorry, the page you are looking for does not exist." />`,
})
export class NotFoundPage {}
