import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { AppNotification } from '../../../core/models';
import { NotificationApiService } from '../../../core/services/api/notification-api.service';
import { SessionStore } from '../../../core/state/session.store';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import { Icon } from '../../../shared/ui/icon/icon';

/** Bell icon with the user's unread notifications. (React: Header/NotiMenu.) */
@Component({
  selector: 'app-notification-menu',
  imports: [Icon, ClickOutsideDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative" (appClickOutside)="open.set(false)">
      <button
        type="button"
        class="relative rounded-full bg-mine-shaft-900 p-1.5"
        [attr.aria-label]="'Notifications (' + notifications().length + ')'"
        [attr.aria-expanded]="open()"
        (click)="open.set(!open())"
      >
        <app-icon name="bell" [size]="24" [stroke]="1.5" />
        @if (notifications().length) {
          <span class="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-bright-sun-400 opacity-75"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-bright-sun-400"></span>
          </span>
        }
      </button>

      @if (open()) {
        <div class="dropdown right-0 w-96 max-w-[calc(100vw-2rem)] p-2 max-xs:-right-12">
          <div class="flex max-h-[60vh] flex-col gap-2 overflow-y-auto">
            @for (noti of notifications(); track noti.id) {
              <div class="flex cursor-pointer items-start gap-3 rounded-md border border-mine-shaft-800 p-3 hover:bg-mine-shaft-900" (click)="openNotification(noti)">
                <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white">
                  <app-icon name="check" [size]="16" [stroke]="2.5" />
                </span>
                <div class="min-w-0 flex-1">
                  <div class="text-sm font-semibold">{{ noti.action }}</div>
                  <div class="text-sm text-mine-shaft-300">{{ noti.message }}</div>
                </div>
                <button type="button" class="text-mine-shaft-400 hover:text-mine-shaft-100" aria-label="Mark as read" (click)="$event.stopPropagation(); markRead(noti)">
                  <app-icon name="x" [size]="16" />
                </button>
              </div>
            } @empty {
              <div class="py-2 text-center text-mine-shaft-300">No Notifications</div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class NotificationMenu {
  private readonly api = inject(NotificationApiService);
  private readonly router = inject(Router);
  private readonly session = inject(SessionStore);

  protected readonly open = signal(false);
  protected readonly notifications = signal<AppNotification[]>([]);

  constructor() {
    toObservable(this.session.userId)
      .pipe(
        switchMap((id) => (id ? this.api.getNotifications(id).pipe(catchError(() => of([]))) : of([]))),
        takeUntilDestroyed(),
      )
      .subscribe((list) => this.notifications.set(list));
  }

  protected openNotification(noti: AppNotification): void {
    this.open.set(false);
    this.markRead(noti);
    if (noti.route) this.router.navigateByUrl(noti.route);
  }

  protected markRead(noti: AppNotification): void {
    this.notifications.update((list) => list.filter((n) => n.id !== noti.id));
    this.api.markAsRead(noti.id).subscribe({ error: () => {} });
  }
}
