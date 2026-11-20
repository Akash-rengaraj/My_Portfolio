import { siteConfig } from "@/config/site";

/** Home page. Sections are added once the content plan is final. */
export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-4 px-6 py-24">
      <h1 className="font-heading text-4xl font-semibold tracking-tight">{siteConfig.name}</h1>
      <p className="text-lg text-muted-foreground">{siteConfig.description}</p>
    </main>
  );
}
