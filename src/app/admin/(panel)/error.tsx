"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Something went wrong</CardTitle>
        <CardDescription>
          {/* Server action failures surface here; the message itself is not
              safe to render, so only the digest is shown. */}
          The page could not be loaded.
          {error.digest && <> Reference {error.digest}.</>}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </CardContent>
    </Card>
  );
}
