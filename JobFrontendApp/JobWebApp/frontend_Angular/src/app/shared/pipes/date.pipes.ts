import { Pipe, PipeTransform } from '@angular/core';
import { formatInterviewTime, formatMonthYear, timeAgo } from '../../core/utils/date.utils';

/** {{ job.postTime | timeAgo }} -> "3 days ago" */
@Pipe({ name: 'timeAgo' })
export class TimeAgoPipe implements PipeTransform {
  transform(value?: string | null): string {
    return timeAgo(value);
  }
}

/** {{ exp.startDate | monthYear }} -> "Aug 2023" */
@Pipe({ name: 'monthYear' })
export class MonthYearPipe implements PipeTransform {
  transform(value?: string | null): string {
    return formatMonthYear(value);
  }
}

/** {{ applicant.interviewTime | interviewTime }} -> "August 25, 2026 at 10:30 AM" */
@Pipe({ name: 'interviewTime' })
export class InterviewTimePipe implements PipeTransform {
  transform(value?: string | null): string {
    return formatInterviewTime(value);
  }
}
