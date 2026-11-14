import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileStore } from '../../../core/state/profile.store';
import { SessionStore } from '../../../core/state/session.store';
import { COMPANY_NAMES, JOB_TITLES, LOCATIONS } from '../../../data/options.data';
import { CreatableSelect } from '../../../shared/ui/creatable-select/creatable-select';
import { Icon } from '../../../shared/ui/icon/icon';

@Component({
  selector: 'app-profile-info',
  imports: [ReactiveFormsModule, Icon, CreatableSelect],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let p = profileStore.profile();
    <div class="flex justify-between text-3xl font-semibold max-xs:text-2xl" data-aos="zoom-out">
      {{ session.user()?.name }}
      <div class="flex gap-1">
        @if (editing()) {
          <button type="button" class="icon-btn icon-btn-success" aria-label="Save" (click)="save()"><app-icon name="check" [stroke]="1.5" /></button>
        }
        <button type="button" class="icon-btn" [class.icon-btn-danger]="editing()" [attr.aria-label]="editing() ? 'Cancel' : 'Edit info'" (click)="toggle()">
          <app-icon [name]="editing() ? 'x' : 'pencil'" [stroke]="1.5" />
        </button>
      </div>
    </div>

    @if (editing()) {
      <form [formGroup]="form" class="contents" (ngSubmit)="save()">
        <div class="my-3 flex gap-10 *:w-1/2 max-md:gap-5 max-xs:flex-wrap max-xs:*:w-full">
          <app-creatable-select formControlName="jobTitle" label="Job Title" placeholder="Enter Job Title" icon="briefcase" [options]="jobTitles" required />
          <app-creatable-select formControlName="company" label="Company" placeholder="Enter Company Name" icon="briefcase" [options]="companies" required />
        </div>
        <div class="my-3 flex gap-10 *:w-1/2 max-md:gap-5 max-xs:flex-wrap max-xs:*:w-full">
          <app-creatable-select formControlName="location" label="Location" placeholder="Enter Job Location" icon="map-pin" [options]="locations" required />
          <div class="field">
            <label class="field-label required" for="info-exp">Experience</label>
            <input id="info-exp" type="number" min="1" max="50" class="field-input" formControlName="totalExp" />
          </div>
        </div>
      </form>
    } @else {
      <div class="flex items-center gap-1 text-xl max-xs:text-base"><app-icon name="briefcase" [stroke]="1.5" /> {{ p?.jobTitle }} &bull; {{ p?.company }}</div>
      <div class="flex items-center gap-1 text-lg text-mine-shaft-300 max-xs:text-base"><app-icon name="map-pin" [stroke]="1.5" /> {{ p?.location }}</div>
      <div class="flex items-center gap-1 text-lg text-mine-shaft-300 max-xs:text-base"><app-icon name="briefcase" [stroke]="1.5" /> Experience: {{ p?.totalExp }} Years</div>
    }
  `,
})
export class ProfileInfo {
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly session = inject(SessionStore);
  protected readonly profileStore = inject(ProfileStore);

  protected readonly jobTitles = JOB_TITLES;
  protected readonly companies = COMPANY_NAMES;
  protected readonly locations = LOCATIONS;
  protected readonly editing = signal(false);

  protected readonly form = this.fb.group({
    jobTitle: [''],
    company: [''],
    location: [''],
    totalExp: [1, [Validators.min(1), Validators.max(50)]],
  });

  protected toggle(): void {
    if (!this.editing()) {
      const p = this.profileStore.profile();
      this.form.reset({ jobTitle: p?.jobTitle ?? '', company: p?.company ?? '', location: p?.location ?? '', totalExp: p?.totalExp ?? 1 });
    }
    this.editing.update((e) => !e);
  }

  protected save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.profileStore.update({ ...value, totalExp: Number(value.totalExp) }, 'Profile Updated Successfully');
    this.editing.set(false);
  }
}
