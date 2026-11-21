/**
 * "My Journey" — schooling, college and the roles picked up along the way.
 * Only facts the owner has given; edit here and the section re-renders.
 */

export interface Town {
  name: string;
  state: string;
  /** Railway station code, printed on the ticket. */
  code: string;
  /** A handwritten aside about the place. */
  note: string;
}

export const HOMETOWN: Town = {
  name: "Sivakasi",
  state: "Tamil Nadu",
  code: "SVKS",
  note: "the fireworks town that lights up India's Diwali",
};

export const COLLEGE_TOWN: Town = {
  name: "Coimbatore",
  state: "Tamil Nadu",
  code: "CBE",
  note: "the Manchester of South India",
};

export interface School {
  id: string;
  level: string;
  /** Big number on the ticket stub. */
  grade: "10" | "12";
  name: string;
  town: string;
  board?: string;
  score?: { value: number; max: number };
  /** Overall percentage, when marks out of a total aren't shown. */
  percent?: number;
}

/** Overall percentage: given directly, or worked out from the marks (one decimal). */
export function percentOf(school: School): number | undefined {
  if (school.percent !== undefined) return school.percent;
  if (!school.score) return undefined;
  return Math.round((school.score.value / school.score.max) * 1000) / 10;
}

export const SCHOOLING: readonly School[] = [
  {
    id: "class-10",
    level: "Class 10",
    grade: "10",
    name: "Thiruthangal Lions Matriculation Higher Secondary School",
    town: "Sivakasi, Tamil Nadu",
    board: "Tamil Nadu State Board",
    score: { value: 449, max: 500 },
  },
  {
    id: "class-12",
    level: "Class 12",
    grade: "12",
    name: "SNM Matriculation Higher Secondary School",
    town: "Sivakasi, Tamil Nadu",
    score: { value: 543, max: 600 },
  },
];

export const COLLEGE = {
  name: "Sri Krishna College of Engineering and Technology",
  short: "SKCET",
  town: "Coimbatore, Tamil Nadu",
  course: "AI & Data Science",
  year: "3rd year",
  semester: 6,
  cgpa: 8.3,
  cgpaMax: 10,
} as const;

export interface Role {
  id: string;
  title: string;
  org: string;
  detail: string;
  hue: string;
  /** Resting angle of the sticker, in degrees. */
  tilt: number;
}

/** Hats worn alongside college. */
export const ROLES: readonly Role[] = [
  {
    id: "ds-club",
    title: "Tech Lead",
    org: "Data Science Club · my department",
    detail: "Leading the club's technical side, and organising a lot of its events.",
    hue: "#8b5cf6",
    tilt: -3,
  },
  {
    id: "gsa",
    title: "Google Student Ambassador",
    org: "Class of 2026",
    detail: "Bringing tech to campus and hosting events as an ambassador.",
    hue: "#2f6be0",
    tilt: 2,
  },
  {
    id: "freelance",
    title: "Freelancer",
    org: "Alongside college",
    detail: "Taking on real client work while I study.",
    hue: "#16a34a",
    tilt: -1.5,
  },
];
