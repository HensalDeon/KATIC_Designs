import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import type { SectorTile } from "@/content/sectors";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

import { canvasSizes, resolveImage } from "./section-media";

type SectorGridProps = {
  /** Tiles that link to their works filter (`category`). */
  readonly sectors: readonly SectorTile[];
  /** Extra tile appended after the sectors; it is a link only if it has a `category`. */
  readonly extra?: SectorTile;
  readonly className?: string;
};

/** The canvas is 1268px wide with 18px gaps; used for `sizes`. */
const GRID_WIDTH = 1268;
const GAP = 18;

/**
 * Sector tiles (`.ksec`): 400px image tiles with a bottom gradient and a label (orange `small`,
 * 26px title, grey line). Linked tiles open the works list filtered by sector and scale their image
 * to 1.05 on hover. One row on the canvas (4 or 5 columns), two columns below 1100px, one on phones.
 * Renders inside `ContentSection` (`.kbody`).
 */
export function SectorGrid({ sectors, extra, className }: SectorGridProps) {
  const tiles = extra ? [...sectors, extra] : sectors;
  const columns = tiles.length;
  const tileWidth = (GRID_WIDTH - GAP * (columns - 1)) / columns;

  return (
    <ul
      style={{ "--cols": columns } as CSSProperties}
      className={cn(
        "grid grid-cols-[repeat(var(--cols),minmax(0,1fr))] gap-18 max-lg:grid-cols-2 max-md:grid-cols-1",
        className,
      )}
    >
      {tiles.map((tile) => (
        <li key={tile.title}>
          <Tile tile={tile} sizes={canvasSizes(tileWidth, "50vw")} />
        </li>
      ))}
    </ul>
  );
}

function Tile({ tile, sizes }: { tile: SectorTile; sizes: string }) {
  const body = (
    <>
      <Image
        src={resolveImage(tile.image)}
        alt={tile.alt}
        sizes={sizes}
        className="size-full object-cover transition-transform duration-800 group-hover:scale-[1.05]"
      />
      <span className="absolute inset-x-22 bottom-22 z-2 font-sans">
        <small className="text-[9px] font-semibold tracking-[0.2em] text-brand max-md:text-[11px]">
          {tile.label}
        </small>
        <b className="mt-6 block text-[26px] font-normal">{tile.title}</b>
        <span className="mt-8 block text-[12px] leading-[1.6] text-[#ddd]">{tile.text}</span>
      </span>
    </>
  );
  const tileClass =
    "relative block h-400 overflow-hidden text-white after:absolute after:inset-0 after:bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_40%,rgba(0,0,0,0.75))] after:content-['']";

  return tile.category ? (
    <Link href={routes.worksCategory(tile.category)} className={cn("group", tileClass)}>
      {body}
    </Link>
  ) : (
    <div className={tileClass}>{body}</div>
  );
}
