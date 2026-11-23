"use client";

import { useState } from "react";

const PLANS = [
  {
    name: "Starter",
    monthly: 0,
    text: "For side projects.",
    features: ["1 project", "Community support", "Basic analytics"],
  },
  {
    name: "Pro",
    monthly: 19,
    text: "For growing products.",
    features: ["Unlimited projects", "Priority support", "Advanced analytics", "Custom domain"],
    featured: true,
  },
  {
    name: "Team",
    monthly: 49,
    text: "For companies.",
    features: ["Everything in Pro", "SSO & roles", "Audit log", "SLA"],
  },
] as const;

/** Yearly billing gives two months free. */
const yearlyPrice = (monthly: number) => Math.round((monthly * 10) / 12);

/**
 * A pricing section with a monthly / yearly switch and three plans, the
 * middle one highlighted. Cards stack on narrow containers.
 */
export function PricingTable() {
  const [yearly, setYearly] = useState(false);

  return (
    <section className="@container w-full rounded-3xl bg-white px-6 py-14 @3xl:px-12 dark:bg-zinc-950">
      <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Simple, fair pricing
      </h2>
      <div className="mt-6 flex items-center justify-center gap-3 text-sm">
        <span className={yearly ? "text-zinc-500" : "font-semibold text-zinc-900 dark:text-white"}>
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={yearly}
          aria-label="Bill yearly"
          onClick={() => setYearly((y) => !y)}
          className="relative h-7 w-12 rounded-full bg-zinc-300 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 aria-checked:bg-orange-500 dark:bg-zinc-700"
        >
          <span
            className={`absolute top-1 left-1 size-5 rounded-full bg-white shadow transition-transform ${yearly ? "translate-x-5" : ""}`}
          />
        </button>
        <span className={yearly ? "font-semibold text-zinc-900 dark:text-white" : "text-zinc-500"}>
          Yearly{" "}
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400">
            2 months free
          </span>
        </span>
      </div>

      <ul className="mt-10 grid gap-4 @3xl:grid-cols-3">
        {PLANS.map((plan) => {
          const featured = "featured" in plan && plan.featured;
          const price = yearly ? yearlyPrice(plan.monthly) : plan.monthly;
          return (
            <li
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-6 ${featured ? "border-orange-500 bg-zinc-900 text-white shadow-2xl shadow-orange-500/20 dark:bg-zinc-900" : "border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"}`}
            >
              {featured ? (
                <span className="absolute -top-3 left-6 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              ) : null}
              <h3 className="font-semibold">{plan.name}</h3>
              <p className={`text-sm ${featured ? "text-zinc-400" : "text-zinc-500"}`}>
                {plan.text}
              </p>
              <p className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-bold tabular-nums">${price}</span>
                <span className={`text-sm ${featured ? "text-zinc-400" : "text-zinc-500"}`}>
                  / month
                </span>
              </p>
              <ul className="mt-6 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="size-4 shrink-0 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={`mt-8 rounded-full px-4 py-2.5 text-center text-sm font-semibold transition-opacity hover:opacity-85 ${featured ? "bg-orange-500 text-white" : "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"}`}
              >
                {plan.monthly === 0 ? "Start free" : `Choose ${plan.name}`}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
