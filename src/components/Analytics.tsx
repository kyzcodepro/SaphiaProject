import Script from "next/script";
import { GA_ID, PLAUSIBLE_DOMAIN } from "@/lib/analytics";

/**
 * Scripts de mesure d'audience (§39).
 *
 * Plausible est privilégié : sans cookie, il ne nécessite pas de bandeau de
 * consentement. Google Analytics 4 n'est chargé que si NEXT_PUBLIC_GA_ID est
 * défini — dans ce cas, la bannière de consentement devient obligatoire
 * (voir CookieBanner).
 */
export function Analytics() {
  return (
    <>
      {PLAUSIBLE_DOMAIN ? (
        <Script
          defer
          data-domain={PLAUSIBLE_DOMAIN}
          src="https://plausible.io/js/script.tagged-events.js"
          strategy="afterInteractive"
        />
      ) : null}

      {GA_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('consent', 'default', {
                ad_storage: 'denied',
                analytics_storage: 'denied',
                wait_for_update: 500
              });
              gtag('config', '${GA_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}
    </>
  );
}
