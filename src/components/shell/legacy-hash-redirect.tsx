"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { resolveLegacyHash } from "@/lib/routes/legacy";

/**
 * Sends visitors arriving with an old hash URL (e.g. `/#architecture`, `/#article/<slug>`) to the
 * matching page. Only `/` hosted the original single-page site, so only `/` is checked.
 */
export function LegacyHashRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname !== "/") return;
    const redirect = () => {
      const target = resolveLegacyHash(window.location.hash);
      if (target) router.replace(target);
    };
    redirect();
    window.addEventListener("hashchange", redirect);
    return () => window.removeEventListener("hashchange", redirect);
  }, [pathname, router]);

  return null;
}
