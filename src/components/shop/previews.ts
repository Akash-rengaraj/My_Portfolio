import type { ComponentType } from "react";

import { GravityPlayground } from "@/components/play/gravity-playground";
import { NeonRunner } from "@/components/play/neon-runner";
import { OneSpark } from "@/components/play/one-spark";
import { ShipIt } from "@/components/play/ship-it";
import { StackIt } from "@/components/toolkit/stack-it";

import type { ShopSlug } from "./catalog";
import { AlertBannerDemo } from "./items/alert-banner";
import { AvatarGroup } from "./items/avatar-group";
import { BlogCards } from "./items/blog-cards";
import { Breadcrumbs } from "./items/breadcrumbs";
import { CommandPalette } from "./items/command-palette";
import { ContactForm } from "./items/contact-form";
import { CookieBanner } from "./items/cookie-banner";
import { CopyChip } from "./items/copy-chip";
import { CtaBanner } from "./items/cta-banner";
import { DataTable } from "./items/data-table";
import { DayCycleHero } from "./items/day-cycle-hero";
import { DayNightToggle } from "./items/day-night-toggle";
import { DropdownMenu } from "./items/dropdown-menu";
import { EmptyState } from "./items/empty-state";
import { FaqAccordion } from "./items/faq-accordion";
import { FeatureGrid } from "./items/feature-grid";
import { FileDropzone } from "./items/file-dropzone";
import { FooterColumns } from "./items/footer-columns";
import { HeroSplit } from "./items/hero-split";
import { LightsOutHero } from "./items/lights-out-hero";
import { LikeButton } from "./items/like-button";
import { LivingSandHero } from "./items/living-sand-hero";
import { LoadingButton } from "./items/loading-button";
import { LogoCloud } from "./items/logo-cloud";
import { MagneticButton } from "./items/magnetic-button";
import { ModalDialog } from "./items/modal-dialog";
import { Navbar } from "./items/navbar";
import { NotFoundSection } from "./items/not-found-section";
import { OneLineHero } from "./items/one-line-hero";
import { OtpInput } from "./items/otp-input";
import { Pagination } from "./items/pagination";
import { PasswordField } from "./items/password-field";
import { PricingTable } from "./items/pricing-table";
import { ProgressDemo } from "./items/progress-ring";
import { RabbitHoleHero } from "./items/rabbit-hole-hero";
import { RangeSlider } from "./items/range-slider";
import { SearchCombobox } from "./items/search-combobox";
import { SegmentedControl } from "./items/segmented-control";
import { ShimmerButton } from "./items/shimmer-button";
import { SideDrawer } from "./items/side-drawer";
import { SkeletonCard } from "./items/skeleton-card";
import { SpotlightCard } from "./items/spotlight-card";
import { StampCard } from "./items/stamp-card";
import { StarRating } from "./items/star-rating";
import { StatSparkline } from "./items/stat-sparkline";
import { StatsBand } from "./items/stats-band";
import { StatusBadges } from "./items/status-badges";
import { Stepper } from "./items/stepper";
import { StickyNote } from "./items/sticky-note";
import { Tabs } from "./items/tabs";
import { TagInput } from "./items/tag-input";
import { TeamGrid } from "./items/team-grid";
import { TestimonialMarquee } from "./items/testimonial-marquee";
import { TicketStub } from "./items/ticket-stub";
import { TiltCard } from "./items/tilt-card";
import { Timeline } from "./items/timeline";
import { ToastStack } from "./items/toast-stack";
import { TooltipDemo } from "./items/tooltip";
import { UnlockHero } from "./items/unlock-hero";

/** The live preview for each item in the catalog (rendered with its defaults). */
export const PREVIEWS: Record<ShopSlug, ComponentType> = {
  navbar: Navbar,
  "hero-split": HeroSplit,
  "logo-cloud": LogoCloud,
  "feature-grid": FeatureGrid,
  "stats-band": StatsBand,
  "pricing-table": PricingTable,
  "testimonial-marquee": TestimonialMarquee,
  "team-grid": TeamGrid,
  "blog-cards": BlogCards,
  "faq-accordion": FaqAccordion,
  "contact-form": ContactForm,
  "cta-banner": CtaBanner,
  "footer-columns": FooterColumns,
  "not-found-section": NotFoundSection,
  "lights-out-hero": LightsOutHero,
  "unlock-hero": UnlockHero,
  "one-line-hero": OneLineHero,
  "living-sand-hero": LivingSandHero,
  "day-cycle-hero": DayCycleHero,
  "rabbit-hole-hero": RabbitHoleHero,
  "magnetic-button": MagneticButton,
  "loading-button": LoadingButton,
  "like-button": LikeButton,
  "shimmer-button": ShimmerButton,
  "stamp-card": StampCard,
  "spotlight-card": SpotlightCard,
  "tilt-card": TiltCard,
  "ticket-stub": TicketStub,
  "sticky-note": StickyNote,
  "skeleton-card": SkeletonCard,
  "password-field": PasswordField,
  "otp-input": OtpInput,
  "search-combobox": SearchCombobox,
  "tag-input": TagInput,
  "file-dropzone": FileDropzone,
  "range-slider": RangeSlider,
  "star-rating": StarRating,
  "segmented-control": SegmentedControl,
  "day-night-toggle": DayNightToggle,
  "copy-chip": CopyChip,
  tabs: Tabs,
  "dropdown-menu": DropdownMenu,
  "command-palette": CommandPalette,
  breadcrumbs: Breadcrumbs,
  pagination: Pagination,
  stepper: Stepper,
  "modal-dialog": ModalDialog,
  "side-drawer": SideDrawer,
  "toast-stack": ToastStack,
  tooltip: TooltipDemo,
  "cookie-banner": CookieBanner,
  "alert-banner": AlertBannerDemo,
  "progress-ring": ProgressDemo,
  "empty-state": EmptyState,
  "status-badges": StatusBadges,
  "data-table": DataTable,
  "stat-sparkline": StatSparkline,
  timeline: Timeline,
  "avatar-group": AvatarGroup,
  "neon-runner": NeonRunner,
  "ship-it": ShipIt,
  "gravity-playground": GravityPlayground,
  "one-spark": OneSpark,
  "stack-it": StackIt,
};
