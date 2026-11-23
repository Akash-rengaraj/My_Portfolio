import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";

import { ParlourHero } from "@/components/personal/parlour/parlour-hero";

/** The personal side's serif: elegant, a little old-world. Self-hosted by next/font. */
const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Off the clock",
  description: "The personal side of Akash Rengaraj — coder by day, poet by night.",
  alternates: { canonical: "/personal" },
};

/** The personal portfolio: a vintage parlour. Rooms come later. */
export default function PersonalPage() {
  return (
    <main id="main" className={`${serif.variable} flex flex-1 flex-col bg-[#ece2cf]`}>
      <ParlourHero />
    </main>
  );
}
