import { CertificatesSection } from "@/components/certificates/certificates-section";
import { ContactSection } from "@/components/contact/contact-section";
import { DevHero } from "@/components/hero/dev-hero";
import { JourneySection } from "@/components/journey/journey-section";
import { StampCounter } from "@/components/passport/stamp-counter";
import { AfterHoursSection } from "@/components/play/after-hours-section";
import { ShopSection } from "@/components/shop/shop-section";
import { SiteFooter } from "@/components/site/site-footer";
import { StatsSection } from "@/components/stats/stats-section";
import { ToolkitSection } from "@/components/toolkit/toolkit-section";
import { WorksSection } from "@/components/works/works-section";

/**
 * Developer portfolio (default view): one world, eight places and a detour — the desk
 * (hero story), the pinboard (works), the workbench (toolkit), a detour to the
 * shop (UI components; the full shop is its own page, /shop), the frame wall
 * (certificates), the scoreboard (live stats), the road (journey) and after
 * hours (the passport) and the door (contact) — then the sign-off. Each place hides a rubber stamp;
 * the counter tracks the visitor's passport.
 */
export default function HomePage() {
  return (
    <>
      <main id="main" className="flex flex-1 flex-col">
        <DevHero />
        <WorksSection />
        <ToolkitSection />
        <ShopSection />
        <CertificatesSection />
        <StatsSection />
        <JourneySection />
        <AfterHoursSection />
        <ContactSection />
      </main>
      <SiteFooter />
      <StampCounter />
    </>
  );
}
