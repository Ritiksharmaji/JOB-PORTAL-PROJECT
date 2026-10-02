import { Injectable, signal } from '@angular/core';
import { SortOption } from '../models';

/** Current sort option. Sorting happens client-side. (React: SortSlice.) */
@Injectable({ providedIn: 'root' })
export class SortStore {
  readonly sort = signal<SortOption>('Relevance');

  reset(): void {
    this.sort.set('Relevance');
  }
}
