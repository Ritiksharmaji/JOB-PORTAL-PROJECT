import { Injectable, computed, signal } from '@angular/core';
import { SearchFilter } from '../models';

/** Find Jobs / Find Talent criteria. Filtering happens client-side. (React: FilterSlice.) */
@Injectable({ providedIn: 'root' })
export class FilterStore {
  private readonly _filter = signal<SearchFilter>({});
  readonly filter = this._filter.asReadonly();

  readonly hasActiveFilters = computed(() =>
    Object.values(this._filter()).some((value) =>
      Array.isArray(value) ? value.length > 0 : value !== undefined && value !== '',
    ),
  );

  update(changes: Partial<SearchFilter>): void {
    this._filter.update((current) => ({ ...current, ...changes }));
  }

  reset(): void {
    this._filter.set({});
  }
}
