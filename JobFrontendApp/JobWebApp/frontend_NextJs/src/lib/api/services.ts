import type {
  AppNotification,
  ApplicationPayload,
  ApplicationStatus,
  ApplicationStatusUpdate,
  Job,
  JobPayload,
  LoginRequest,
  LoginResponse,
  Profile,
  RegisterRequest,
} from '@/types';
import { api } from './client';

/** One object per backend resource. Every method resolves to the response body. */

export const authApi = {
  /** Returns only `{ jwt }` — identity and role are decoded from the token. */
  login: (credentials: LoginRequest) => api.post<LoginResponse>('/auth/login', credentials).then((r) => r.data),
};

export const userApi = {
  register: (user: RegisterRequest) => api.post('/users/register', user).then((r) => r.data),
  sendOtp: (email: string) => api.post(`/users/sendOtp/${encodeURIComponent(email)}`).then((r) => r.data),
  verifyOtp: (email: string, otp: string) =>
    api.get(`/users/verifyOtp/${encodeURIComponent(email)}/${otp}`).then((r) => r.data),
  resetPassword: (email: string, password: string) =>
    api.post('/users/changePass', { email, password }).then((r) => r.data),
};

export const jobApi = {
  /** Create, or update when `id` is set. */
  postJob: (job: JobPayload) => api.post<Job>('/jobs/post', job).then((r) => r.data),
  getAllJobs: () => api.get<Job[]>('/jobs/getAll').then((r) => r.data),
  getJob: (id: number | string) => api.get<Job>(`/jobs/get/${id}`).then((r) => r.data),
  applyJob: (id: number | string, application: ApplicationPayload) =>
    api.post(`/jobs/apply/${id}`, application).then((r) => r.data),
  getHistory: (userId: number, status: ApplicationStatus) =>
    api.get<Job[]>(`/jobs/history/${userId}/${status}`).then((r) => r.data),
  getJobsPostedBy: (userId: number) => api.get<Job[]>(`/jobs/postedBy/${userId}`).then((r) => r.data),
  changeApplicationStatus: (update: ApplicationStatusUpdate) =>
    api.post('/jobs/changeAppStatus', update).then((r) => r.data),
};

export const profileApi = {
  getProfile: (id: number | string) => api.get<Profile>(`/profiles/get/${id}`).then((r) => r.data),
  getAllProfiles: () => api.get<Profile[]>('/profiles/getAll').then((r) => r.data),
  /** Every profile edit sends the full profile object. */
  updateProfile: (profile: Profile) => api.put<Profile>('/profiles/update', profile).then((r) => r.data),
};

export const notificationApi = {
  getNotifications: (userId: number) =>
    api.get<AppNotification[]>(`/notification/get/${userId}`).then((r) => r.data),
  markAsRead: (id: number) => api.put(`/notification/read/${id}`).then((r) => r.data),
};
