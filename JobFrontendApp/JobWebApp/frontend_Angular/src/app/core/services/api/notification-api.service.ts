import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AppNotification } from '../../models';

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/notification`;

  getNotifications(userId: number): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.baseUrl}/get/${userId}`);
  }

  markAsRead(id: number): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/read/${id}`, null);
  }
}
