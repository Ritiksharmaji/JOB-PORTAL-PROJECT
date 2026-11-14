import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Profile } from '../../models';

@Injectable({ providedIn: 'root' })
export class ProfileApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/profiles`;

  getProfile(id: number | string): Observable<Profile> {
    return this.http.get<Profile>(`${this.baseUrl}/get/${id}`);
  }

  getAllProfiles(): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.baseUrl}/getAll`);
  }

  /** Every profile edit sends the full profile object. */
  updateProfile(profile: Profile): Observable<Profile> {
    return this.http.put<Profile>(`${this.baseUrl}/update`, profile);
  }
}
