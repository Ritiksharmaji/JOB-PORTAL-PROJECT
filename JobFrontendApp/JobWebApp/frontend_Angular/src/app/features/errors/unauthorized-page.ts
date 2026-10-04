import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ErrorCard } from './error-card';

@Component({
  selector: 'app-unauthorized-page',
  imports: [ErrorCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-error-card code="403" title="Unauthorized Access" message="Sorry, you don’t have permission to view this page." />`,
})
export class UnauthorizedPage {}
