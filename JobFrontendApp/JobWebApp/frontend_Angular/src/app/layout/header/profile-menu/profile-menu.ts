import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { ProfileStore } from '../../../core/state/profile.store';
import { SessionStore } from '../../../core/state/session.store';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import { PicturePipe } from '../../../shared/pipes/picture.pipe';
import { Icon } from '../../../shared/ui/icon/icon';

@Component({
  selector: 'app-profile-menu',
  imports: [RouterLink, Icon, PicturePipe, ClickOutsideDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative" (appClickOutside)="open.set(false)">
      <button type="button" class="flex items-center gap-2" [attr.aria-expanded]="open()" aria-haspopup="menu" (click)="open.set(!open())">
        <span class="max-xs:hidden">{{ session.user()?.name }}</span>
        <img class="h-9 w-9 rounded-full object-cover" [src]="profileStore.profile()?.picture | picture" alt="Your avatar" />
      </button>

      @if (open()) {
        <div class="dropdown right-0 w-52 py-1" role="menu">
          <a routerLink="/profile" class="dropdown-item" role="menuitem" (click)="open.set(false)">
            <app-icon name="user-circle" [size]="16" /> Profile
          </a>
          <button type="button" class="dropdown-item" role="menuitem">
            <app-icon name="message-circle" [size]="16" /> Messages
          </button>
          <button type="button" class="dropdown-item" role="menuitem">
            <app-icon name="file-text" [size]="16" /> Resume
          </button>
          <button type="button" class="dropdown-item justify-between" role="menuitemcheckbox" [attr.aria-checked]="isLight()" (click)="theme.toggle()">
            <span class="flex items-center gap-2"><app-icon name="moon" [size]="16" /> {{ isLight() ? 'Light Mode' : 'Dark Mode' }}</span>
            <span class="relative inline-flex h-5 w-9 items-center rounded-full transition" [class]="isLight() ? 'bg-mine-shaft-200' : 'bg-mine-shaft-700'">
              <span class="absolute flex h-4 w-4 items-center justify-center rounded-full bg-white transition-transform" [class]="isLight() ? 'translate-x-[18px]' : 'translate-x-0.5'">
                <app-icon [name]="isLight() ? 'sun' : 'moon-stars'" [size]="11" [stroke]="2.5" [class]="isLight() ? 'text-yellow-500' : 'text-cyan-600'" />
              </span>
            </span>
          </button>
          <hr class="divider my-1" />
          <button type="button" class="dropdown-item text-red-500!" role="menuitem" (click)="logout()">
            <app-icon name="logout-2" [size]="16" /> Logout
          </button>
        </div>
      }
    </div>
  `,
})
export class ProfileMenu {
  private readonly router = inject(Router);
  protected readonly session = inject(SessionStore);
  protected readonly profileStore = inject(ProfileStore);
  protected readonly theme = inject(ThemeService);
  protected readonly open = signal(false);

  protected isLight(): boolean {
    return this.theme.scheme() === 'light';
  }

  protected logout(): void {
    this.open.set(false);
    this.session.logout();
    this.router.navigateByUrl('/');
  }
}
