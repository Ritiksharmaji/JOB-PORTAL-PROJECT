import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

/**
 * Sanitizes user-authored rich text (job descriptions) with DOMPurify, then marks
 * it trusted so Angular keeps formatting such as `style="text-align:center"`.
 *
 * Usage: <div [innerHTML]="job.description | sanitizeHtml"></div>
 */
@Pipe({ name: 'sanitizeHtml' })
export class SanitizeHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value?: string | null): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(DOMPurify.sanitize(value ?? ''));
  }
}
