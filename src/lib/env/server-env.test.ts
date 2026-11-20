import { describe, expect, it } from "vitest";

import { mediaRemotePattern, parseServerEnv, ServerEnvError } from "./server-env";

const LARAVEL = {
  DATA_SOURCE: "laravel",
  LARAVEL_API_URL: "https://cms.example.com/api/v1",
  LARAVEL_API_TOKEN: "token",
  REVALIDATE_SECRET: "0123456789abcdef",
};

describe("parseServerEnv", () => {
  it("defaults to static content and treats blank values as unset", () => {
    const env = parseServerEnv({ DATA_SOURCE: "", LARAVEL_API_URL: " ", LEADS_ENDPOINT: "" });
    expect(env.DATA_SOURCE).toBe("static");
    expect(env.LARAVEL_API_URL).toBeUndefined();
    expect(env.LARAVEL_API_TIMEOUT_MS).toBe(8000);
  });

  it("accepts a complete laravel configuration", () => {
    const env = parseServerEnv({ ...LARAVEL, LARAVEL_API_TIMEOUT_MS: "2500" });
    expect(env).toMatchObject({ DATA_SOURCE: "laravel", LARAVEL_API_TIMEOUT_MS: 2500 });
  });

  it("lists every missing variable when DATA_SOURCE=laravel", () => {
    const parse = () => parseServerEnv({ DATA_SOURCE: "laravel" });
    expect(parse).toThrow(ServerEnvError);
    expect(parse).toThrow(
      /LARAVEL_API_URL: is required[\s\S]*LARAVEL_API_TOKEN[\s\S]*REVALIDATE_SECRET/,
    );
  });

  it("rejects unknown sources, bad URLs and short secrets", () => {
    expect(() => parseServerEnv({ DATA_SOURCE: "mysql" })).toThrow(/DATA_SOURCE/);
    expect(() => parseServerEnv({ ...LARAVEL, LARAVEL_API_URL: "ftp://x" })).toThrow(
      /LARAVEL_API_URL/,
    );
    expect(() => parseServerEnv({ ...LARAVEL, REVALIDATE_SECRET: "short" })).toThrow(/at least 16/);
  });
});

describe("mediaRemotePattern", () => {
  it("is the API origin by default and the media URL prefix when set", () => {
    expect(mediaRemotePattern(parseServerEnv(LARAVEL))).toEqual({
      pattern: { protocol: "https", hostname: "cms.example.com", port: "", pathname: "/**" },
      loopback: false,
    });
    const cdn = parseServerEnv({ ...LARAVEL, LARAVEL_MEDIA_URL: "https://cdn.example.com/media/" });
    expect(mediaRemotePattern(cdn)?.pattern).toMatchObject({
      hostname: "cdn.example.com",
      pathname: "/media/**",
    });
  });

  it("flags the local mock and is absent in static mode", () => {
    const mock = parseServerEnv({ ...LARAVEL, LARAVEL_API_URL: "http://127.0.0.1:3651/api/v1" });
    expect(mediaRemotePattern(mock)).toMatchObject({
      pattern: { protocol: "http", port: "3651" },
      loopback: true,
    });
    expect(mediaRemotePattern(parseServerEnv({}))).toBeUndefined();
  });
});
