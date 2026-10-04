import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error';

export interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message: string;
}

/** Global toast notifications (the Angular stand-in for @mantine/notifications). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private static readonly AUTO_CLOSE_MS = 4000;
  private nextId = 0;
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  success(title: string, message: string): void {
    this.show('success', title, message);
  }

  error(title: string, message: string): void {
    this.show('error', title, message);
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((toast) => toast.id !== id));
  }

  private show(type: ToastType, title: string, message: string): void {
    const id = ++this.nextId;
    this._toasts.update((list) => [...list, { id, type, title, message }]);
    setTimeout(() => this.dismiss(id), ToastService.AUTO_CLOSE_MS);
  }
}
