import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApplicationPayload,
  ApplicationStatus,
  ApplicationStatusUpdate,
  Job,
  JobPayload,
} from '../../models';

@Injectable({ providedIn: 'root' })
export class JobApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/jobs`;

  /** Create or update (when `id` is set) a job. */
  postJob(job: JobPayload): Observable<Job> {
    return this.http.post<Job>(`${this.baseUrl}/post`, job);
  }

  getAllJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.baseUrl}/getAll`);
  }

  getJob(id: number | string): Observable<Job> {
    return this.http.get<Job>(`${this.baseUrl}/get/${id}`);
  }

  applyJob(id: number | string, application: ApplicationPayload): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/apply/${id}`, application);
  }

  getHistory(userId: number, status: ApplicationStatus): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.baseUrl}/history/${userId}/${status}`);
  }

  getJobsPostedBy(userId: number): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.baseUrl}/postedBy/${userId}`);
  }

  changeApplicationStatus(update: ApplicationStatusUpdate): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/changeAppStatus`, update);
  }
}
