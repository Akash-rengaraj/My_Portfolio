"use client";

import { useEffect } from "react";

interface GlobalErrorProps {
  error: unknown;
  retry: () => void;
}

/**
 * Last-resort boundary for errors in the root layout. Renders its own document
 * and does not load global styles, so the markup is kept minimal.
 */
export default function GlobalError({ error, retry }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <title>Something went wrong</title>
        <main>
          <h1>Something went wrong</h1>
          <p>An unexpected error occurred. Please try again.</p>
          <button type="button" onClick={retry}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
