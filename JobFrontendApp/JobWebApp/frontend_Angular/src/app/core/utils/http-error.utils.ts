import { HttpErrorResponse } from '@angular/common/http';

/** The backend returns errors as `{ errorMessage }` with HTTP 400/500. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as { errorMessage?: string } | null;
    if (body?.errorMessage) return body.errorMessage;
    if (error.status === 0) return 'Cannot reach the server. Check your connection or the API URL.';
  }
  return fallback;
}
