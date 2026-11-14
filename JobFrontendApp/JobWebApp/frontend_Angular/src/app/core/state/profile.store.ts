import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { Profile } from '../models';
import { ProfileApiService } from '../services/api/profile-api.service';
import { ToastService } from '../services/toast.service';
import { getErrorMessage } from '../utils/http-error.utils';
import { SessionStore } from './session.store';

/**
 * The logged-in user's profile. Loads automatically whenever the session's
 * profileId changes. (React equivalent: ProfileSlice.)
 */
@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private readonly api = inject(ProfileApiService);
  private readonly session = inject(SessionStore);
  private readonly toast = inject(ToastService);

  private readonly _profile = signal<Profile | null>(null);
  readonly profile = this._profile.asReadonly();
  readonly savedJobs = computed(() => this._profile()?.savedJobs ?? []);

  constructor() {
    toObservable(this.session.profileId)
      .pipe(
        switchMap((id) => (id ? this.api.getProfile(id).pipe(catchError(() => of(null))) : of(null))),
      )
      .subscribe((profile) => this._profile.set(profile));
  }

  /**
   * Optimistic update: the UI changes immediately, then the full profile is sent
   * to PUT /profiles/update. Rolls back if the request fails.
   */
  update(changes: Partial<Profile>, successMessage?: string): void {
    const previous = this._profile();
    if (!previous) return;
    const updated: Profile = { ...previous, ...changes };
    this._profile.set(updated);
    this.api.updateProfile(updated).subscribe({
      next: () => {
        if (successMessage) this.toast.success('Success', successMessage);
      },
      error: (err) => {
        this._profile.set(previous);
        this.toast.error('Update Failed', getErrorMessage(err));
      },
    });
  }

  isSaved(jobId: number): boolean {
    return this.savedJobs().includes(jobId);
  }

  toggleSavedJob(jobId: number): void {
    const saved = this.savedJobs();
    this.update({
      savedJobs: saved.includes(jobId) ? saved.filter((id) => id !== jobId) : [...saved, jobId],
    });
  }
}
