import * as FileSystem from 'expo-file-system';

// "Jan 2024" — matches the web Utilities.formatDate.
export const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
};

// "5 days ago" — matches the web Utilities.timeAgo.
export const timeAgo = (value) => {
  if (!value) return '';
  const then = new Date(value).getTime();
  if (isNaN(then)) return '';
  const seconds = Math.floor((Date.now() - then) / 1000);
  const intervals = [
    { label: 'year', secs: 31536000 },
    { label: 'month', secs: 2592000 },
    { label: 'day', secs: 86400 },
    { label: 'hour', secs: 3600 },
    { label: 'minute', secs: 60 },
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.secs);
    if (count >= 1) return `${count} ${i.label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

// Job package is a Long number of LPA on the backend.
export const pkgText = (job) => (job?.packageOffered != null ? `${job.packageOffered} LPA` : '—');

export const postedAgo = (job) => timeAgo(job?.postTime);

// Job/about descriptions can be HTML (rich text from the web editor). Strip tags for RN <Text>.
export const stripHtml = (html) =>
  (html || '')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

// Read a local file URI (resume PDF / doc) into a raw base64 string (no data: prefix),
// which is what the backend ApplicantDTO.resume / ProfileDTO.picture expect.
export const fileToBase64 = async (uri) => {
  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
};

export const initials = (name) =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
