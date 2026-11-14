/** "Aug 2023" style month/year label. */
export function formatMonthYear(dateString?: string | null): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short' });
}

/** "August 25, 2026 at 10:30 AM" style label for interview slots. */
export function formatInterviewTime(dateString?: string | null): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
}

/** Relative time such as "3 days ago". */
export function timeAgo(timestamp?: string | null): string {
  if (!timestamp) return '';
  const diffInMs = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.max(0, Math.floor(diffInMs / 1000));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  const plural = (value: number, unit: string) => `${value} ${unit}${value === 1 ? '' : 's'} ago`;
  if (seconds < 60) return plural(seconds, 'second');
  if (minutes < 60) return plural(minutes, 'minute');
  if (hours < 24) return plural(hours, 'hour');
  if (days < 30) return plural(days, 'day');
  if (months < 12) return plural(months, 'month');
  return plural(years, 'year');
}

/** ISO string -> value for <input type="month"> ("YYYY-MM"). */
export function toMonthInputValue(iso?: string | null): string {
  const date = iso ? new Date(iso) : new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * <input type="month"> value ("YYYY-MM") -> ISO string. Anchored at 12:00 UTC on
 * the 1st so the month stays the same when displayed in any timezone.
 */
export function fromMonthInputValue(value: string): string {
  const [year, month] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, 1, 12)).toISOString();
}

/** Today's date as "YYYY-MM-DD" for <input type="date" min>. */
export function todayInputValue(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
