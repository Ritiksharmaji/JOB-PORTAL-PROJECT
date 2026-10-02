import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RegisterRequest } from '../../models';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  register(user: RegisterRequest): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/register`, user);
  }

  sendOtp(email: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/sendOtp/${encodeURIComponent(email)}`, null);
  }

  verifyOtp(email: string, otp: string): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/verifyOtp/${encodeURIComponent(email)}/${otp}`);
  }

  resetPassword(email: string, password: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/changePass`, { email, password });
  }
}
