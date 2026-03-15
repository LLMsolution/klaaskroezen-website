"use client";

import { useState, useEffect, useCallback, useId } from "react";
import { useMutation, useAction } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  getProduct,
  getBumpsForProduct,
  getQuantityTiers,
  formatPrice,
  calculateBtw,
  isEuCountry,
} from "@/lib/checkout-config";
import { t, type Lang } from "@/lib/checkout-i18n";
import { OrderSummary } from "./OrderSummary";
import { OrderBump } from "./OrderBump";
import { QuantitySelector } from "./QuantitySelector";
import { TrustBadges } from "./TrustBadges";
import { ExitIntent } from "./ExitIntent";
import { SocialProof } from "./SocialProof";

type Step = 1 | 2;

interface Props {
  productSlug: string;
  lang: Lang;
}

export function CheckoutClient({ productSlug, lang }: Props) {
  const product = getProduct(productSlug)!;
  const bumps = getBumpsForProduct(productSlug);
  const quantityTiers = getQuantityTiers(productSlug);
  const i18n = t(lang);
  const formId = useId();

  const { signIn } = useAuthActions();
  const createPendingOrder = useMutation(api.checkout.createPendingOrder);
  const createMolliePayment = useAction(api.mollie.createMolliePayment);

  // Form state
  const [step, setStep] = useState<Step>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("NL");
  const [isBusiness, setIsBusiness] = useState(false);
  const [company, setCompany] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [selectedBumps, setSelectedBumps] = useState<string[]>([]);
  const [useInstallments, setUseInstallments] = useState(false);
  const [discountCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<Id<"pendingOrders"> | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Tab title change on visibility change
  useEffect(() => {
    const originalTitle = document.title;
    function handleVisibility() {
      if (document.hidden) {
        document.title =
          lang === "nl"
            ? "⏳ Vergeet je bestelling niet!"
            : "⏳ Don't forget your order!";
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
    const btwRate = product.btwRate;
    let applyBtw = true;

    // EU business with VAT number: reverse charge
    if (isBusiness && vatNumber && isEuCountry(country) && country !== "NL") {
      applyBtw = false;
    }
    // Outside EU: no BTW
    if (!isEuCountry(country)) {
      applyBtw = false;
    }

    // Use tier price if quantity tiers exist
    const unitPrice = quantityTiers
      ? (quantityTiers.find((t) => t.quantity === quantity)?.unitPriceCents ?? product.price)
      : product.price;
    const mainCalc = calculateBtw(
      unitPrice * quantity,
      applyBtw ? btwRate : 0,
      product.priceInclBtw,
    );

    let bumpsNet = 0;
    let bumpsBtw = 0;
    let bumpsGross = 0;
    for (const bumpSlug of selectedBumps) {
      const bumpProduct = getProduct(bumpSlug);
      if (bumpProduct) {
        const bc = calculateBtw(
          bumpProduct.price,
          applyBtw ? bumpProduct.btwRate : 0,
          bumpProduct.priceInclBtw,
        );
        bumpsNet += bc.net;
        bumpsBtw += bc.btw;
        bumpsGross += bc.gross;
      }
    }

    return {
      productNet: mainCalc.net,
      productBtw: mainCalc.btw,
      productGross: mainCalc.gross,
      bumpsNet,
      bumpsBtw,
      bumpsGross,
      totalNet: mainCalc.net + bumpsNet,
      totalBtw: mainCalc.btw + bumpsBtw,
      totalGross: mainCalc.gross + bumpsGross,
      btwReversed: !applyBtw && isEuCountry(country) && isBusiness,
      noBtw: !applyBtw && !isEuCountry(country),
    };
  }, [product, selectedBumps, isBusiness, vatNumber, country, quantity, quantityTiers]);

  const totals = calculateTotals();

  // Step 1 submit — save pending order + move to step 2
  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const id = await createPendingOrder({
        email,
        firstName,
        lastName,
        product: productSlug,
        country,
        lang,
        isBusiness,
        company: isBusiness ? company : undefined,
        vatNumber: isBusiness ? vatNumber : undefined,
        bumps: selectedBumps,
        discountCode: discountCode || undefined,
        installments: useInstallments,
      });
      setOrderId(id);
      setStep(2);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : i18n.genericError,
      );
    } finally {
      setLoading(false);
    }
  }

  // Step 2 — initiate payment via Mollie
  async function handlePayment(method: string) {
    if (!orderId) return;
    setError("");
    setLoading(true);
    try {
      const result = await createMolliePayment({
        pendingOrderId: orderId,
        method,
      });
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : i18n.paymentFailed,
      );
    } finally {
      setLoading(false);
    }
  }

  // Social login handler (fills form fields, stays on checkout)
  async function handleOAuth(provider: "google" | "apple") {
    setError("");
    try {
      await signIn(provider);
    } catch {
      setError(i18n.genericError);
    }
  }

  const toggleBump = (slug: string) => {
    setSelectedBumps((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug],
    );
  };

  const inputClass =
    "w-full bg-transparent border border-rule px-4 py-3 text-[15px] text-ink placeholder:text-ink/30 focus:border-copper focus:outline-none transition-colors rounded-[2px]";

  const labelClass =
    "text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2";

  const selectClass =
    "w-full bg-transparent border border-rule px-4 py-3 text-[15px] text-ink focus:border-copper focus:outline-none transition-colors rounded-[2px] appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%230E0C0A%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_16px_center]";

  return (
    <>
      <ExitIntent lang={lang} show={step === 1} />
      <SocialProof productSlug={productSlug} lang={lang} />

      <div className="grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-14">
        {/* ─── Left column: Order Summary ─── */}
        <div className="order-2 lg:order-1">
          <OrderSummary
            product={product}
            lang={lang}
            selectedBumps={selectedBumps}
            totals={totals}
          />
        </div>

        {/* ─── Right column: Form ─── */}
        <div className="order-1 lg:order-2">
          {/* Step indicators */}
          <div className="flex items-center gap-3 mb-8">
            <StepIndicator
              number={1}
              label={i18n.yourDetails}
              active={step === 1}
              completed={step > 1}
            />
            <div className="flex-1 h-px bg-rule" />
            <StepIndicator
              number={2}
              label={i18n.payment}
              active={step === 2}
              completed={false}
            />
          </div>

          {/* ─── Step 1: Details ─── */}
          {step === 1 && (
            <form id={formId} onSubmit={handleStep1} className="space-y-5">
              {/* Quick social login */}
              <div className="space-y-3">
                <p className="text-[12px] text-ink/40 tracking-[0.05em] uppercase text-center">
                  {i18n.orLoginWith}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleOAuth("google")}
                    className="flex items-center justify-center gap-2.5 border border-rule py-3 text-[13px] font-medium text-ink/70 hover:border-ink/30 hover:text-ink transition-colors rounded-[2px] cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuth("apple")}
                    className="flex items-center justify-center gap-2.5 border border-rule py-3 text-[13px] font-medium text-ink/70 hover:border-ink/30 hover:text-ink transition-colors rounded-[2px] cursor-pointer"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                    Apple
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 py-1">
                  <div className="flex-1 h-px bg-rule" />
                  <span className="text-[11px] text-ink/30 tracking-[0.15em] uppercase">
                    {lang === "nl" ? "of vul je gegevens in" : "or fill in your details"}
                  </span>
                  <div className="flex-1 h-px bg-rule" />
                </div>
              </div>

              {/* Name fields — side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className={labelClass}>
                    {i18n.firstName}
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={i18n.firstNamePlaceholder}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className={labelClass}>
                    {i18n.lastName}
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={i18n.lastNamePlaceholder}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className={labelClass}>
                  {i18n.email}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={i18n.emailPlaceholder}
                  className={inputClass}
                />
              </div>

              {/* Country */}
              <div>
                <label htmlFor="country" className={labelClass}>
                  {i18n.country}
                </label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={selectClass}
                >
                  {Object.entries(i18n.countries).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Business toggle */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isBusiness}
                  onChange={(e) => setIsBusiness(e.target.checked)}
                  className="w-4 h-4 accent-copper cursor-pointer"
                />
                <span className="text-[13px] text-ink/60 group-hover:text-ink transition-colors">
                  {i18n.businessPurchase}
                </span>
              </label>

              {/* Business fields */}
              {isBusiness && (
                <div className="space-y-4 pl-7 border-l-2 border-copper/20">
                  <div>
                    <label htmlFor="company" className={labelClass}>
                      {i18n.companyName}
                    </label>
                    <input
                      id="company"
                      type="text"
                      required={isBusiness}
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder={i18n.companyPlaceholder}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="vatNumber" className={labelClass}>
                      {i18n.vatNumber}
                    </label>
                    <input
                      id="vatNumber"
                      type="text"
                      value={vatNumber}
                      onChange={(e) => setVatNumber(e.target.value)}
                      placeholder={i18n.vatPlaceholder}
                      className={inputClass}
                    />
                    {vatNumber && isEuCountry(country) && country !== "NL" && (
                      <p className="text-[12px] text-copper mt-1">
                        {i18n.btwReversed}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Quantity tiers */}
              {quantityTiers && (
                <QuantitySelector
                  tiers={quantityTiers}
                  selected={quantity}
                  onChange={setQuantity}
                  lang={lang}
                />
              )}

              {/* Order bumps */}
              {bumps.length > 0 && (
                <div className="pt-4">
                  <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper mb-3">
                    {i18n.addToOrder}
                  </p>
                  <div className="space-y-3">
                    {bumps.map((bump) => (
                      <OrderBump
                        key={bump.slug}
                        bump={bump}
                        lang={lang}
                        selected={selectedBumps.includes(bump.slug)}
                        onToggle={() => toggleBump(bump.slug)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Installments toggle (trainings only) */}
              {product.installments && (
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={useInstallments}
                    onChange={(e) => setUseInstallments(e.target.checked)}
                    className="w-4 h-4 accent-copper cursor-pointer"
                  />
                  <span className="text-[13px] text-ink/60 group-hover:text-ink transition-colors">
                    {i18n.payInInstallments} ({product.installments.count}x{" "}
                    {formatPrice(product.installments.amountPerTerm, lang)})
                  </span>
                </label>
              )}

              {/* Submit step 1 */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-copper text-paper py-4 text-[13px] font-medium tracking-[0.1em] uppercase hover:bg-copper-light transition-colors rounded-[2px] cursor-pointer disabled:opacity-50"
              >
                {loading ? i18n.processing : i18n.almostThere}
              </button>

              {error && (
                <p className="text-[13px] text-red-600 text-center">{error}</p>
              )}
            </form>
          )}

          {/* ─── Step 2: Payment ─── */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Order total */}
              <div className="bg-warm/50 border border-rule rounded-[2px] p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[13px] text-ink/60">{i18n.subtotal}</span>
                  <span className="text-[15px] text-ink">
                    {formatPrice(totals.totalNet, lang)}
                  </span>
                </div>
                {totals.btwReversed ? (
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[13px] text-ink/60">{i18n.btw}</span>
                    <span className="text-[13px] text-copper">{i18n.btwReversed}</span>
                  </div>
                ) : totals.noBtw ? (
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[13px] text-ink/60">{i18n.btw}</span>
                    <span className="text-[13px] text-ink/40">{i18n.noBtw}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[13px] text-ink/60">{i18n.btw} (21%)</span>
                    <span className="text-[15px] text-ink">
                      {formatPrice(totals.totalBtw, lang)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-rule">
                  <span className="text-[15px] font-medium text-ink">
                    {i18n.total}
                  </span>
                  <span className="font-display text-[22px] font-bold text-ink">
                    {formatPrice(totals.totalGross, lang)}
                  </span>
                </div>
                {useInstallments && product.installments && (
                  <p className="text-[12px] text-ink/50 mt-2">
                    {product.installments.count}x{" "}
                    {formatPrice(product.installments.amountPerTerm, lang)}/
                    {lang === "nl" ? "mnd" : "mo"}
                  </p>
                )}
              </div>

              {/* Payment methods */}
              <div>
                <p className={labelClass}>{i18n.paymentMethod}</p>
                <div className="space-y-2">
                  {/* iDEAL — only for NL/BE */}
                  {(country === "NL" || country === "BE") && (
                    <PaymentButton
                      icon={<IdealIcon />}
                      label={i18n.ideal}
                      onClick={() => handlePayment("ideal")}
                      recommended
                    />
                  )}
                  <PaymentButton
                    icon={<CreditCardIcon />}
                    label={i18n.creditCard}
                    onClick={() => handlePayment("creditcard")}
                  />
                  <PaymentButton
                    icon={<ApplePayIcon />}
                    label={i18n.applePay}
                    onClick={() => handlePayment("applepay")}
                  />
                </div>
              </div>

              {/* Back to step 1 */}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-[13px] text-ink/50 hover:text-ink transition-colors cursor-pointer"
              >
                ← {lang === "nl" ? "Terug naar gegevens" : "Back to details"}
              </button>

              {error && (
                <p className="text-[13px] text-red-600 text-center">{error}</p>
              )}
            </div>
          )}

          {/* Trust badges — always visible */}
          <TrustBadges lang={lang} />
        </div>
      </div>
    </>
  );
}

/* ─── Sub-components ─── */

function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-medium transition-colors ${
          active
            ? "bg-copper text-paper"
            : completed
              ? "bg-copper/20 text-copper"
              : "bg-rule text-ink/30"
        }`}
      >
        {completed ? "✓" : number}
      </div>
      <span
        className={`text-[13px] font-medium transition-colors ${
          active ? "text-ink" : "text-ink/30"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function PaymentButton({
  icon,
  label,
  onClick,
  recommended,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  recommended?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 w-full border py-3.5 px-4 text-[14px] text-ink/80 hover:border-ink/30 hover:text-ink transition-colors rounded-[2px] cursor-pointer ${
        recommended ? "border-copper bg-copper/5" : "border-rule"
      }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {recommended && (
        <span className="text-[10px] text-copper font-medium tracking-[0.1em] uppercase">
          Aanbevolen
        </span>
      )}
    </button>
  );
}

function IdealIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="4" fill="#CC0066" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill="white"
        fontSize="9"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        iDEAL
      </text>
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-ink/50"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  );
}

function ApplePayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-ink/70">
      <path d="M17.05 14.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 9.25 3.51 3.59 9.05 3.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09z" />
    </svg>
  );
}
