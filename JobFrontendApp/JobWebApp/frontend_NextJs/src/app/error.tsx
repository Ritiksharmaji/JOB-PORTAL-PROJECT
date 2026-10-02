'use client';

/** Route error boundary: shown when a page throws while rendering. */
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-semibold text-bright-sun-400">Something went wrong.</h2>
      <button type="button" onClick={reset} className="rounded-md bg-bright-sun-400 px-4 py-2 text-sm font-semibold text-black">
        Try again
      </button>
    </div>
  );
}
