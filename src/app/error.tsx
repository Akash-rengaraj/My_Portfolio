"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: unknown;
  retry: () => void;
}

/**
 * Route-level error boundary. Shows a generic message only — never render
 * `error.message` to users; in production server errors expose just a digest.
 */
export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest =
    error instanceof Error && "digest" in error && typeof error.digest === "string"
      ? error.digest
      : null;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="text-muted-foreground">An unexpected error occurred. Please try again.</p>
      {digest ? <p className="font-mono text-xs text-muted-foreground">Ref: {digest}</p> : null}
      <Button onClick={retry}>Try again</Button>
    </main>
  );
}
