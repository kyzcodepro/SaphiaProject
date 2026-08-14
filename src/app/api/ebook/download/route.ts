import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { EBOOK_SLUG, ebook, getPurchasable } from "@/content/site.config";
import { getOrder } from "@/lib/payments/paypal";
import { retrieveCheckoutSession } from "@/lib/payments/stripe";

/**
 * Téléchargement de l'ebook, protégé par le paiement.
 *
 * Le PDF n'est volontairement pas placé dans /public : il serait alors
 * accessible à toute personne connaissant — ou devinant — son URL. Ici, chaque
 * téléchargement revérifie auprès de Stripe ou PayPal que la référence fournie
 * correspond bien à un paiement encaissé pour l'ebook.
 *
 * Deux modes de stockage, dans cet ordre :
 *  1. `EBOOK_FILE_URL` — le fichier est hébergé ailleurs (stockage privé,
 *     lien signé). La route redirige vers cette adresse.
 *  2. `private/<fichier>` à la racine du projet — le fichier est lu sur disque
 *     et servi directement.
 *
 * Voir docs/EBOOK.md.
 */

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider");
  const reference = url.searchParams.get("ref");

  const product = getPurchasable(EBOOK_SLUG);
  if (!product) return refusal("Ebook indisponible.", 404);

  // Un ebook gratuit reste téléchargeable sans référence de paiement.
  if (product.price > 0) {
    if ((provider !== "stripe" && provider !== "paypal") || !reference || reference.length > 255) {
      return refusal("Lien de téléchargement invalide.", 400);
    }

    const paid = await isPaid(provider, reference, Math.round(product.price * 100));
    if (!paid) {
      return refusal(
        "Ce lien ne correspond à aucun paiement valide. Si tu viens d'acheter l'ebook, réessaie dans quelques instants ou écris-moi.",
        403,
      );
    }
  }

  try {
    const remote = process.env.EBOOK_FILE_URL;
    if (remote) {
      return NextResponse.redirect(remote, 302);
    }

    const filePath = path.join(process.cwd(), "private", ebook.fileName);
    const file = await readFile(filePath);

    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${ebook.fileName}"`,
        "Content-Length": String(file.byteLength),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[ebook] Fichier introuvable:", error);
    return refusal(
      "Le fichier n'est pas disponible pour le moment. Écris-moi et je te l'envoie directement.",
      503,
    );
  }
}

/** Relit l'état du paiement auprès du fournisseur, sans faire confiance au lien. */
async function isPaid(
  provider: "stripe" | "paypal",
  reference: string,
  expectedCents: number,
): Promise<boolean> {
  try {
    if (provider === "stripe") {
      const session = await retrieveCheckoutSession(reference);
      return (
        session.payment_status === "paid" &&
        (session.amount_total ?? 0) >= expectedCents &&
        session.metadata?.offer === EBOOK_SLUG
      );
    }

    const order = await getOrder(reference);
    const unit = order.purchase_units?.[0];
    const paidCents = Math.round(Number(unit?.amount?.value ?? "0") * 100);
    return (
      order.status === "COMPLETED" &&
      paidCents >= expectedCents &&
      unit?.reference_id === EBOOK_SLUG
    );
  } catch (error) {
    console.error("[ebook] Vérification du paiement impossible:", error);
    return false;
  }
}

function refusal(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
