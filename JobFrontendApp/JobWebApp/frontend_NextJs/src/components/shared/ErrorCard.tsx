import Link from 'next/link';

/** Server component used by the 404 and 403 pages. */
export default function ErrorCard({ code, title, message }: { code: string; title: string; message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-mine-shaft-950">
      <div className="max-w-md rounded-lg bg-mine-shaft-900 p-8 text-center shadow-md">
        <h1 className="mb-4 text-5xl font-bold text-red-500">{code}</h1>
        <h2 className="mb-4 text-2xl font-semibold text-bright-sun-400">{title}</h2>
        <p className="mb-6 text-bright-sun-400">{message}</p>
        <Link href="/" className="inline-block rounded-md bg-bright-sun-400 px-4 py-2 text-sm font-semibold text-black hover:bg-bright-sun-500">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
