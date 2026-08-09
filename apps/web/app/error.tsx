'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="container">
      <section className="hero">
        <h1>Something broke</h1>
        <p className="lede">
          The page failed to render. This is client-visible on purpose — the
          spec forbids hiding failures behind fake states.
        </p>
        {error.digest ? (
          <p>
            Reference: <code>{error.digest}</code>
          </p>
        ) : null}
        <div className="cta-row">
          <button className="btn btn-primary" type="button" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="btn">
            Home
          </Link>
        </div>
      </section>
    </main>
  );
}
