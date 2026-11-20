import { afterEach, describe, expect, it, vi } from "vitest";

/** Re-import `env` with a fresh module cache so env changes take effect. */
async function loadEnv() {
  vi.resetModules();
  const mod = await import("./env");
  return mod.env;
}

describe("env", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses NEXT_PUBLIC_SITE_URL when set", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.dev");
    await expect(loadEnv()).resolves.toEqual({ NEXT_PUBLIC_SITE_URL: "https://example.dev" });
  });

  it("falls back to the Vercel production domain", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "my-site.vercel.app");
    const env = await loadEnv();
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("https://my-site.vercel.app");
  });

  it("falls back to localhost when nothing is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    const env = await loadEnv();
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
  });

  it.each(["javascript:alert(1)", "ftp://example.com", "not a url", "https://intranet"])(
    "rejects unsafe or malformed URL %s",
    async (value) => {
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", value);
      await expect(loadEnv()).rejects.toThrow(/Invalid environment variables/);
    },
  );
});
