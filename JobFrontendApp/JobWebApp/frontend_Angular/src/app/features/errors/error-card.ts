import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error-card',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen items-center justify-center bg-mine-shaft-950">
      <div class="max-w-md rounded-lg bg-mine-shaft-900 p-8 text-center shadow-md">
        <h1 class="mb-4 text-5xl font-bold text-red-500">{{ code() }}</h1>
        <h2 class="mb-4 text-2xl font-semibold text-bright-sun-400">{{ title() }}</h2>
        <p class="mb-6 text-bright-sun-400">{{ message() }}</p>
        <a routerLink="/" class="btn btn-filled">Go to Homepage</a>
      </div>
    </div>
  `,
})
export class ErrorCard {
  readonly code = input.required<string>();
  readonly title = input.required<string>();
  readonly message = input.required<string>();
}
