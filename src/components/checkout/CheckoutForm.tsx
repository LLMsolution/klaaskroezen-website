"use client";

import { t, type Lang } from "@/lib/checkout-i18n";
import {
  formatPrice,
  isEuCountry,
  type BumpConfig,
  type CheckoutProduct,
  type QuantityTier,
} from "@/lib/checkout-config";
import { OrderBump } from "./OrderBump";
import { QuantitySelector } from "./QuantitySelector";

interface Props {
  product: CheckoutProduct;
  bumps: BumpConfig[];
  lang: Lang;
  needsShipping: boolean;
  // Form state
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  isBusiness: boolean;
  setIsBusiness: (v: boolean) => void;
  company: string;
  setCompany: (v: string) => void;
  companyWebsite: string;
  setCompanyWebsite: (v: string) => void;
  vatNumber: string;
  setVatNumber: (v: string) => void;
  // Shipping
  street: string;
  setStreet: (v: string) => void;
  houseNumber: string;
  setHouseNumber: (v: string) => void;
  postalCode: string;
  setPostalCode: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  // Extras
  selectedBumps: string[];
  onToggleBump: (slug: string) => void;
  useInstallments: boolean;
  setUseInstallments: (v: boolean) => void;
  discountCode: string;
  setDiscountCode: (v: string) => void;
  discountOpen: boolean;
  setDiscountOpen: (v: boolean) => void;
  discountStatus: "idle" | "valid" | "invalid" | "expired" | "maxed" | "wrong_product";
  discountValue: { type: "percentage" | "fixed"; value: number } | null;
  setDiscountStatus: (v: "idle" | "valid" | "invalid" | "expired" | "maxed" | "wrong_product") => void;
  setDiscountValue: (v: { type: "percentage" | "fixed"; value: number } | null) => void;
  quantity: number;
  setQuantity: (v: number) => void;
  quantityTiers?: QuantityTier[];
  // OAuth
  onOAuth: () => void;
}

const baseInput = "w-full border px-4 py-3 text-[15px] text-ink placeholder:text-ink/30 focus:border-copper focus:outline-none transition-all duration-200 rounded-[2px]";
const fieldClass = (value: string) =>
  value.trim()
    ? `${baseInput} bg-warm/30 border-warm`
    : `${baseInput} bg-transparent border-rule`;

const baseSelect = "w-full border px-4 py-3 text-[15px] text-ink focus:border-copper focus:outline-none transition-all duration-200 rounded-[2px] appearance-none bg-no-repeat bg-[right_16px_center] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%230E0C0A%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')]";
const selectFieldClass = (value: string) =>
  value.trim()
    ? `${baseSelect} bg-warm/30 border-warm`
    : `${baseSelect} bg-transparent border-rule`;

const labelClass = "text-[10px] font-medium tracking-[0.2em] uppercase text-ink/50 block mb-2";

export function CheckoutForm(props: Props) {
  const {
    product, bumps, lang, needsShipping,
    firstName, setFirstName, lastName, setLastName,
    email, setEmail, phone, setPhone,
    country, setCountry,
    isBusiness, setIsBusiness, company, setCompany, companyWebsite, setCompanyWebsite, vatNumber, setVatNumber,
    street, setStreet, houseNumber, setHouseNumber, postalCode, setPostalCode, city, setCity,
    selectedBumps, onToggleBump,
    useInstallments, setUseInstallments,
    discountCode, setDiscountCode, discountOpen, setDiscountOpen,
    discountStatus, discountValue, setDiscountStatus, setDiscountValue,
    quantity, setQuantity, quantityTiers,
    onOAuth,
  } = props;
  const i18n = t(lang);

  return (
    <>
      {/* Name */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className={labelClass}>{i18n.firstName}</label>
          <input id="firstName" name="firstName" autoComplete="given-name" type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={i18n.firstNamePlaceholder} className={fieldClass(firstName)} />
        </div>
        <div>
          <label htmlFor="lastName" className={labelClass}>{i18n.lastName}</label>
          <input id="lastName" name="lastName" autoComplete="family-name" type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={i18n.lastNamePlaceholder} className={fieldClass(lastName)} />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClass}>{i18n.email}</label>
        <input id="email" name="email" autoComplete="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={i18n.emailPlaceholder} className={fieldClass(email)} />
      </div>

      {/* Google autofill */}
      <button type="button" onClick={onOAuth} className="flex items-center justify-center gap-2 w-full border border-rule py-2.5 text-[12px] text-ink/40 hover:border-ink/30 hover:text-ink/60 transition-colors rounded-[2px] cursor-pointer">
        <svg width="14" height="14" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {{ nl: "of vul in via Google", en: "or autofill with Google", de: "oder automatisch mit Google ausfüllen" }[lang]}
      </button>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className={labelClass}>
          {i18n.phone} <span className="text-ink/25 normal-case tracking-normal">({i18n.phoneOptional})</span>
        </label>
        <input id="phone" name="phone" autoComplete="tel" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={i18n.phonePlaceholder} className={fieldClass(phone)} />
      </div>

      {/* Country */}
      <div>
        <label htmlFor="country" className={labelClass}>{i18n.country}</label>
        <select id="country" name="country" autoComplete="country" value={country} onChange={(e) => setCountry(e.target.value)} className={selectFieldClass(country)}>
          {Object.entries(i18n.countries).map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>
      </div>

      {/* Shipping address */}
      {needsShipping && (
        <div className="space-y-4">
          <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">{i18n.shippingAddress}</p>
          <div className="grid grid-cols-[1fr_100px] gap-3">
            <div>
              <label htmlFor="street" className={labelClass}>{i18n.street}</label>
              <input id="street" name="street" autoComplete="street-address" type="text" required value={street} onChange={(e) => setStreet(e.target.value)} placeholder={i18n.streetPlaceholder} className={fieldClass(street)} />
            </div>
            <div>
              <label htmlFor="houseNumber" className={labelClass}>{i18n.houseNumber}</label>
              <input id="houseNumber" name="houseNumber" autoComplete="off" type="text" required value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} placeholder={i18n.houseNumberPlaceholder} className={fieldClass(houseNumber)} />
            </div>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-3">
            <div>
              <label htmlFor="postalCode" className={labelClass}>{i18n.postalCode}</label>
              <input id="postalCode" name="postalCode" autoComplete="postal-code" type="text" required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder={i18n.postalCodePlaceholder} className={fieldClass(postalCode)} />
            </div>
            <div>
              <label htmlFor="city" className={labelClass}>{i18n.city}</label>
              <input id="city" name="city" autoComplete="address-level2" type="text" required value={city} onChange={(e) => setCity(e.target.value)} placeholder={i18n.cityPlaceholder} className={fieldClass(city)} />
            </div>
          </div>
        </div>
      )}

      {/* Business toggle */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <input type="checkbox" checked={isBusiness} onChange={(e) => setIsBusiness(e.target.checked)} className="w-4 h-4 accent-copper cursor-pointer" />
        <span className="text-[13px] text-ink/60 group-hover:text-ink transition-colors">{i18n.businessPurchase}</span>
      </label>

      {isBusiness && (
        <div className="space-y-4 pl-7 border-l-2 border-copper/20">
          <div>
            <label htmlFor="company" className={labelClass}>{i18n.companyName}</label>
            <input id="company" name="organization" autoComplete="organization" type="text" required={isBusiness} value={company} onChange={(e) => setCompany(e.target.value)} placeholder={i18n.companyPlaceholder} className={fieldClass(company)} />
          </div>
          <div>
            <label htmlFor="companyWebsite" className={labelClass}>{i18n.companyWebsite ?? "Website"}</label>
            <input id="companyWebsite" name="url" autoComplete="url" type="url" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} placeholder="https://..." className={fieldClass(companyWebsite)} />
          </div>
          <div>
            <label htmlFor="vatNumber" className={labelClass}>{i18n.vatNumber}</label>
            <input id="vatNumber" type="text" value={vatNumber} onChange={(e) => setVatNumber(e.target.value)} placeholder={i18n.vatPlaceholder} className={fieldClass(vatNumber)} />
            {vatNumber && isEuCountry(country) && country !== "NL" && (
              <p className="text-[12px] text-copper mt-1">{i18n.btwReversed}</p>
            )}
          </div>
        </div>
      )}

      {/* Quantity tiers */}
      {quantityTiers && (
        <QuantitySelector tiers={quantityTiers} selected={quantity} onChange={setQuantity} lang={lang} />
      )}

      {/* Order bumps + bundle discount */}
      {bumps.length > 0 && (
        <div className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-copper">{i18n.addToOrder}</p>
            {selectedBumps.length >= 2 && (
              <span className="text-[11px] font-medium text-green-600 animate-[fadeIn_0.3s_ease-out]">
                {{ nl: "Bundelkorting actief!", en: "Bundle discount active!", de: "Bündelrabatt aktiv!" }[lang]}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {bumps.map((bump) => (
              <OrderBump key={bump.slug} bump={bump} lang={lang} selected={selectedBumps.includes(bump.slug)} onToggle={() => onToggleBump(bump.slug)} />
            ))}
          </div>
          {bumps.length >= 2 && selectedBumps.length < 2 && (
            <p className="text-[11px] text-ink/35 mt-2">
              {{ nl: "Selecteer 2+ add-ons voor 15% bundelkorting", en: "Select 2+ add-ons for 15% bundle discount", de: "Wählen Sie 2+ Add-ons für 15% Bündelrabatt" }[lang]}
            </p>
          )}
        </div>
      )}

      {/* Installments */}
      {product.installments && (
        <label className="flex items-center gap-3 cursor-pointer group">
          <input type="checkbox" checked={useInstallments} onChange={(e) => setUseInstallments(e.target.checked)} className="w-4 h-4 accent-copper cursor-pointer" />
          <span className="text-[13px] text-ink/60 group-hover:text-ink transition-colors">
            {i18n.payInInstallments} ({product.installments.count}x {formatPrice(product.installments.amountPerTermCents, lang)})
          </span>
        </label>
      )}

      {/* Discount code */}
      <div>
        {!discountOpen ? (
          <button type="button" onClick={() => setDiscountOpen(true)} className="text-[13px] text-ink/40 hover:text-copper transition-colors cursor-pointer">
            {i18n.discountToggle}
          </button>
        ) : (
          <input
            type="text"
            value={discountCode}
            onChange={(e) => {
              setDiscountCode(e.target.value.toUpperCase());
              if (e.target.value.length < 3) { setDiscountStatus("idle"); setDiscountValue(null); }
            }}
            placeholder={i18n.discountPlaceholder}
            className={`w-full bg-transparent border px-3 py-2.5 text-[14px] text-ink font-mono tracking-wider placeholder:text-ink/30 focus:outline-none rounded-[2px] transition-colors ${
              discountStatus === "valid" ? "border-green-400" : discountStatus !== "idle" ? "border-red-300" : "border-rule focus:border-copper"
            }`}
          />
        )}
        {discountStatus === "valid" && (
          <p className="text-[12px] text-green-600 mt-1.5 flex items-center gap-1">
            <span>&#10003;</span> {i18n.discountApplied}
            {discountValue && <span className="text-ink/40 ml-1">({discountValue.type === "percentage" ? `${discountValue.value}%` : formatPrice(discountValue.value, lang)})</span>}
          </p>
        )}
        {discountStatus === "invalid" && <p className="text-[12px] text-red-500 mt-1.5">{i18n.discountInvalid}</p>}
        {discountStatus === "expired" && <p className="text-[12px] text-red-500 mt-1.5">{i18n.discountExpired}</p>}
        {discountStatus === "maxed" && <p className="text-[12px] text-red-500 mt-1.5">{i18n.discountMaxed}</p>}
        {discountStatus === "wrong_product" && <p className="text-[12px] text-red-500 mt-1.5">{i18n.discountWrongProduct}</p>}
      </div>
    </>
  );
}
