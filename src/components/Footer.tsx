import Link from "next/link";
import { brand, legalPages, navigation, whatsappLink } from "@/content/site.config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-sand-deep/60 bg-sand/50">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:gap-8">
        <div>
          <p className="font-display text-2xl text-ink">{brand.name}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{brand.tagline}</p>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp mt-6">
            Me contacter sur WhatsApp
          </a>
        </div>

        <nav aria-label="Pages du site">
          <p className="text-sm font-semibold text-ink">Le site</p>
          <ul className="mt-4 space-y-2.5">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-muted transition-colors hover:text-plum">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${brand.email}`}
                className="text-sm text-muted transition-colors hover:text-plum"
              >
                {brand.email}
              </a>
            </li>
          </ul>
        </nav>

        <nav aria-label="Informations légales">
          <p className="text-sm font-semibold text-ink">Informations</p>
          <ul className="mt-4 space-y-2.5">
            {legalPages.map((page) => (
              <li key={page.href}>
                <Link href={page.href} className="text-sm text-muted transition-colors hover:text-plum">
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm font-semibold text-ink">Me suivre</p>
          <ul className="mt-3 flex gap-4">
            <li>
              <a
                href={brand.socials.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted transition-colors hover:text-plum"
              >
                TikTok
              </a>
            </li>
            <li>
              <a
                href={brand.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted transition-colors hover:text-plum"
              >
                Instagram
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-sand-deep/60">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {brand.legalName}. Tous droits réservés.
          </p>
          <p>
            L&apos;accompagnement proposé relève du développement personnel et ne constitue ni un
            acte médical, ni une psychothérapie.
          </p>
        </div>
      </div>
    </footer>
  );
}
