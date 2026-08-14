import type { ReactNode } from "react";

export function Section({
  children,
  className = "",
  tone = "cream",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "cream" | "sand" | "plum" | "white";
  id?: string;
}) {
  const tones = {
    cream: "bg-cream text-ink",
    sand: "bg-sand/60 text-ink",
    white: "bg-white text-ink",
    plum: "bg-plum text-cream",
  } as const;

  return (
    <section id={id} className={`section ${tones[tone]} ${className}`}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "dark",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  tone?: "dark" | "light";
}) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow ? (
        <span className={`eyebrow ${tone === "light" ? "!text-sand-deep" : ""}`}>{eyebrow}</span>
      ) : null}
      <h2
        className={`mt-3 text-3xl leading-tight md:text-4xl ${
          tone === "light" ? "text-cream" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`mt-4 text-base leading-relaxed md:text-lg ${
            tone === "light" ? "text-cream/80" : "text-muted"
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export function Pill({ children, tone = "clay" }: { children: ReactNode; tone?: "clay" | "plum" }) {
  const tones = {
    clay: "bg-clay-soft text-clay",
    plum: "bg-plum-soft text-plum",
  } as const;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function CheckList({ items, tone = "dark" }: { items: string[]; tone?: "dark" | "light" }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            aria-hidden="true"
            className={`mt-1 flex h-5 w-5 flex-none items-center justify-center rounded-full text-xs ${
              tone === "light" ? "bg-cream/20 text-cream" : "bg-plum-soft text-plum"
            }`}
          >
            ✓
          </span>
          <span className={`text-sm leading-relaxed ${tone === "light" ? "text-cream/85" : "text-muted"}`}>
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
