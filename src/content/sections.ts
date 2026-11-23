/** The page's sections, in order — the fixed nav and the footer map read this. */
export const SECTIONS = [
  { id: "hero", label: "Story" },
  { id: "works", label: "Works" },
  { id: "toolkit", label: "Toolkit" },
  { id: "shop", label: "Shop" },
  { id: "certifications", label: "Certifications" },
  { id: "scoreboard", label: "Stats" },
  { id: "journey", label: "Journey" },
  { id: "play", label: "Passport" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];
