/**
 * The UI Components Shop's stock. Most items are one file in `./items/`
 * named after the slug; games list their files explicitly. The shop page
 * reads those files at build time, so the code people copy is exactly the
 * code running in the preview. To stock a new piece: add the file, list it
 * here and map it in `previews.ts`.
 */

export const SHOP_CATEGORIES = [
  "sections",
  "heroes",
  "buttons",
  "cards",
  "inputs",
  "navigation",
  "overlays",
  "feedback",
  "data",
  "games",
] as const;

export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

export interface ShopItem {
  slug: string;
  name: string;
  blurb: string;
  category: ShopCategory;
  tags: readonly string[];
  /** Source files, relative to `src/`; defaults to `components/shop/items/<slug>.tsx`. */
  files?: readonly string[];
  /** Takes a whole row on the shelf: page sections, heroes and games. */
  wide?: boolean;
  /** Starts on a click, so heavy animations don't all run at once. */
  heavy?: boolean;
}

/** Files shared by every game: best-score storage, in-view pausing, reduced motion, confetti. */
const GAME_SHARED = [
  "components/play/use-best-score.ts",
  "components/works/use-in-view.ts",
  "components/works/use-reduced-motion.ts",
  "components/world/confetti.tsx",
] as const;

export const SHOP_ITEMS = [
  // ── Page sections: enough to put a whole site together ──
  {
    slug: "navbar",
    name: "Navbar",
    blurb: "Logo, links and a call to action; folds into a menu on small screens.",
    category: "sections",
    tags: ["responsive", "a11y"],
    wide: true,
  },
  {
    slug: "hero-split",
    name: "Product Hero",
    blurb: "Headline, two calls to action, social proof and a product mock-up.",
    category: "sections",
    tags: ["landing", "responsive"],
    wide: true,
  },
  {
    slug: "logo-cloud",
    name: "Logo Cloud",
    blurb: 'A "trusted by" strip that glides forever and pauses on hover.',
    category: "sections",
    tags: ["marquee", "social proof"],
    wide: true,
  },
  {
    slug: "feature-grid",
    name: "Feature Grid",
    blurb: "Six icon cards that explain what you do, in one to three columns.",
    category: "sections",
    tags: ["landing", "grid"],
    wide: true,
  },
  {
    slug: "stats-band",
    name: "Stats Band",
    blurb: "Key numbers that count up when they scroll into view.",
    category: "sections",
    tags: ["count-up", "motion"],
    wide: true,
  },
  {
    slug: "pricing-table",
    name: "Pricing Table",
    blurb: "Three plans with a monthly / yearly switch and a highlighted favourite.",
    category: "sections",
    tags: ["saas", "switch"],
    wide: true,
  },
  {
    slug: "testimonial-marquee",
    name: "Testimonial Wall",
    blurb: "Two rows of quotes drifting in opposite directions.",
    category: "sections",
    tags: ["marquee", "social proof"],
    wide: true,
  },
  {
    slug: "team-grid",
    name: "Team Grid",
    blurb: 'Meet-the-team cards with avatars and a hover "say hi".',
    category: "sections",
    tags: ["about", "grid"],
    wide: true,
  },
  {
    slug: "blog-cards",
    name: "Blog Cards",
    blurb: "Latest posts with cover, tag, date and reading time.",
    category: "sections",
    tags: ["content", "grid"],
    wide: true,
  },
  {
    slug: "faq-accordion",
    name: "FAQ Accordion",
    blurb: "One answer open at a time, smooth height animation, proper ARIA.",
    category: "sections",
    tags: ["a11y", "accordion"],
  },
  {
    slug: "contact-form",
    name: "Contact Form",
    blurb: "Inline validation, accessible errors, sending and success states.",
    category: "sections",
    tags: ["form", "validation"],
  },
  {
    slug: "cta-banner",
    name: "CTA Banner",
    blurb: "A gradient sign-up band with email validation and a thank-you state.",
    category: "sections",
    tags: ["newsletter", "form"],
    wide: true,
  },
  {
    slug: "footer-columns",
    name: "Site Footer",
    blurb: "Brand blurb, link columns, social icons and a bottom bar.",
    category: "sections",
    tags: ["layout", "responsive"],
    wide: true,
  },
  {
    slug: "not-found-section",
    name: "404 Page",
    blurb: "A friendly not-found page whose big 404 drifts from the pointer.",
    category: "sections",
    tags: ["error", "pointer"],
    wide: true,
  },

  // ── Heroes: the opening ideas, ready to use ──
  {
    slug: "lights-out-hero",
    name: "Lights Out Hero",
    blurb: "A dark room explored with a torch; flip the switch to light it all.",
    category: "heroes",
    tags: ["pointer", "story"],
    wide: true,
    heavy: true,
  },
  {
    slug: "unlock-hero",
    name: "Unlock Me Hero",
    blurb: "A phone lock screen with live notifications; swipe up for the apps.",
    category: "heroes",
    tags: ["mobile", "story"],
    wide: true,
    heavy: true,
  },
  {
    slug: "one-line-hero",
    name: "One Line Hero",
    blurb: "A guitar string that twangs and redraws itself into your life.",
    category: "heroes",
    tags: ["svg morph", "web audio"],
    wide: true,
    heavy: true,
  },
  {
    slug: "living-sand-hero",
    name: "Living Sand Hero",
    blurb: "Your name made of 1,800 grains that scatter and re-form.",
    category: "heroes",
    tags: ["canvas", "particles"],
    wide: true,
    heavy: true,
  },
  {
    slug: "day-cycle-hero",
    name: "A Day With Me Hero",
    blurb: "Drag the sun across a painted landscape from dawn to midnight.",
    category: "heroes",
    tags: ["svg", "drag"],
    wide: true,
    heavy: true,
  },
  {
    slug: "rabbit-hole-hero",
    name: "Rabbit Hole Hero",
    blurb: "An endless zoom through scenes hidden inside each other.",
    category: "heroes",
    tags: ["infinite zoom", "svg"],
    wide: true,
    heavy: true,
  },

  // ── Buttons ──
  {
    slug: "magnetic-button",
    name: "Magnetic Button",
    blurb: "Leans toward the pointer and springs back when it leaves.",
    category: "buttons",
    tags: ["pointer", "motion"],
  },
  {
    slug: "loading-button",
    name: "Loading Button",
    blurb: "Shows a spinner, then a check or a retry — without changing width.",
    category: "buttons",
    tags: ["async", "feedback"],
  },
  {
    slug: "like-button",
    name: "Like Button",
    blurb: "A heart that pops and throws sparks, with a live count.",
    category: "buttons",
    tags: ["micro-interaction", "toggle"],
  },
  {
    slug: "shimmer-button",
    name: "Shimmer Button",
    blurb: "A glowing gradient-border CTA with a sweep of light on hover.",
    category: "buttons",
    tags: ["cta", "pure css"],
  },
  {
    slug: "stamp-card",
    name: "Rubber Stamp",
    blurb: "Slams an approval stamp onto a paper slip, with a little overshoot.",
    category: "buttons",
    tags: ["feedback", "playful"],
  },

  // ── Cards ──
  {
    slug: "spotlight-card",
    name: "Spotlight Card",
    blurb: "The border and surface light up around the pointer like a torch.",
    category: "cards",
    tags: ["pointer", "glow"],
  },
  {
    slug: "tilt-card",
    name: "Tilt Card",
    blurb: "Tilts in 3D toward the pointer with a glare sliding across it.",
    category: "cards",
    tags: ["3d", "pointer"],
  },
  {
    slug: "ticket-stub",
    name: "Ticket Stub",
    blurb: "An event ticket with notched corners and a stub you can tear off.",
    category: "cards",
    tags: ["css mask", "playful"],
  },
  {
    slug: "sticky-note",
    name: "Sticky Note",
    blurb: "A taped-up note you can write on and recolour.",
    category: "cards",
    tags: ["editable", "handwritten"],
  },
  {
    slug: "skeleton-card",
    name: "Skeleton Card",
    blurb: "A loading placeholder shaped like the real card, so nothing jumps.",
    category: "cards",
    tags: ["loading", "ux"],
  },

  // ── Inputs & forms ──
  {
    slug: "password-field",
    name: "Password Field",
    blurb: "Show / hide, a strength meter and a live checklist of rules.",
    category: "inputs",
    tags: ["form", "validation"],
  },
  {
    slug: "otp-input",
    name: "OTP Input",
    blurb: "One box per digit; auto-advances, steps back and fills on paste.",
    category: "inputs",
    tags: ["auth", "keyboard"],
  },
  {
    slug: "search-combobox",
    name: "Autocomplete",
    blurb: "Type to filter, arrows to move, Enter to pick — the ARIA combobox pattern.",
    category: "inputs",
    tags: ["a11y", "search"],
  },
  {
    slug: "tag-input",
    name: "Tag Input",
    blurb: "Enter or comma turns text into removable chips.",
    category: "inputs",
    tags: ["form", "chips"],
  },
  {
    slug: "file-dropzone",
    name: "File Dropzone",
    blurb: "Drag and drop or browse, with a size limit and a file list.",
    category: "inputs",
    tags: ["upload", "drag & drop"],
  },
  {
    slug: "range-slider",
    name: "Range Slider",
    blurb: "A styled native slider with a filled track and value bubble.",
    category: "inputs",
    tags: ["form", "native"],
  },
  {
    slug: "star-rating",
    name: "Star Rating",
    blurb: "Real radio buttons dressed as stars, with a hover preview.",
    category: "inputs",
    tags: ["a11y", "form"],
  },
  {
    slug: "segmented-control",
    name: "Segmented Control",
    blurb: "A sliding pill picker that works like a radio group from the keyboard.",
    category: "inputs",
    tags: ["a11y", "keyboard"],
  },
  {
    slug: "day-night-toggle",
    name: "Day / Night Toggle",
    blurb: "A theme switch where the sun rolls over into a moon and the stars come out.",
    category: "inputs",
    tags: ["switch", "theme"],
  },
  {
    slug: "copy-chip",
    name: "Copy Chip",
    blurb: "A command chip whose copy icon morphs into a check when it works.",
    category: "inputs",
    tags: ["clipboard", "feedback"],
  },

  // ── Navigation ──
  {
    slug: "tabs",
    name: "Tabs",
    blurb: "Accessible tabs with a sliding underline and arrow-key support.",
    category: "navigation",
    tags: ["a11y", "keyboard"],
  },
  {
    slug: "dropdown-menu",
    name: "Dropdown Menu",
    blurb: "A menu button with full keyboard support and click-outside closing.",
    category: "navigation",
    tags: ["a11y", "menu"],
  },
  {
    slug: "command-palette",
    name: "Command Palette",
    blurb: "A ⌘K launcher with search, arrow keys and Enter to run.",
    category: "navigation",
    tags: ["keyboard", "dialog"],
  },
  {
    slug: "breadcrumbs",
    name: "Breadcrumbs",
    blurb: "Shows where you are, with the current page marked for screen readers.",
    category: "navigation",
    tags: ["a11y", "wayfinding"],
  },
  {
    slug: "pagination",
    name: "Pagination",
    blurb: "Numbered pages with previous / next and smart ellipses.",
    category: "navigation",
    tags: ["lists", "a11y"],
  },
  {
    slug: "stepper",
    name: "Stepper",
    blurb: "Multi-step progress for sign-ups and checkouts.",
    category: "navigation",
    tags: ["wizard", "progress"],
  },

  // ── Overlays ──
  {
    slug: "modal-dialog",
    name: "Confirm Dialog",
    blurb: "A native <dialog> confirm with focus trapping and backdrop close.",
    category: "overlays",
    tags: ["dialog", "a11y"],
  },
  {
    slug: "side-drawer",
    name: "Side Drawer",
    blurb: "A sheet that slides in from the right — carts, filters, settings.",
    category: "overlays",
    tags: ["dialog", "panel"],
  },
  {
    slug: "toast-stack",
    name: "Toasts",
    blurb: "A tiny toast system: success, error and info that dismiss themselves.",
    category: "overlays",
    tags: ["notifications", "hook"],
  },
  {
    slug: "tooltip",
    name: "Tooltip",
    blurb: "Hover and focus tooltips wired with aria-describedby. Pure CSS.",
    category: "overlays",
    tags: ["a11y", "pure css"],
  },
  {
    slug: "cookie-banner",
    name: "Cookie Banner",
    blurb: "Consent with accept all, necessary only and a settings panel.",
    category: "overlays",
    tags: ["privacy", "switch"],
  },

  // ── Feedback ──
  {
    slug: "alert-banner",
    name: "Alerts",
    blurb: "Info, success, warning and error messages that can be dismissed.",
    category: "feedback",
    tags: ["status", "a11y"],
  },
  {
    slug: "progress-ring",
    name: "Progress Ring & Bar",
    blurb: "Circular and linear progress with proper progressbar roles.",
    category: "feedback",
    tags: ["svg", "a11y"],
  },
  {
    slug: "empty-state",
    name: "Empty State",
    blurb: "An illustration, a reason and the one action that fixes it.",
    category: "feedback",
    tags: ["ux", "illustration"],
  },
  {
    slug: "status-badges",
    name: "Status Badges",
    blurb: "Online, away, busy, beta… small pills with a coloured dot.",
    category: "feedback",
    tags: ["badge", "status"],
  },

  // ── Data display ──
  {
    slug: "data-table",
    name: "Data Table",
    blurb: "Search and sortable columns, with aria-sort for screen readers.",
    category: "data",
    tags: ["table", "sort"],
    wide: true,
  },
  {
    slug: "stat-sparkline",
    name: "KPI Card",
    blurb: "A big number, the change since last period and a sparkline.",
    category: "data",
    tags: ["dashboard", "svg"],
  },
  {
    slug: "timeline",
    name: "Timeline",
    blurb: "Dated entries on a line — changelogs, histories, order tracking.",
    category: "data",
    tags: ["list", "history"],
  },
  {
    slug: "avatar-group",
    name: "Avatar Group",
    blurb: "Overlapping avatars with a +N counter that fan out on hover.",
    category: "data",
    tags: ["people", "hover"],
  },

  // ── Games: the mini-games made for this portfolio ──
  {
    slug: "neon-runner",
    name: "Neon Runner",
    blurb: "An endless runner: jump bugs, double-jump, grab coffee.",
    category: "games",
    tags: ["canvas", "one-input"],
    wide: true,
    heavy: true,
    files: ["components/play/neon-runner.tsx", "lib/neon-runner.ts", ...GAME_SHARED],
  },
  {
    slug: "ship-it",
    name: "Ship It",
    blurb: "Launch a rocket and steer it through space junk.",
    category: "games",
    tags: ["canvas", "one-input"],
    wide: true,
    heavy: true,
    files: ["components/play/ship-it.tsx", "lib/ship-it.ts", ...GAME_SHARED],
  },
  {
    slug: "gravity-playground",
    name: "Gravity Playground",
    blurb: "A physics toy: fling, bounce and land things.",
    category: "games",
    tags: ["physics", "canvas"],
    wide: true,
    heavy: true,
    files: ["components/play/gravity-playground.tsx", "lib/gravity.ts", ...GAME_SHARED],
  },
  {
    slug: "one-spark",
    name: "One Spark",
    blurb: "Keep a single spark alive for as long as you can.",
    category: "games",
    tags: ["canvas", "one-input"],
    wide: true,
    heavy: true,
    files: ["components/play/one-spark.tsx", "lib/one-spark.ts", ...GAME_SHARED],
  },
  {
    slug: "stack-it",
    name: "Stack It",
    blurb: "Stack the skill blocks into a tower — one tap per drop.",
    category: "games",
    tags: ["timing", "one-input"],
    wide: true,
    heavy: true,
    files: [
      "components/toolkit/stack-it.tsx",
      "lib/stack-game.ts",
      "content/skills.ts",
      ...GAME_SHARED,
    ],
  },
] as const satisfies readonly ShopItem[];

export type ShopSlug = (typeof SHOP_ITEMS)[number]["slug"];

/** The item's source files, relative to `src/` (the first one is the component). */
export function sourceFiles(item: ShopItem): readonly string[] {
  return item.files ?? [`components/shop/items/${item.slug}.tsx`];
}

/** How many pieces are on the shelves in a category. */
export function stockIn(category: ShopCategory): number {
  return SHOP_ITEMS.filter((item) => item.category === category).length;
}

/** Whether an item matches a search query (name, blurb, tags or aisle). */
export function matchesQuery(item: ShopItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.name, item.blurb, item.category, ...item.tags].some((text) =>
    text.toLowerCase().includes(q),
  );
}
