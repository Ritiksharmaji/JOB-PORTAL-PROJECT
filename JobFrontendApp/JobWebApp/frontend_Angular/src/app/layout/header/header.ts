import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SessionStore } from '../../core/state/session.store';
import { Drawer } from '../../shared/ui/drawer/drawer';
import { Icon } from '../../shared/ui/icon/icon';
import { NAV_LINKS } from './nav-links';
import { NotificationMenu } from './notification-menu/notification-menu';
import { ProfileMenu } from './profile-menu/profile-menu';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, Icon, Drawer, ProfileMenu, NotificationMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
})
export class Header {
  private readonly router = inject(Router);
  protected readonly session = inject(SessionStore);
  protected readonly menuOpen = signal(false);

  /** Logged-out visitors see every link (guards send them to /login). */
  protected readonly links = computed(() =>
    this.session.isLoggedIn() ? NAV_LINKS.filter((link) => this.session.hasRole(link.roles)) : NAV_LINKS,
  );

  protected go(url: string): void {
    this.menuOpen.set(false);
    this.router.navigateByUrl(url);
  }
}
