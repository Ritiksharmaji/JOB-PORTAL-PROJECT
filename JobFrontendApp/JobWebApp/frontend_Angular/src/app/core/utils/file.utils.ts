/** Reads a file and returns its Base64 payload without the `data:...;base64,` prefix. */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Opens a Base64 encoded PDF in a new browser tab. */
export function openPdf(base64?: string): void {
  if (!base64) return;
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const win = window.open(url);
  if (!win || win.closed) {
    alert('Popup was blocked. Please allow popups for this website.');
  }
}

/** `<img src>` for a Base64 profile picture, with the default avatar as fallback. */
export function pictureSrc(picture?: string | null): string {
  return picture ? `data:image/jpeg;base64,${picture}` : '/avatar.png';
}
