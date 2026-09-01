"use client";

/**
 * Last line of defence: this replaces the root layout, so it has to bring its
 * own <html> and <body> and cannot rely on the app's stylesheet.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "#ffffff",
          color: "#262626",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: "0.06em" }}>
          SOMETHING BROKE
        </h1>
        <p style={{ margin: 0, maxWidth: "38ch", lineHeight: 1.8, opacity: 0.7 }}>
          The site failed to start. Reloading usually clears it.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            border: "none",
            background: "#daff2b",
            color: "#262626",
            padding: "10px 18px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        {error.digest && (
          <p style={{ margin: 0, fontSize: 10, opacity: 0.4 }}>Reference {error.digest}</p>
        )}
      </body>
    </html>
  );
}
