import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { readString, writeString } from '../utils/storage.utils';

export type ColorScheme = 'light' | 'dark';

/**
 * Light/dark theme. Dark is the default; "light" adds `.light-theme` to <html>,
 * which swaps the CSS-variable ramp used by every `mine-shaft` Tailwind colour.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly scheme = signal<ColorScheme>(readString(STORAGE_KEYS.theme) === 'light' ? 'light' : 'dark');

  constructor() {
    effect(() => {
      const scheme = this.scheme();
      this.document.documentElement.classList.toggle('light-theme', scheme === 'light');
      writeString(STORAGE_KEYS.theme, scheme);
    });
  }

  toggle(): void {
    this.scheme.update((s) => (s === 'light' ? 'dark' : 'light'));
  }
}
