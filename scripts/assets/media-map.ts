/**
 * Source-of-truth mapping from the original site's image keys (`window.KATIC_IMG` in
 * reference/original/katic-designs-final.html) to semantic asset ids in this project.
 *
 * - `id` is `<folder>/<kebab-name>` and becomes `src/assets/images/<id>.webp`.
 * - `description` says what the image *depicts*. It is the default alt text; content that uses an
 *   image in a specific context may override it.
 * - Several originals are reused across unrelated projects on the old site (KI-D05), so names
 *   describe the photo, never a project it was once labelled as.
 *
 * Run `pnpm assets:sync` after editing this file.
 */

export const MEDIA_FOLDERS = ["brand", "partners", "people", "plants", "photos", "video"] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

export type MediaMapEntry = {
  /** Key in the original `KATIC_IMG` map (file `reference/original/assets/img-<key>.webp`). */
  readonly key: string;
  readonly id: `${MediaFolder}/${string}`;
  readonly description: string;
};

export const MEDIA_MAP: readonly MediaMapEntry[] = [
  // Brand
  { key: "9c88894f7b", id: "brand/logo", description: "Katic Designs" },

  // Partner logos (home "About" marquee)
  { key: "f93435a3cb", id: "partners/hettich", description: "Hettich" },
  { key: "a40f911b6e", id: "partners/jaquar", description: "Jaquar" },
  { key: "1ca13ce586", id: "partners/asian-paints", description: "Asian Paints" },
  { key: "3e41c94783", id: "partners/kajaria", description: "Kajaria" },

  // People
  { key: "1d975d9f45", id: "people/founder", description: "Founder portrait in the studio" },
  { key: "a3e18e7517", id: "people/team-member-01", description: "Team member portrait" },
  { key: "1fea329563", id: "people/team-member-02", description: "Team member portrait" },
  { key: "53ddbeae35", id: "people/team-member-03", description: "Team member portrait" },
  { key: "3bb98cc013", id: "people/team-member-04", description: "Team member portrait" },
  { key: "11014e3f02", id: "people/client-story-01", description: "Client portrait" },
  { key: "cs_p2", id: "people/client-story-02", description: "Client portrait" },
  { key: "cs_p3", id: "people/client-story-03", description: "Client portrait" },
  { key: "cs_p4", id: "people/client-story-04", description: "Client portrait" },
  { key: "9e3a0ae4bf", id: "people/client-avatar-01", description: "Client portrait" },
  { key: "f0e113ce0b", id: "people/client-avatar-02", description: "Client portrait" },
  { key: "3075cc02c0", id: "people/client-avatar-03", description: "Client portrait" },
  { key: "b8b2804bc2", id: "people/client-avatar-04", description: "Client portrait" },
  { key: "f6b5f27cab", id: "people/client-avatar-05", description: "Client portrait" },
  { key: "883910d93f", id: "people/client-avatar-06", description: "Client portrait" },

  // Decorative plants (always rendered with empty alt; descriptions are for the asset index)
  { key: "68cd41927b", id: "plants/croton", description: "Croton plant" },
  { key: "pp_ageratum", id: "plants/ageratum", description: "Ageratum flowers" },
  {
    key: "pp_bopterra",
    id: "plants/bird-of-paradise-terracotta",
    description: "Bird-of-paradise plant in a terracotta pot",
  },
  {
    key: "50c8de3991",
    id: "plants/bird-of-paradise-white-pot",
    description: "Bird-of-paradise plant in a white pot",
  },
  {
    key: "pp_bopflower",
    id: "plants/bird-of-paradise-flower",
    description: "Bird-of-paradise flower",
  },
  { key: "pp_boxwood", id: "plants/boxwood", description: "Boxwood hedge" },
  { key: "pp_chair", id: "plants/potted-plant-on-chair", description: "Potted plant on a chair" },
  { key: "pp_coleus", id: "plants/coleus", description: "Coleus plant" },
  { key: "pp_heli", id: "plants/heliconia", description: "Hanging heliconia flower" },
  { key: "pp_schefflera", id: "plants/schefflera", description: "Schefflera in a pot" },
  { key: "pp_windowbox", id: "plants/window-box-flowers", description: "Window box of flowers" },
  { key: "7987ed3204", id: "plants/banana-leaf-plant", description: "Banana-leaf plant" },
  { key: "10513b5c57", id: "plants/fern", description: "Potted fern" },
  { key: "7d4aa783e5", id: "plants/hanging-pothos", description: "Hanging pothos" },
  {
    key: "cac0000001",
    id: "plants/cactus-group",
    description: "Group of potted cacti and succulents",
  },
  { key: "bou_tip", id: "plants/bougainvillea", description: "Hanging bougainvillea" },

  // Hero video posters
  { key: "poster_desktop", id: "video/hero-poster-desktop", description: "Modern villa at dusk" },
  {
    key: "poster_mobile",
    id: "video/hero-poster-mobile",
    description: "Timber staircase in a dim interior",
  },

  // Photography
  {
    key: "1029896879",
    id: "photos/courtyard-reflecting-pool",
    description: "Shaded courtyard with a long reflecting water channel and palms",
  },
  {
    key: "dd00000004",
    id: "photos/living-room-tropical-wallpaper",
    description: "Living room with tropical leaf wallpaper",
  },
  {
    key: "6a759310a5",
    id: "photos/city-view-living-room",
    description: "Modern living room with a curved sofa and floor-to-ceiling city views",
  },
  {
    key: "987e492e7a",
    id: "photos/brick-courtyard-house-dusk",
    description: "Brick courtyard house lit at dusk around a planted courtyard",
  },
  {
    key: "cd1407031f",
    id: "photos/brick-courtyard-house-dusk-panorama",
    description: "Brick courtyard house and lit garden at dusk",
  },
  {
    key: "197c9068a1",
    id: "photos/courtyard-living-skylight",
    description: "Living room around an open planted courtyard under a skylight",
  },
  {
    key: "c409203399",
    id: "photos/homeowners-walkthrough",
    description: "Two homeowners walking through a finished interior with timber shelving",
  },
  {
    key: "f902f81fdd",
    id: "photos/garden-path-modern-house",
    description: "Stone garden path leading to a white modern house",
  },
  {
    key: "10c3a14757",
    id: "photos/timber-screen-atrium",
    description: "Atrium with timber screens, a steel handrail and planting",
  },
  {
    key: "cea9d2b8ef",
    id: "photos/design-studio-3d-model",
    description: "Design workstation showing a 3D building model",
  },
  {
    key: "f1c16f4f12",
    id: "photos/site-review-timber-screen",
    description: "Architect and client reviewing drawings beside a timber lattice on site",
  },
  {
    key: "96147274e0",
    id: "photos/house-rain-garden",
    description: "Two-storey house with a rain garden and textured walls",
  },
  {
    key: "823b5c3dd2",
    id: "photos/glass-courtyard-garden",
    description: "Glazed courtyard garden at the centre of a house",
  },
  {
    key: "fe0aeb97f8",
    id: "photos/contemporary-villa-entrance",
    description: "Contemporary villa with stone cladding and a landscaped entrance path",
  },
  {
    key: "01aabb2353",
    id: "photos/commercial-facade-dusk",
    description: "Industrial-style commercial building lit at dusk",
  },
  {
    key: "ff597a7d41",
    id: "photos/white-bathroom-checker-floor",
    description: "White bathroom with a checkerboard floor and plants",
  },
  {
    key: "8a8fdf2483",
    id: "photos/white-bathroom-checker-floor-small",
    description: "White bathroom with a checkerboard floor and plants",
  },
  {
    key: "b669bc97c3",
    id: "photos/architectural-model-on-drawings",
    description: "Architectural model resting on drawings beside a window",
  },
  {
    key: "50278a947d",
    id: "photos/double-height-living-stair",
    description: "Double-height living room with an open stair",
  },
  {
    key: "1ffea5f189",
    id: "photos/riverside-house-night",
    description: "Riverside house glowing at night",
  },
  {
    key: "b787004451",
    id: "photos/villa-pool-mountains",
    description: "Villa exterior with a private pool and mountain views",
  },
  {
    key: "a16247ad87",
    id: "photos/open-pavilion-lounge-night",
    description: "Open timber pavilion lounge at night",
  },
  {
    key: "9c495f3ea4",
    id: "photos/lakeside-pavilion-dusk",
    description: "Low pavilion house reflected in water at dusk",
  },
  {
    key: "392c9415ec",
    id: "photos/formal-dining-room",
    description: "Formal dining room with a chandelier",
  },
  {
    key: "dd00000005",
    id: "photos/timber-entrance-door",
    description: "Dark timber entrance door with a potted plant",
  },
  {
    key: "df57ba68fe",
    id: "photos/brick-house-arched-windows-night",
    description: "Brick house with arched windows lit at night",
  },
  {
    key: "5aadd606b7",
    id: "photos/architect-site-drawings",
    description: "Architect reviewing drawings on a forested site",
  },
  {
    key: "537da62309",
    id: "photos/house-timber-screen-porch",
    description: "House with a timber screen entrance porch",
  },
  {
    key: "61b5cef4ba",
    id: "photos/architect-sketching-plans",
    description: "Architect sketching plans beside a model",
  },
  {
    key: "34b5952fa7",
    id: "photos/minimal-interior-yellow-armchair",
    description: "Minimal interior with a yellow armchair",
  },
  {
    key: "dd00000003",
    id: "photos/ornate-bedroom-suite",
    description: "Bedroom suite with a lattice ceiling and columns",
  },
  {
    key: "85a9c3398a",
    id: "photos/pavilion-fins-facade",
    description: "Pavilion building with vertical fins and a garden",
  },
  {
    key: "bc369010e0",
    id: "photos/laterite-wall-timber-door",
    description: "Laterite stone wall beside a timber door",
  },
  {
    key: "03553b5ed8",
    id: "photos/bedroom-teak-screen",
    description: "Bedroom with a teak screen and wardrobe",
  },
  {
    key: "1a2f69cee0",
    id: "photos/two-storey-house-lawn",
    description: "Two-storey house with deep overhangs above a lawn",
  },
  {
    key: "86a8b11cf8",
    id: "photos/bright-living-room",
    description: "Bright living room with a grey sofa",
  },
  {
    key: "67ca9cb4fe",
    id: "photos/office-reception",
    description: "Office reception with timber panelling",
  },
  {
    key: "8d5ca34a10",
    id: "photos/kerala-house-pond",
    description: "Traditional Kerala house with tiled roofs around a pond",
  },
  {
    key: "8172bce988",
    id: "photos/brick-jali-facade",
    description: "Brick jali facade above garden steps",
  },
  {
    key: "131598c44a",
    id: "photos/granite-kitchen",
    description: "Kitchen with granite worktops and white cabinets",
  },
  {
    key: "2dfb41f894",
    id: "photos/apartment-tower",
    description: "Mid-rise apartment tower with planted balconies",
  },
  {
    key: "e8a04ff192",
    id: "photos/brick-garden-walkway",
    description: "Brick-walled garden walkway",
  },
  {
    key: "8a2d35ec44",
    id: "photos/narrow-urban-house-dusk",
    description: "Narrow urban house lit at dusk",
  },
  {
    key: "94825e8aa6",
    id: "photos/courtyard-facade-night",
    description: "Courtyard facade lit at night",
  },
  {
    key: "596a914967",
    id: "photos/massing-model",
    description: "White massing model on a dark background",
  },
  {
    key: "335d18a20f",
    id: "photos/living-room-tv-wall",
    description: "Living room with a timber TV wall",
  },
  {
    key: "0b700c1719",
    id: "photos/arched-courtyard-terrace",
    description: "Courtyard terrace with arches and patterned tiles",
  },
  {
    key: "2aa9c85f4e",
    id: "photos/heritage-studio-interior",
    description: "Studio inside a heritage building with a timber roof",
  },
  {
    key: "4aac3e510a",
    id: "photos/coastal-terrace-house",
    description: "Low house with a landscaped terrace by the sea",
  },
  {
    key: "32404913f1",
    id: "photos/hillside-house-greenery",
    description: "House set into a green hillside",
  },
  {
    key: "dd00000001",
    id: "photos/white-hallway-stair",
    description: "White hallway with a timber stair",
  },
  {
    key: "22c6045680",
    id: "photos/hillside-villa-sunset",
    description: "Villa on a hillside with palm trees at sunset",
  },
  {
    key: "465ad48711",
    id: "photos/construction-team-drawings",
    description: "Construction team reviewing drawings on site",
  },
  {
    key: "b61d53c882",
    id: "photos/family-lounge-garden-view",
    description: "Family lounge opening to a shaded garden",
  },
  {
    key: "20cfdabf34",
    id: "photos/sea-view-living-room",
    description: "Living room with sea views",
  },
  {
    key: "5ae2cb8637",
    id: "photos/modern-house-rain-dusk",
    description: "Modern house on a rain-soaked evening",
  },
  {
    key: "67fde5f298",
    id: "photos/apartment-living-sea-view",
    description: "Apartment living room with sea views",
  },
  {
    key: "934be61600",
    id: "photos/timber-lounge-chair",
    description: "Timber lounge chair by a curtained window",
  },
  {
    key: "445f233e70",
    id: "photos/sofa-jali-detail",
    description: "Sofa with cushions in front of a jali screen",
  },
  {
    key: "bae1754840",
    id: "photos/canal-house-sunset",
    description: "House beside a canal at sunset",
  },
  {
    key: "113b954da6",
    id: "photos/teak-stair-handrail",
    description: "Teak stair handrail detail",
  },
  {
    key: "34fbd87695",
    id: "photos/kitchen-island-teak",
    description: "Kitchen island with teak and stone",
  },
  { key: "ac79e79288", id: "photos/pond-house-dusk", description: "House beside a pond at dusk" },
  {
    key: "9f6d8d2f6c",
    id: "photos/courtyard-tree-timber-balconies",
    description: "Planted courtyard with a tree and timber balconies",
  },
  {
    key: "f87d8c74d7",
    id: "photos/desert-villa-sunset",
    description: "Desert villa with an infinity pool at sunset",
  },
  {
    key: "dd00000002",
    id: "photos/kitchen-joinery",
    description: "Kitchen with timber joinery and stone floors",
  },
  {
    key: "9d73962e97",
    id: "photos/villa-pool-city-skyline",
    description: "Villa with a pool and a city skyline at dusk",
  },
  {
    key: "54f1a3ee2e",
    id: "photos/house-reflecting-pool-garden",
    description: "House with a long reflecting pool through the garden",
  },
  {
    key: "fa4b13923b",
    id: "photos/lime-plaster-stair-detail",
    description: "Lime plaster stair detail",
  },
  {
    key: "1c963cd473",
    id: "photos/timber-gate-brick-wall",
    description: "Timber gate in a brick wall",
  },
  {
    key: "fd6e5156e5",
    id: "photos/living-room-garden-doors",
    description: "Living room opening to a garden through glass doors",
  },
  {
    key: "05d43ba02d",
    id: "photos/glass-office-tower",
    description: "Glass office building with vertical fins",
  },
  {
    key: "181d7cb449",
    id: "photos/timber-house-night",
    description: "Timber house lit at night after rain",
  },
  {
    key: "a77a8c7e94",
    id: "photos/games-room-billiards",
    description: "Games room with a billiards table",
  },
  {
    key: "88dbc326d3",
    id: "photos/brick-veranda-garden",
    description: "Brick veranda overlooking a tropical garden",
  },
  {
    key: "c5fba6976f",
    id: "photos/courtyard-house-reflection-dusk",
    description: "Two-storey house reflected in a pool at dusk",
  },
  {
    key: "316380ce3f",
    id: "photos/brick-house-garden-path",
    description: "Brick house behind a garden path",
  },
  {
    key: "129d81a52a",
    id: "photos/house-under-construction",
    description: "House under construction in a forest clearing",
  },
  {
    key: "aff52b8951",
    id: "photos/urban-street-houses",
    description: "Street of urban houses after rain",
  },
  {
    key: "dae4b0339e",
    id: "photos/studio-workspace",
    description: "Design studio workspace with long timber desks",
  },
  {
    key: "1cf5d313d4",
    id: "photos/backwaters-aerial",
    description: "Aerial view of backwaters at sunrise",
  },
  {
    key: "4a57a91a8f",
    id: "photos/villa-pool-skyline-dusk",
    description: "Modern villa and pool with a city skyline at dusk",
  },
  {
    key: "780b890e52",
    id: "photos/spiral-stair-courtyard",
    description: "Spiral stair beside a planted courtyard",
  },
  {
    key: "0fcc63092f",
    id: "photos/pavilion-house-night",
    description: "Glass pavilion house glowing at night",
  },
  {
    key: "4a45368b5a",
    id: "photos/lakeside-house-dusk",
    description: "Lakeside house lit at dusk",
  },
  {
    key: "72dc2b2afd",
    id: "photos/dark-lounge-interior",
    description: "Dark lounge interior with artwork",
  },
  {
    key: "04fda5757e",
    id: "photos/house-reflecting-pool",
    description: "House behind a reflecting pool",
  },
  {
    key: "67932608a0",
    id: "photos/bathroom-kota-stone",
    description: "Bathroom with Kota stone and a courtyard view",
  },
  {
    key: "df701a74eb",
    id: "photos/brick-courtyard-garden",
    description: "Brick courtyard with planting and a pool",
  },
  {
    key: "0e599c0712",
    id: "photos/garden-veranda-chairs",
    description: "Garden veranda with cane chairs",
  },
  {
    key: "3f54968ce6",
    id: "photos/veranda-living-pool-view",
    description: "Veranda living area overlooking a pool",
  },
  {
    key: "1cd19eb609",
    id: "photos/veranda-night-forest",
    description: "Veranda at night facing a forest",
  },
  {
    key: "rv_cta",
    id: "photos/garden-room-window-seat",
    description: "Garden room with tall timber windows and a built-in seat",
  },
];

/** Original assets that no rendered page uses. They are deliberately not imported. */
export const UNUSED_SOURCE_KEYS: readonly string[] = [
  "pp_ginger",
  "pp_bopwhite",
  "pp_monsmall",
  "857568d626",
  "3b776f71bc",
];

/** Hero background videos (base64 `<script type="text/plain">` blobs in the original). */
export const VIDEO_MAP = [
  { source: "kv-desktop.mp4", target: "hero-desktop.mp4" },
  { source: "kv-mobile.mp4", target: "hero-mobile.mp4" },
] as const;
