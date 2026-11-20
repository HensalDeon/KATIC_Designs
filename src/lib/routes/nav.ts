import type { NavKey } from "@/lib/schemas/navigation";

/** Header item highlighted for a pathname (original `ACTIVE` map; /news highlights nothing). */
export function activeNavKey(pathname: string): NavKey | undefined {
  const section = pathname.split("/")[1] ?? "";
  switch (section) {
    case "":
      return "home";
    case "about":
      return "about";
    case "services":
      return "services";
    case "works":
      return "projects";
    case "divisions":
      return "divisions";
    case "blog":
      return "blogs";
    case "locations":
      return "location";
    case "reviews":
      return "reviews";
    default:
      return undefined;
  }
}
