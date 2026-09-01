import { beforeEach, describe, expect, it } from "vitest";

import { signSession, verifySession, type SessionPayload } from "@/lib/session";

const payload: SessionPayload = {
  sub: "11111111-2222-3333-4444-555555555555",
  email: "studio@addedforms.com",
  name: "Studio",
  role: "admin",
};

beforeEach(() => {
  process.env.AUTH_SECRET = "a-secret-long-enough-for-the-guard";
});

describe("session tokens", () => {
  it("round-trips a payload", async () => {
    const token = await signSession(payload);
    await expect(verifySession(token)).resolves.toEqual(payload);
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signSession(payload);
    process.env.AUTH_SECRET = "an-entirely-different-secret-value";
    await expect(verifySession(token)).resolves.toBeNull();
  });

  it("rejects a token whose payload was edited after signing", async () => {
    // An editor rewriting their own cookie to claim admin is the attack this
    // has to stop.
    const token = await signSession({ ...payload, role: "editor" });
    const [header, body, signature] = token.split(".");
    const claims = JSON.parse(Buffer.from(body, "base64url").toString());

    const forged = Buffer.from(JSON.stringify({ ...claims, role: "admin" })).toString("base64url");
    expect(forged).not.toBe(body);

    await expect(verifySession(`${header}.${forged}.${signature}`)).resolves.toBeNull();
  });

  it("rejects junk", async () => {
    for (const token of ["", "not-a-jwt", "a.b.c"]) {
      await expect(verifySession(token)).resolves.toBeNull();
    }
  });

  it("never returns a role it was not given", async () => {
    // Anything other than "admin" has to land on "editor" — a token claiming
    // some other role must not be trusted into the admin-only actions.
    const token = await signSession({ ...payload, role: "superuser" as never });
    await expect(verifySession(token)).resolves.toMatchObject({ role: "editor" });
  });

  it("refuses to sign when the secret is missing or too short", async () => {
    process.env.AUTH_SECRET = "short";
    await expect(signSession(payload)).rejects.toThrow(/AUTH_SECRET/);

    delete process.env.AUTH_SECRET;
    await expect(signSession(payload)).rejects.toThrow(/AUTH_SECRET/);
  });
});
