import { describe, expect, it, vi } from "vitest";

import { media } from "@/content/media";

import type { ContentRepository } from "../repository";
import { StaticRepository } from "../static-repository";
import {
  ENDPOINT_NAMES,
  type EndpointArgs,
  type EndpointName,
  endpointPath,
  ENDPOINTS,
  endpointTags,
  exampleArgs,
  invokeEndpoint,
  matchEndpoint,
} from "./endpoints";
import { LaravelSchemaError } from "./http";
import { LaravelRepository } from "./laravel-repository";

vi.mock("next/cache", () => ({ cacheTag: vi.fn() }));

const BASE = "https://cms.test/api/v1";
const statics = new StaticRepository({ validate: false });

/**
 * What the static repository returns for an endpoint (the mock's behaviour). Vitest imports images
 * as bare URLs without sizes, so the media library is synthesised from the ids.
 */
function readStatic(name: EndpointName, args: EndpointArgs): Promise<unknown> {
  if (name === "getMediaLibrary") {
    return Promise.resolve(
      Object.keys(media).map((id) => ({
        id,
        url: `https://cms.test/m/${id}`,
        width: 4,
        height: 3,
      })),
    );
  }
  return invokeEndpoint(statics, name, args);
}

/** A Laravel stand-in serving the static content as JSON; `edit` rewrites a response. */
function laravel(edit: (path: string, data: unknown) => unknown = (_, data) => data) {
  const requests: string[] = [];
  const fetchImpl = vi.fn(async (input: string | URL | Request) => {
    const url = new URL(input instanceof Request ? input.url : input.toString());
    const path = url.pathname.slice(new URL(BASE).pathname.length);
    requests.push(`${path}${url.search}`);
    const match = matchEndpoint(path, url.searchParams);
    const data = match ? await readStatic(match.name, match.args) : undefined;
    if (data === undefined) return Response.json({ message: "Not found." }, { status: 404 });
    return Response.json({ data: edit(path, JSON.parse(JSON.stringify(data))) });
  });
  const repository = new LaravelRepository({
    baseUrl: BASE,
    token: "t",
    timeoutMs: 1000,
    fetchImpl,
  });
  return { repository, requests };
}

describe("endpoint table", () => {
  it("routes every path it builds back to the same endpoint", () => {
    for (const name of ENDPOINT_NAMES) {
      const args = exampleArgs(name);
      const url = new URL(`http://x${endpointPath(ENDPOINTS[name], args)}`);
      expect(matchEndpoint(url.pathname, url.searchParams), name).toEqual({ name, args });
    }
    expect(matchEndpoint("/projects", new URLSearchParams("category=villas"))).toEqual({
      name: "listProjects",
      args: { category: "villas" },
    });
    expect(matchEndpoint("/nope", new URLSearchParams())).toBeUndefined();
  });

  it("tags reads like the accessors", () => {
    expect(endpointTags(ENDPOINTS.getServicePage, { slug: "interior" })).toEqual([
      "content",
      "services",
      "service:interior",
    ]);
  });
});

describe("LaravelRepository", () => {
  it("returns exactly what the static repository returns, for every resource", async () => {
    const { repository } = laravel();
    for (const name of ENDPOINT_NAMES) {
      const args = exampleArgs(name);
      const expected = JSON.parse(JSON.stringify(await readStatic(name, args))) as unknown;
      expect(await invokeEndpoint(repository, name, args), name).toEqual(expected);
    }
  });

  it("forwards filters as query parameters", async () => {
    const { repository, requests } = laravel();
    const posts = await repository.listPosts({ category: "architecture" });
    expect(requests).toEqual(["/posts?category=architecture"]);
    expect(posts.length).toBeGreaterThan(0);
    expect(posts.length).toBeLessThan((await statics.listPosts()).length);
  });

  it("resolves an unknown slug to undefined", async () => {
    const { repository } = laravel();
    await expect(repository.getServicePage("no-such-service")).resolves.toBeUndefined();
  });

  it("inlines CMS uploads from the media library as remote images", async () => {
    const upload = { id: "uploads/new-hero", url: "https://cms.test/storage/9/hero.webp" };
    const { repository, requests } = laravel((path, data) => {
      if (path === "/services/interior") {
        const page = data as { hero: { image: { src: string } } };
        page.hero.image.src = upload.id;
      }
      if (path === "/media") {
        return [...(data as object[]), { ...upload, width: 1600, height: 900 }];
      }
      return data;
    });
    const page = await repository.getServicePage("interior");
    expect(page?.hero.image.src).toEqual({ src: upload.url, width: 1600, height: 900 });
    expect(requests).toEqual(["/services/interior", "/media"]);
  });

  it("rejects responses that break the schema with the failing path", async () => {
    const { repository } = laravel((path, data) =>
      path === "/settings" ? { ...(data as object), email: 42 } : data,
    );
    const error = await repository.getSite().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(LaravelSchemaError);
    expect((error as LaravelSchemaError).issues.join()).toMatch(/data\.email/);
  });

  it("keeps an unknown media id that the library lacks a schema error", async () => {
    const { repository } = laravel((path, data) => {
      if (path !== "/services/interior") return data;
      const page = data as { hero: { image: { src: string } } };
      page.hero.image.src = "uploads/missing";
      return page;
    });
    await expect(repository.getServicePage("interior")).rejects.toBeInstanceOf(LaravelSchemaError);
  });

  it("implements the whole repository interface", () => {
    const methods: (keyof ContentRepository)[] = ENDPOINT_NAMES;
    const { repository } = laravel();
    for (const method of methods) expect(typeof repository[method], method).toBe("function");
  });
});
