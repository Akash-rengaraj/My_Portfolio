"use client";

import { Dialog } from "radix-ui";
import { useState } from "react";

import { HiddenStamp } from "@/components/passport/hidden-stamp";
import { Reveal } from "@/components/works/reveal";
import { ChapterMarker } from "@/components/world/chapter-marker";
import { PaperEdge } from "@/components/world/paper-edge";
import {
  byMonth,
  CERTIFICATES,
  ISSUER_LOGOS,
  issuerCounts,
  pdfFor,
  thumbFor,
  verifyUrl,
  type Certificate,
  type Issuer,
} from "@/content/certificates";
import { LoadingImage } from "@/components/ui/loading-image";

const ISSUERS = issuerCounts(CERTIFICATES);
const MONTHLY = byMonth(CERTIFICATES);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthLabel(iso: string): string {
  const [year = "", month = "1"] = iso.split("-");
  return `${MONTHS[Number(month) - 1] ?? ""} ’${year.slice(2)}`;
}

const FIRST = MONTHLY[0]?.month ?? "";
const LAST = MONTHLY.at(-1)?.month ?? "";

function IssuerLogo({ issuer, size = 20 }: { issuer: Issuer; size?: number }) {
  return (
    <LoadingImage
      src={ISSUER_LOGOS[issuer]}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-[4px] bg-white object-contain p-px"
    />
  );
}

/** One certificate as a compact card: issuer logo, issuer and course name. */
function CertificateCard({ cert, onOpen }: { cert: Certificate; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View certificate: ${cert.title}, ${cert.issuer}`}
      className="group flex h-full w-full items-center gap-4 rounded-2xl border border-line bg-surface p-4 text-left shadow-[0_14px_30px_-24px_var(--shadow-ink)] transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_24px_40px_-26px_var(--shadow-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-line bg-white">
        <LoadingImage
          src={ISSUER_LOGOS[cert.issuer]}
          alt=""
          width={32}
          height={32}
          className="size-8 object-contain"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[11px] tracking-[0.14em] text-stage-muted uppercase">
          {cert.issuer}
        </span>
        <span className="mt-0.5 block font-heading text-base leading-snug font-semibold tracking-tight text-balance">
          {cert.title}
        </span>
      </span>
      <span
        aria-hidden="true"
        className="shrink-0 text-stage-muted transition-[translate,color] duration-300 group-hover:translate-x-1 group-hover:text-signal"
      >
        →
      </span>
    </button>
  );
}

/** Full-size view with the PDF and the issuer's verification link. */
function CertificateDialog({ cert, onClose }: { cert: Certificate | null; onClose: () => void }) {
  const verify = cert ? verifyUrl(cert) : null;
  return (
    <Dialog.Root open={cert !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-4 top-1/2 z-[61] mx-auto max-h-[92svh] max-w-4xl -translate-y-1/2 overflow-y-auto rounded-2xl border border-line bg-surface p-4 text-stage-foreground outline-none data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=open]:fade-in sm:p-6"
        >
          {cert ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-stage-muted uppercase">
                    <IssuerLogo issuer={cert.issuer} size={18} />
                    {cert.issuer} · {cert.area} · {cert.issuedLabel}
                  </p>
                  <Dialog.Title className="mt-2 font-heading text-2xl font-semibold tracking-tight">
                    {cert.title}
                  </Dialog.Title>
                  {cert.note ? <p className="mt-1 text-sm text-stage-muted">{cert.note}</p> : null}
                </div>
                <Dialog.Close
                  aria-label="Close"
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong transition-colors hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                  </svg>
                </Dialog.Close>
              </div>
              <div className="mt-5 overflow-hidden rounded-lg border border-line bg-white">
                <LoadingImage
                  src={thumbFor(cert)}
                  alt={`${cert.title} certificate issued by ${cert.issuer}`}
                  width={900}
                  height={696}
                  sizes="(min-width: 1024px) 860px, 92vw"
                  className="h-auto w-full"
                />
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={pdfFor(cert)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-stage-foreground px-5 font-mono text-xs tracking-[0.14em] text-stage uppercase transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
                >
                  open pdf ↗
                </a>
                {verify ? (
                  <a
                    href={verify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-5 font-mono text-xs tracking-[0.14em] uppercase transition-colors hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
                  >
                    verify on coursera ↗
                  </a>
                ) : null}
              </div>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * "Certifications" — chapter 04, the frame wall. Each certificate is a compact
 * card (issuer logo, issuer, course); click one to see the full certificate,
 * open the PDF or verify it.
 */
export function CertificatesSection() {
  const [open, setOpen] = useState<Certificate | null>(null);

  return (
    <section
      id="certifications"
      aria-labelledby="certifications-title"
      className="relative bg-[var(--bg-certs)] text-stage-foreground"
      style={{
        // Gallery wall: faint vertical panel seams.
        backgroundImage:
          "repeating-linear-gradient(90deg, var(--line) 0 1px, transparent 1px 160px)",
      }}
    >
      <PaperEdge colorClass="text-[var(--bg-shop)]" />
      <div className="mx-auto w-full max-w-[110rem] px-6 pt-28 pb-24 sm:px-10 md:pt-36 md:pb-32 xl:px-14">
        <Reveal>
          <div className="max-w-3xl">
            <div>
              <ChapterMarker chapter="frames" note="proof I did the homework" />
              <h2
                id="certifications-title"
                className="mt-6 font-heading text-6xl font-semibold tracking-tight md:text-8xl"
              >
                Certifications
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-snug text-stage-foreground/75">
                {CERTIFICATES.length} certificates from {ISSUERS.length} issuers, earned between{" "}
                {monthLabel(FIRST)} and {monthLabel(LAST)}. Click any card to see the full
                certificate.
              </p>
            </div>
          </div>
        </Reveal>

        {/* The cards */}
        <ul className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CERTIFICATES.map((cert, i) => (
            <li key={cert.slug} className="relative">
              <Reveal delay={(i % 4) * 60} className="h-full">
                <CertificateCard cert={cert} onOpen={() => setOpen(cert)} />
              </Reveal>
              {cert.slug === "react-basics" ? (
                <HiddenStamp id="frames" className="absolute -top-3 -right-2" />
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <CertificateDialog cert={open} onClose={() => setOpen(null)} />
    </section>
  );
}
