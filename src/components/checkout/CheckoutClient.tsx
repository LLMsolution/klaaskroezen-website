"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import {
  calculateBtw,
  isEuCountry,
  type BumpConfig,
} from "@/lib/checkout-config";
import { t, type Lang } from "@/lib/checkout-i18n";
import { OrderSummary, CheckoutReviews } from "./OrderSummary";
import { CheckoutForm } from "./CheckoutForm";
import { CheckoutTotals } from "./CheckoutTotals";
import { TrustBadges } from "./TrustBadges";
import { ExitIntent } from "./ExitIntent";
import { SocialProof } from "./SocialProof";
import { IdealIcon, CreditCardIcon, ApplePayIcon } from "./PaymentIcons";

interface Props {
  productSlug: string;
  lang: Lang;
  recoveryOrderId?: string;
  paymentFailed?: boolean;
  initialCountry?: string;
  experimentSlug?: string;
  experimentVariant?: string;
  /** When true, the experiment cookie hasn't been set yet (DB-driven experiment). */
  experimentNeedsCookie?: boolean;
}

export function CheckoutClient({ productSlug, lang, recoveryOrderId, paymentFailed, initialCountry, experimentSlug, experimentVariant, experimentNeedsCookie }: Props) {
  // Load product and bumps from DB
  const product = useQuery(api.checkoutProducts.getBySlug, { slug: productSlug });
  const dbBumps = useQuery(api.checkoutProducts.getBumpsForProduct, { slug: productSlug });
  const bumps: BumpConfig[] = useMemo(() => dbBumps ?? [], [dbBumps]);
  const i18n = t(lang);
  const formRef = useRef<HTMLFormElement>(null);
  const { signIn } = useAuthActions();
  const currentUser = useQuery(api.users.getCurrentUser);
  const createPendingOrder = useMutation(api.checkout.createPendingOrder);
  const processFreeOrder = useMutation(api.checkout.processFreeOrder);
  const createMolliePayment = useAction(api.mollie.createMolliePayment);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState(initialCountry || "NL");
  const [recovered, setRecovered] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);
  const [company, setCompany] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");

  const [selectedBumps, setSelectedBumps] = useState<string[]>([]);
  const [useInstallments, setUseInstallments] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discountStatus, setDiscountStatus] = useState<"idle" | "valid" | "invalid" | "expired" | "maxed" | "wrong_product">("idle");
  const [discountValue, setDiscountValue] = useState<{ type: "percentage" | "fixed"; value: number } | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>(country === "NL" || country === "BE" ? "ideal" : "creditcard");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [mailingOptIn, setMailingOptIn] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [agreedDigitalWaiver, setAgreedDigitalWaiver] = useState(false);
  const [waiverError, setWaiverError] = useState(false);
  const [postalError, setPostalError] = useState(false);
  const [payingMethod, setPayingMethod] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const isBook = product?.type === "book";
  const availableBookLangs = (product as { availableBookLanguages?: string[] })?.availableBookLanguages ?? ["nl"];
  const [bookLang, setBookLang] = useState<Lang>(availableBookLangs.includes(lang) ? lang : "nl");
  const bookLangAvailable = availableBookLangs.includes(bookLang);

  // Returning visitor recognition via localStorage
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("kk_checkout_email");
      const savedName = localStorage.getItem("kk_checkout_name");
      if (savedEmail && !email && !recoveryOrderId) setEmail(savedEmail);
      if (savedName && !firstName && !recoveryOrderId) setFirstName(savedName);
    } catch { /* localStorage unavailable */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try {
      if (email && email.includes("@")) localStorage.setItem("kk_checkout_email", email);
      if (firstName) localStorage.setItem("kk_checkout_name", firstName);
    } catch { /* localStorage unavailable */ }
  }, [email, firstName]);
  // Persist experiment cookie for DB-driven experiments
  useEffect(() => {
    if (experimentNeedsCookie && experimentSlug && experimentVariant) {
      document.cookie = `ab-${experimentSlug}=${experimentVariant};path=/;max-age=${30 * 24 * 60 * 60};samesite=lax`;
    }
  }, [experimentNeedsCookie, experimentSlug, experimentVariant]);
  // Auto-fill from logged-in user
  useEffect(() => {
    if (!currentUser || recovered) return;
    if (currentUser.name && !firstName) {
      const parts = currentUser.name.split(" ");
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" ") ?? "");
    }
    if (currentUser.email && !email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps
  // Pre-fill from pending order (recovery or returning visitor)
  const recoveryOrder = useQuery(
    api.checkout.getPendingOrderForRecovery,
    recoveryOrderId ? { orderId: recoveryOrderId } : "skip",
  );
  const returningOrder = useQuery(
    api.checkout.getPendingOrderByEmail,
    !recoveryOrderId && email && email.includes("@") ? { email, product: productSlug } : "skip",
  );

  useEffect(() => {
    const order = recoveryOrder || returningOrder;
    if (order && !recovered) {
      setFirstName(order.firstName);
      setLastName(order.lastName);
      setEmail(order.email);
      if (order.phone) setPhone(order.phone);
      setCountry(order.country);
      setIsBusiness(order.isBusiness);
      if (order.company) setCompany(order.company);
      if ((order as Record<string, unknown>).companyWebsite) setCompanyWebsite((order as Record<string, unknown>).companyWebsite as string);
      if (order.vatNumber) setVatNumber(order.vatNumber);
      if (order.street) setStreet(order.street);
      if (order.houseNumber) setHouseNumber(order.houseNumber);
      if (order.postalCode) setPostalCode(order.postalCode);
      if (order.city) setCity(order.city);
      if (order.bumps?.length) setSelectedBumps(order.bumps);
      if (order.quantity && order.quantity > 1) setQuantity(order.quantity);
      if (order.installments) setUseInstallments(order.installments);
      if (order.discountCode) {
        setDiscountCode(order.discountCode);
        setDiscountOpen(true);
      }
      setRecovered(true);
    }
  }, [recoveryOrder, returningOrder, recovered]);
  useEffect(() => {
    if (country === "NL" || country === "BE") {
      setSelectedMethod("ideal");
    } else {
      setSelectedMethod("creditcard");
    }
  }, [country]);
  // Discount validation
  const discountResult = useQuery(
    api.checkout.validateDiscount,
    discountCode.length >= 3 ? { code: discountCode, product: productSlug } : "skip",
  );

  useEffect(() => {
    if (!discountResult) return;
    if (discountResult.valid) {
      setDiscountStatus("valid");
      setDiscountValue({ type: discountResult.type, value: discountResult.value });
    } else {
      setDiscountStatus(discountResult.reason as "invalid" | "expired" | "maxed" | "wrong_product");
      setDiscountValue(null);
    }
  }, [discountResult]);
  // Auto-save draft (debounced 3s)
  const saveDraft = useMutation(api.checkout.saveDraft);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!email || !email.includes("@") || !firstName || recovered) return;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      saveDraft({
        email, firstName, lastName, phone: phone || undefined,
        product: productSlug, country, lang,
        isBusiness, company: company || undefined, companyWebsite: companyWebsite || undefined, vatNumber: vatNumber || undefined,
        street: street || undefined, houseNumber: houseNumber || undefined,
        postalCode: postalCode || undefined, city: city || undefined,
        quantity, bumps: selectedBumps, discountCode: discountCode || undefined,
        installments: useInstallments,
      }).catch(() => { /* silently fail */ });
    }, 3000);
    return () => { if (draftTimer.current) clearTimeout(draftTimer.current); };
  }, [email, firstName, lastName, phone, country, isBusiness, company, companyWebsite, vatNumber, street, houseNumber, postalCode, city, quantity, selectedBumps, discountCode, useInstallments]); // eslint-disable-line react-hooks/exhaustive-deps
  // Tab title change on visibility
  useEffect(() => {
    const originalTitle = document.title;
    function handleVisibility() {
      if (document.hidden) {
        document.title = { nl: "Vergeet je bestelling niet!", en: "Don't forget your order!", de: "Vergessen Sie Ihre Bestellung nicht!" }[lang];
      } else {
        document.title = originalTitle;
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.title = originalTitle;
    };
  }, [lang]);
  // Calculate totals
  const calculateTotals = useCallback(() => {
    if (!product) return { productNet: 0, productBtw: 0, productGross: 0, bumpsNet: 0, bumpsBtw: 0, bumpsGross: 0, totalNet: 0, totalBtw: 0, totalGross: 0, btwReversed: false, noBtw: false };

    const btwRate = product.btwRate;
    let applyBtw = true;
    if (isBusiness && vatNumber && isEuCountry(country) && country !== "NL") applyBtw = false;
    if (!isEuCountry(country)) applyBtw = false;

    const tiers = product.quantityTiers;
    const unitPrice = tiers
      ? (tiers.find((t) => t.quantity === quantity)?.unitPriceCents ?? product.priceCents)
      : product.priceCents;
    let productPriceCents = unitPrice * quantity;

    if (discountStatus === "valid" && discountValue) {
      if (discountValue.type === "percentage") {
        productPriceCents = Math.round(productPriceCents * (1 - discountValue.value / 100));
      } else {
        productPriceCents = Math.max(0, productPriceCents - discountValue.value);
      }
    }

    const mainCalc = calculateBtw(productPriceCents, applyBtw ? btwRate : 0, product.priceInclBtw);
    let bumpsNet = 0, bumpsBtw = 0, bumpsGross = 0;
    const bundleDiscount = selectedBumps.length >= 2 ? 0.85 : 1;
    for (const bumpSlug of selectedBumps) {
      const bumpConfig = bumps.find((b) => b.slug === bumpSlug);
      if (bumpConfig) {
        const discountedPrice = Math.round(bumpConfig.price * bundleDiscount);
        const bc = calculateBtw(discountedPrice, applyBtw ? bumpConfig.btwRate : 0, bumpConfig.priceInclBtw);
        bumpsNet += bc.net;
        bumpsBtw += bc.btw;
        bumpsGross += bc.gross;
      }
    }

    return {
      productNet: mainCalc.net, productBtw: mainCalc.btw, productGross: mainCalc.gross,
      bumpsNet, bumpsBtw, bumpsGross,
      totalNet: mainCalc.net + bumpsNet, totalBtw: mainCalc.btw + bumpsBtw, totalGross: mainCalc.gross + bumpsGross,
      btwReversed: !applyBtw && isEuCountry(country) && isBusiness,
      noBtw: !applyBtw && !isEuCountry(country),
    };
  }, [product, selectedBumps, bumps, isBusiness, vatNumber, country, quantity, discountStatus, discountValue]);
  const totals = calculateTotals();
  // Dynamic shipping: main product OR any selected bump requires shipping
  const needsShipping = !!(product?.requiresShipping ||
    bumps.some(b => selectedBumps.includes(b.slug) && b.requiresShipping));
  // Digital book products: e-book and audiobook → require explicit waiver of right of withdrawal
  const requiresDigitalWaiver = product?.type === "book" && !needsShipping;
  // NL postcode regex: 4 digits + optional space + 2 letters
  const NL_POSTCODE_REGEX = /^\d{4}\s?[A-Za-z]{2}$/;
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setTermsError(false);
    setWaiverError(false);
    setPostalError(false);

    if (!agreedTerms) { setTermsError(true); return; }
    if (requiresDigitalWaiver && !agreedDigitalWaiver) { setWaiverError(true); return; }
    if (needsShipping && !NL_POSTCODE_REGEX.test(postalCode.trim())) {
      setPostalError(true);
      return;
    }

    setPayingMethod(selectedMethod);

    try {
      // Calculate discount amount in cents for the pending order
      let discountAmountCents: number | undefined;
      if (discountStatus === "valid" && discountValue && product) {
        const unitPrice = product.quantityTiers?.find((t) => t.quantity === quantity)?.unitPriceCents ?? product.priceCents;
        const total = unitPrice * quantity;
        discountAmountCents = discountValue.type === "percentage"
          ? Math.round(total * (discountValue.value / 100))
          : Math.min(discountValue.value, total);
      }

      const orderId = await createPendingOrder({
        email, firstName, lastName,
        phone: phone || undefined,
        product: productSlug,
        country: needsShipping ? "NL" : country,
        lang, isBusiness,
        company: isBusiness ? company : undefined,
        companyWebsite: isBusiness && companyWebsite ? companyWebsite : undefined,
        vatNumber: isBusiness ? vatNumber : undefined,
        street: needsShipping ? street : undefined,
        houseNumber: needsShipping ? houseNumber : undefined,
        postalCode: needsShipping ? postalCode : undefined,
        city: needsShipping ? city : undefined,
        quantity: quantity > 1 ? quantity : undefined,
        mailingOptIn: mailingOptIn || undefined,
        bumps: selectedBumps,
        discountCode: discountStatus === "valid" ? discountCode : undefined,
        discountAmount: discountAmountCents,
        installments: useInstallments,
        bookLang: isBook ? bookLang : undefined,
        experimentSlug: experimentSlug || undefined,
        experimentVariant: experimentVariant || undefined,
        agreedDigitalWaiver: requiresDigitalWaiver ? agreedDigitalWaiver : undefined,
      });

      // Free order (100% discount): skip Mollie, process directly, go to login
      if (totals.totalGross === 0) {
        const result = await processFreeOrder({ pendingOrderId: orderId });
        if (result.success) {
          window.location.href = `/login`;
        }
        return;
      }

      const result = await createMolliePayment({ pendingOrderId: orderId, method: selectedMethod });
      if (result.checkoutUrl) { window.location.href = result.checkoutUrl; }
    } catch (err) {
      setError(err instanceof Error ? err.message : i18n.genericError);
      setPayingMethod(null);
    }
  }

  async function handleOAuth() {
    setError("");
    // If already logged in, autofill from account
    if (currentUser) {
      if (currentUser.name && !firstName) {
        const parts = currentUser.name.split(" ");
        setFirstName(parts[0] ?? "");
        setLastName(parts.slice(1).join(" ") ?? "");
      }
      if (currentUser.email && !email) {
        setEmail(currentUser.email);
      }
      return;
    }
    // Not logged in: start Google OAuth, will redirect back to this page after login
    try {
      await signIn("google", { redirectTo: window.location.href });
    } catch {
      setError(i18n.genericError);
    }
  }

  const toggleBump = (slug: string) => {
    setSelectedBumps((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
  };
  if (!product) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-copper/30 border-t-copper rounded-full animate-spin" />
      </div>
    );
  }
  const labelClass = "text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2";
  const paymentMethods = [
    ...(country === "NL" || country === "BE" ? [{ id: "ideal", label: i18n.ideal, icon: <IdealIcon />, recommended: true }] : []),
    { id: "creditcard", label: i18n.creditCard, icon: <CreditCardIcon /> },
    { id: "applepay", label: i18n.applePay, icon: <ApplePayIcon /> },
  ];

  return (
    <>
      <ExitIntent lang={lang} show={!payingMethod} />
      <SocialProof productSlug={productSlug} lang={lang} country={country} />

      <div className="grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-14">
        <div className="space-y-8">
          <OrderSummary product={product} lang={lang} />
          <div className="hidden lg:block">
            <CheckoutReviews productType={product.type} productSlug={product.slug} lang={lang} />
          </div>
        </div>

        <div>
          {/* Checkout progress — dynamic based on form completion */}
          <div className="flex items-center gap-3 mb-6 text-[12px] text-ink/40">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            {recovered
              ? { nl: "Bijna klaar — kies je betaalmethode", en: "Almost done — choose your payment method", de: "Fast fertig — wählen Sie Ihre Zahlungsmethode" }[lang]
              : { nl: "Dit duurt nog ~1 minuut", en: "This takes ~1 minute", de: "Das dauert noch ~1 Minute" }[lang]}
            <div className="flex-1 h-1 bg-rule rounded-full overflow-hidden">
              <div className="h-full bg-copper/40 rounded-full transition-all duration-500" style={{ width: recovered ? "85%" : `${Math.min(60, [firstName, lastName, email].filter(Boolean).length * 20)}%` }} />
            </div>
          </div>
          {paymentFailed && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-[2px]">
              <p className="text-[14px] font-medium text-amber-800 mb-1">{{ nl: "Betaling niet gelukt", en: "Payment was not successful", de: "Zahlung fehlgeschlagen" }[lang]}</p>
              <p className="text-[13px] text-amber-700">{{ nl: "Geen zorgen — probeer een andere betaalmethode hieronder.", en: "No worries — try a different payment method below.", de: "Keine Sorge — probieren Sie unten eine andere Zahlungsmethode." }[lang]}</p>
            </div>
          )}
          {recovered && !recoveryOrderId && (
            <div className="mb-6 p-4 bg-copper/5 border border-copper/20 rounded-[2px]">
              <p className="text-[14px] font-medium text-ink">{{ nl: `Welkom terug, ${firstName}!`, en: `Welcome back, ${firstName}!`, de: `Willkommen zurück, ${firstName}!` }[lang]}</p>
              <p className="text-[13px] text-ink/50">{{ nl: "Je gegevens zijn al ingevuld. Kies een betaalmethode en je bent klaar.", en: "Your details are pre-filled. Choose a payment method and you're done.", de: "Ihre Daten sind bereits ausgefüllt. Wählen Sie eine Zahlungsmethode und Sie sind fertig." }[lang]}</p>
            </div>
          )}
          {recoveryOrderId && recovered && (
            <div className="mb-6 p-4 bg-copper/5 border border-copper/20 rounded-[2px]">
              <p className="text-[14px] font-medium text-ink">{{ nl: `Hoi ${firstName}, je bestelling staat klaar!`, en: `Hi ${firstName}, your order is ready!`, de: `Hallo ${firstName}, Ihre Bestellung steht bereit!` }[lang]}</p>
              <p className="text-[13px] text-ink/50">{{ nl: "Alles is al ingevuld — kies alleen je betaalmethode.", en: "Everything is pre-filled — just choose your payment method.", de: "Alles ist bereits ausgefüllt — wählen Sie nur Ihre Zahlungsmethode." }[lang]}</p>
            </div>
          )}

          {/* Book language selector */}
          {isBook && (
            <div className="mb-6 p-4 border border-rule rounded-[2px] bg-warm/20">
              <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-ink/40 mb-3">
                {{ nl: "Taal van het boek", en: "Book language", de: "Buchsprache" }[lang]}
              </p>
              <div className="flex gap-2">
                {(["nl", "en", "de"] as const).map((bl) => {
                  const available = availableBookLangs.includes(bl);
                  const label = { nl: "Nederlands", en: "English", de: "Deutsch" }[bl];
                  const selected = bookLang === bl;
                  return (
                    <button
                      key={bl}
                      type="button"
                      disabled={!available}
                      onClick={() => available && setBookLang(bl)}
                      className={`px-4 py-2 text-[13px] rounded-[2px] transition-colors cursor-pointer ${
                        selected
                          ? "bg-copper text-paper font-medium"
                          : available
                            ? "bg-paper border border-rule text-ink/60 hover:border-copper"
                            : "bg-ink/5 text-ink/20 cursor-not-allowed"
                      }`}
                    >
                      {label}
                      {!available && <span className="block text-[10px]">{{ nl: "binnenkort", en: "soon", de: "bald" }[lang]}</span>}
                    </button>
                  );
                })}
              </div>
              {!bookLangAvailable && (
                <p className="text-[12px] text-amber-700 mt-2">
                  {{ nl: "Dit boek is momenteel alleen beschikbaar in het Nederlands.", en: "This book is currently only available in Dutch.", de: "Dieses Buch ist derzeit nur auf Niederländisch verfügbar." }[lang]}
                </p>
              )}
              {bookLang !== lang && bookLangAvailable && (
                <p className="text-[12px] text-ink/40 mt-2">
                  {{ nl: `Je ontvangt het boek in het ${({ nl: "Nederlands", en: "Engels", de: "Duits" } as Record<string, string>)[bookLang]}.`, en: `You will receive the book in ${({ nl: "Dutch", en: "English", de: "German" } as Record<string, string>)[bookLang]}.`, de: `Sie erhalten das Buch auf ${({ nl: "Niederländisch", en: "Englisch", de: "Deutsch" } as Record<string, string>)[bookLang]}.` }[lang]}
                </p>
              )}
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            <CheckoutForm
              product={product}
              bumps={bumps}
              lang={lang}
              needsShipping={needsShipping}
              firstName={firstName} setFirstName={setFirstName}
              lastName={lastName} setLastName={setLastName}
              email={email} setEmail={setEmail}
              phone={phone} setPhone={setPhone}
              country={country} setCountry={setCountry}
              isBusiness={isBusiness} setIsBusiness={setIsBusiness}
              company={company} setCompany={setCompany}
              companyWebsite={companyWebsite} setCompanyWebsite={setCompanyWebsite}
              vatNumber={vatNumber} setVatNumber={setVatNumber}
              street={street} setStreet={setStreet}
              houseNumber={houseNumber} setHouseNumber={setHouseNumber}
              postalCode={postalCode} setPostalCode={(v) => { setPostalCode(v); setPostalError(false); }}
              city={city} setCity={setCity}
              postalError={postalError}
              selectedBumps={selectedBumps} onToggleBump={toggleBump}
              useInstallments={useInstallments} setUseInstallments={setUseInstallments}
              discountCode={discountCode} setDiscountCode={setDiscountCode}
              discountOpen={discountOpen} setDiscountOpen={setDiscountOpen}
              discountStatus={discountStatus} discountValue={discountValue}
              setDiscountStatus={setDiscountStatus} setDiscountValue={setDiscountValue}
              quantity={quantity} setQuantity={setQuantity}
              quantityTiers={product.quantityTiers}
              onOAuth={handleOAuth}
            />

            {/* Payment method selection — hidden for free orders */}
            {totals.totalGross > 0 && (
              <div className="border-t border-rule pt-5">
                <p className={labelClass}>{i18n.paymentMethod}</p>
                <div className="space-y-2">
                  {paymentMethods.map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setSelectedMethod(pm.id)}
                      className={`flex items-center gap-3 w-full border py-3 px-4 text-[14px] transition-colors rounded-[2px] cursor-pointer ${
                        selectedMethod === pm.id
                          ? "border-copper bg-copper/5 text-ink"
                          : "border-rule text-ink/60 hover:border-ink/30"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        selectedMethod === pm.id ? "border-copper" : "border-ink/20"
                      }`}>
                        {selectedMethod === pm.id && <div className="w-2 h-2 rounded-full bg-copper" />}
                      </div>
                      {pm.icon}
                      <span className="flex-1 text-left">{pm.label}</span>
                      {pm.recommended && (
                        <span className="text-[10px] text-copper font-medium tracking-[0.1em] uppercase">
                          {{ nl: "Aanbevolen", en: "Recommended", de: "Empfohlen" }[lang]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Terms + mailing opt-in + digital waiver */}
            <div className="space-y-3">
              <label className={`flex items-start gap-3 cursor-pointer group ${termsError ? "text-red-600" : ""}`}>
                <input type="checkbox" checked={agreedTerms} onChange={(e) => { setAgreedTerms(e.target.checked); setTermsError(false); }} className={`w-4 h-4 mt-0.5 accent-copper cursor-pointer shrink-0 ${termsError ? "outline outline-2 outline-red-400" : ""}`} />
                <span className={`text-[13px] leading-[1.5] ${termsError ? "text-red-600" : "text-ink/60 group-hover:text-ink"} transition-colors`}>
                  {i18n.agreeTerms}{" "}
                  <a href="/algemene-voorwaarden" target="_blank" className="text-copper underline hover:text-copper-light">{i18n.termsLink}</a>.
                </span>
              </label>
              {termsError && <p className="text-[12px] text-red-500 pl-7">{i18n.agreeTermsRequired}</p>}

              {requiresDigitalWaiver && (
                <>
                  <label className={`flex items-start gap-3 cursor-pointer group ${waiverError ? "text-red-600" : ""}`}>
                    <input type="checkbox" checked={agreedDigitalWaiver} onChange={(e) => { setAgreedDigitalWaiver(e.target.checked); setWaiverError(false); }} className={`w-4 h-4 mt-0.5 accent-copper cursor-pointer shrink-0 ${waiverError ? "outline outline-2 outline-red-400" : ""}`} />
                    <span className={`text-[13px] leading-[1.5] ${waiverError ? "text-red-600" : "text-ink/60 group-hover:text-ink"} transition-colors`}>
                      {i18n.digitalWaiver}
                    </span>
                  </label>
                  {waiverError && <p className="text-[12px] text-red-500 pl-7">{i18n.digitalWaiverRequired}</p>}
                </>
              )}

              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={mailingOptIn} onChange={(e) => setMailingOptIn(e.target.checked)} className="w-4 h-4 mt-0.5 accent-copper cursor-pointer shrink-0" />
                <span className="text-[13px] text-ink/40 group-hover:text-ink/60 transition-colors leading-[1.5]">{i18n.mailingOptIn}</span>
              </label>
            </div>

            <CheckoutTotals
              totals={totals}
              productShortName={product.shortName}
              selectedBumps={selectedBumps}
              bumps={bumps}
              discountStatus={discountStatus}
              discountValue={discountValue}
              lang={lang}
              payingMethod={payingMethod}
              showDirectAccess={!needsShipping}
              error={error}
              ctaText={totals.totalGross === 0 ? { nl: "Bestelling afronden", en: "Complete order", de: "Bestellung abschließen" }[lang] : undefined}
            />
          </form>

          <TrustBadges lang={lang} />
        </div>

        {/* Reviews: mobile only */}
        <div className="lg:hidden">
          <CheckoutReviews productType={product.type} productSlug={product.slug} lang={lang} />
        </div>
      </div>
    </>
  );
}
