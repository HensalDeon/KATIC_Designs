import { revalidateTag } from "next/cache";

import { serverEnv } from "@/lib/env/server-env";
import { handleRevalidate } from "@/lib/revalidate/handler";

/**
 * On-demand revalidation webhook for the Laravel CMS (Phase 11). Laravel POSTs the cache tags of
 * what changed, signed with REVALIDATE_SECRET; see `src/lib/revalidate/signature.ts` for the
 * headers and docs/API_CONTRACT.md for the full contract. Only POST is exported, so any other
 * method gets 405.
 */
export async function POST(request: Request): Promise<Response> {
  return handleRevalidate(request, {
    secret: serverEnv().REVALIDATE_SECRET,
    revalidate: (tag, immediate) => {
      revalidateTag(tag, immediate ? { expire: 0 } : "max");
    },
  });
}
