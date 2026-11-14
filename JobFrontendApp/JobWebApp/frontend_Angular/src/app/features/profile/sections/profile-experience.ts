import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Certification, Experience } from '../../../core/models';
import { ProfileStore } from '../../../core/state/profile.store';
import { CertificationItem, ExperienceItem } from '../../../shared/components/profile-sections/profile-sections';
import { Icon } from '../../../shared/ui/icon/icon';
import { CertificationForm } from './certification-form';
import { ExperienceForm } from './experience-form';
import { SectionHeader } from './profile-about';

@Component({
  selector: 'app-profile-experience',
  imports: [Icon, SectionHeader, ExperienceItem, ExperienceForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section data-aos="fade-up">
      <app-section-header>
        Experience
        <span extra class="flex gap-1">
          <button type="button" class="icon-btn" aria-label="Add experience" (click)="adding.set(true)"><app-icon name="plus" [stroke]="1.5" /></button>
          <button type="button" class="icon-btn" [class.icon-btn-danger]="editMode()" [attr.aria-label]="editMode() ? 'Done editing' : 'Edit experience'" (click)="editMode.update((e) => !e)">
            <app-icon [name]="editMode() ? 'x' : 'pencil'" [stroke]="1.5" />
          </button>
        </span>
      </app-section-header>

      <div class="flex flex-col gap-8">
        @for (exp of experiences(); track $index; let i = $index) {
          @if (editingIndex() === i) {
            <app-experience-form [experience]="exp" (saved)="replace(i, $event)" (cancelled)="editingIndex.set(null)" />
          } @else {
            <app-experience-item [experience]="exp">
              @if (editMode()) {
                <div class="flex gap-5">
                  <button type="button" class="btn btn-outline" (click)="editingIndex.set(i)">Edit</button>
                  <button type="button" class="btn btn-danger" (click)="remove(i)">Delete</button>
                </div>
              }
            </app-experience-item>
          }
        }
        @if (adding()) {
          <app-experience-form (saved)="add($event)" (cancelled)="adding.set(false)" />
        }
      </div>
    </section>
  `,
})
export class ProfileExperience {
  private readonly profileStore = inject(ProfileStore);
  protected readonly experiences = computed(() => this.profileStore.profile()?.experiences ?? []);
  protected readonly editMode = signal(false);
  protected readonly adding = signal(false);
  protected readonly editingIndex = signal<number | null>(null);

  protected add(exp: Experience): void {
    this.profileStore.update({ experiences: [...this.experiences(), exp] }, 'Experience Added Successfully');
    this.adding.set(false);
  }

  protected replace(index: number, exp: Experience): void {
    this.profileStore.update(
      { experiences: this.experiences().map((e, i) => (i === index ? exp : e)) },
      'Experience Updated Successfully',
    );
    this.editingIndex.set(null);
  }

  protected remove(index: number): void {
    this.profileStore.update(
      { experiences: this.experiences().filter((_, i) => i !== index) },
      'Experience Deleted Successfully',
    );
  }
}

@Component({
  selector: 'app-profile-certifications',
  imports: [Icon, SectionHeader, CertificationItem, CertificationForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section data-aos="fade-up">
      <app-section-header>
        Certifications
        <span extra class="flex gap-1">
          <button type="button" class="icon-btn" aria-label="Add certification" (click)="adding.set(true)"><app-icon name="plus" [stroke]="1.5" /></button>
          <button type="button" class="icon-btn" [class.icon-btn-danger]="editMode()" [attr.aria-label]="editMode() ? 'Done editing' : 'Edit certifications'" (click)="editMode.update((e) => !e)">
            <app-icon [name]="editMode() ? 'x' : 'pencil'" [stroke]="1.5" />
          </button>
        </span>
      </app-section-header>

      <div class="flex flex-col gap-8">
        @for (cert of certifications(); track $index; let i = $index) {
          <app-certification-item [certification]="cert">
            @if (editMode()) {
              <button type="button" class="icon-btn icon-btn-danger" aria-label="Delete certification" (click)="remove(i)">
                <app-icon name="trash" [stroke]="1.5" />
              </button>
            }
          </app-certification-item>
        }
        @if (adding()) {
          <app-certification-form (saved)="add($event)" (cancelled)="adding.set(false)" />
        }
      </div>
    </section>
  `,
})
export class ProfileCertifications {
  private readonly profileStore = inject(ProfileStore);
  protected readonly certifications = computed(() => this.profileStore.profile()?.certifications ?? []);
  protected readonly editMode = signal(false);
  protected readonly adding = signal(false);

  protected add(cert: Certification): void {
    this.profileStore.update({ certifications: [...this.certifications(), cert] }, 'Certificate Added Successfully');
    this.adding.set(false);
  }

  protected remove(index: number): void {
    this.profileStore.update(
      { certifications: this.certifications().filter((_, i) => i !== index) },
      'Certificate Deleted Successfully',
    );
  }
}
