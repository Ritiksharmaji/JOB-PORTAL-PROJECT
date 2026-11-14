import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfileStore } from '../../../core/state/profile.store';
import { Icon } from '../../../shared/ui/icon/icon';
import { TagsInput } from '../../../shared/ui/tags-input/tags-input';

/** Header row with the edit / save / cancel buttons used by each profile section. */
@Component({
  selector: 'app-section-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-3 flex items-center justify-between text-2xl font-semibold">
      <ng-content />
      <div class="flex gap-1">
        <ng-content select="[extra]" />
      </div>
    </div>
  `,
})
export class SectionHeader {}

@Component({
  selector: 'app-profile-about',
  imports: [FormsModule, Icon, SectionHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section data-aos="fade-up">
      <app-section-header>
        About
        <span extra class="flex gap-1">
          @if (editing()) {
            <button type="button" class="icon-btn icon-btn-success" aria-label="Save about" (click)="save()"><app-icon name="check" [stroke]="1.5" /></button>
          }
          <button type="button" class="icon-btn" [class.icon-btn-danger]="editing()" [attr.aria-label]="editing() ? 'Cancel' : 'Edit about'" (click)="toggle()">
            <app-icon [name]="editing() ? 'x' : 'pencil'" [stroke]="1.5" />
          </button>
        </span>
      </app-section-header>
      @if (editing()) {
        <textarea class="field-input" rows="4" placeholder="Enter about yourself" [(ngModel)]="draft" aria-label="About"></textarea>
      } @else {
        <p class="text-justify text-sm text-mine-shaft-300">{{ profileStore.profile()?.about }}</p>
      }
    </section>
  `,
})
export class ProfileAbout {
  protected readonly profileStore = inject(ProfileStore);
  protected readonly editing = signal(false);
  protected draft = '';

  protected toggle(): void {
    if (!this.editing()) this.draft = this.profileStore.profile()?.about ?? '';
    this.editing.update((e) => !e);
  }

  protected save(): void {
    this.profileStore.update({ about: this.draft }, 'About Updated Successfully');
    this.editing.set(false);
  }
}

@Component({
  selector: 'app-profile-skills',
  imports: [FormsModule, Icon, SectionHeader, TagsInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section data-aos="fade-up">
      <app-section-header>
        Skills
        <span extra class="flex gap-1">
          @if (editing()) {
            <button type="button" class="icon-btn icon-btn-success" aria-label="Save skills" (click)="save()"><app-icon name="check" [stroke]="1.5" /></button>
          }
          <button type="button" class="icon-btn" [class.icon-btn-danger]="editing()" [attr.aria-label]="editing() ? 'Cancel' : 'Edit skills'" (click)="toggle()">
            <app-icon [name]="editing() ? 'x' : 'pencil'" [stroke]="1.5" />
          </button>
        </span>
      </app-section-header>
      @if (editing()) {
        <app-tags-input placeholder="Add skill" [(ngModel)]="draft" />
      } @else {
        <div class="flex flex-wrap gap-2">
          @for (skill of profileStore.profile()?.skills; track skill) {
            <span class="skill-pill">{{ skill }}</span>
          }
        </div>
      }
    </section>
  `,
})
export class ProfileSkills {
  protected readonly profileStore = inject(ProfileStore);
  protected readonly editing = signal(false);
  protected draft: string[] = [];

  protected toggle(): void {
    if (!this.editing()) this.draft = [...(this.profileStore.profile()?.skills ?? [])];
    this.editing.update((e) => !e);
  }

  protected save(): void {
    this.profileStore.update({ skills: this.draft }, 'Skills Updated Successfully');
    this.editing.set(false);
  }
}
