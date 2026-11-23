import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Metadata } from "next";

import { SHOP_ITEMS, sourceFiles } from "@/components/shop/catalog";
import { ShopFloor, type SourceFile } from "@/components/shop/shop-floor";

export const metadata: Metadata = {
  title: "UI Components Shop",
  description:
    "Free React + Tailwind UI components — page sections, heroes, forms, menus, dialogs, data and games. Try each one live and copy its code.",
  alternates: { canonical: "/shop" },
};

const SRC = path.join(process.cwd(), "src");

/** Reads one source file at build time, so the copied code is exactly what runs. */
async function readSource(file: string): Promise<SourceFile> {
  try {
    return { path: file, code: await readFile(path.join(SRC, file), "utf8") };
  } catch (error) {
    throw new Error(`UI Components Shop: can't read src/${file}`, { cause: error });
  }
}

/** The UI Components Shop, entered through the shop door on the home page. */
export default async function ShopPage() {
  const entries = await Promise.all(
    SHOP_ITEMS.map(
      async (item) => [item.slug, await Promise.all(sourceFiles(item).map(readSource))] as const,
    ),
  );
  const sources: Record<string, readonly SourceFile[]> = Object.fromEntries(entries);

  return (
    <main id="main" className="flex flex-1 flex-col bg-[var(--bg-shop)] text-stage-foreground">
      <ShopFloor sources={sources} />
    </main>
  );
}
