import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';
import { ProfileStore } from '../../core/state/profile.store';
import { fileToBase64 } from '../../core/utils/file.utils';
import { PicturePipe } from '../../shared/pipes/picture.pipe';
import { Icon } from '../../shared/ui/icon/icon';
import { ProfileAbout, ProfileSkills } from './sections/profile-about';
import { ProfileCertifications, ProfileExperience } from './sections/profile-experience';
import { ProfileInfo } from './sections/profile-info';

const MAX_PICTURE_BYTES = 2 * 1024 * 1024;

/** The logged-in user's editable profile. Every edit goes through ProfileStore.update(). */
@Component({
  selector: 'app-profile-page',
  imports: [Icon, PicturePipe, ProfileInfo, ProfileAbout, ProfileSkills, ProfileExperience, ProfileCertifications],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <hr class="divider mx-4 mb-8" />
      @if (profileStore.profile(); as p) {
        <div class="mx-auto w-4/5 max-lg:w-full">
          <div class="relative px-5" data-aos="zoom-out">
            <img class="w-full rounded-t-2xl max-xs:h-32" src="/Profile/banner.jpg" alt="" />
            <label class="group absolute -bottom-1/3 left-6 flex cursor-pointer items-center justify-center rounded-full max-md:-bottom-10 max-sm:-bottom-16" title="Change profile picture">
              <img class="h-48 w-48 rounded-full border-8 border-mine-shaft-950 object-cover max-md:h-40 max-md:w-40 max-sm:h-36 max-sm:w-36 max-xs:h-32 max-xs:w-32" [src]="p.picture | picture" alt="Profile picture" />
              <span class="absolute inset-0 flex items-center justify-center rounded-full bg-black/75 text-white opacity-0 transition group-hover:opacity-100">
                <app-icon name="edit" [size]="64" />
              </span>
              <input type="file" accept="image/png,image/jpeg" class="sr-only" (change)="onPicture($any($event.target))" />
            </label>
          </div>

          <div class="mt-16 px-3 pt-2">
            <app-profile-info />
            <hr class="divider my-8" />
            <app-profile-about />
            <hr class="divider my-8" />
            <app-profile-skills />
            <hr class="divider my-8" />
            <app-profile-experience />
            <hr class="divider my-8" />
            <app-profile-certifications />
          </div>
        </div>
      } @else {
        <p class="py-20 text-center text-mine-shaft-300">Loading profile…</p>
      }
    </div>
  `,
})
export class ProfilePage {
  protected readonly profileStore = inject(ProfileStore);
  private readonly toast = inject(ToastService);

  protected async onPicture(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (file.size > MAX_PICTURE_BYTES) {
      this.toast.error('Image too large', 'Please choose an image under 2 MB.');
      return;
    }
    this.profileStore.update({ picture: await fileToBase64(file) }, 'Profile Picture Updated Successfully');
  }
}
