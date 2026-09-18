"use client";

import { useEffect, useRef, useState, type ChangeEvent, type ComponentProps, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { useTrip } from "@/components/TripContext";
import {
  formatRange,
  money,
  resolveStops,
  tripCountriesLabel,
  tripRange,
  tripTotals,
  type ResolvedStop,
  type TripTotals,
} from "@/lib/trip";
import OrderSummary from "./OrderSummary";
import { FlowSteps, LockIcon } from "./shared";

/* ------------------------------------------------------------------ */
/*  Card helpers — pure and deterministic (no Date.now anywhere)        */
/* ------------------------------------------------------------------ */

type Brand = "visa" | "mastercard" | "amex";

const BRAND_IDS: Brand[] = ["visa", "mastercard", "amex"];

/* Well-known test numbers; every one of them passes Luhn. */
const BRANDS: Record<Brand, { label: string; sample: string; sampleCvc: string }> = {
  visa: { label: "Visa", sample: "4242 4242 4242 4242", sampleCvc: "123" },
  mastercard: { label: "Mastercard", sample: "5555 5555 5555 4444", sampleCvc: "123" },
  amex: { label: "Amex", sample: "3782 822463 10005", sampleCvc: "1234" },
};

/* Expiry is checked against a fixed month so server and client agree and the demo never rots. */
const TODAY = { year: 2026, month: 9 };

const digitsOnly = (s: string) => s.replace(/\D/g, "");

const cvcLength = (brand: Brand) => (brand === "amex" ? 4 : 3);

function detectBrand(digits: string): Brand | null {
  if (digits.startsWith("4")) return "visa";
  if (digits.startsWith("5")) return "mastercard";
  if (digits.startsWith("3")) return "amex";
  return null;
}

/** Groups of 4, or 4-6-5 for Amex. */
function formatCardNumber(digits: string, brand: Brand) {
  if (brand === "amex") {
    const d = digits.slice(0, 15);
    return [d.slice(0, 4), d.slice(4, 10), d.slice(10)].filter(Boolean).join(" ");
  }
  return digits.slice(0, 16).replace(/(.{4})(?=.)/g, "$1 ");
}

function luhn(digits: string) {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits.charCodeAt(i) - 48;
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

function cardNumberValid(digits: string, brand: Brand) {
  return digits.length === (brand === "amex" ? 15 : 16) && luhn(digits);
}

/** "MM / YY" as the user types: "9" → "09 / ", "13" → "01 / 3". */
function formatExpiry(raw: string, previous: string) {
  let d = digitsOnly(raw).slice(0, 4);
  if (d.length === 1 && d > "1") d = `0${d}`;
  if (d.length >= 2 && Number(d.slice(0, 2)) > 12) d = `0${d[0]}${d.slice(1)}`.slice(0, 4);
  if (d.length > 2) return `${d.slice(0, 2)} / ${d.slice(2)}`;
  /* Add the separator while typing forward, not while deleting back through it. */
  if (d.length === 2 && raw.length > previous.length) return `${d} / `;
  return d;
}

function expiryState(value: string): "ok" | "invalid" | "past" {
  const d = digitsOnly(value);
  if (d.length !== 4) return "invalid";
  const month = Number(d.slice(0, 2));
  const year = 2000 + Number(d.slice(2));
  if (month < 1 || month > 12) return "invalid";
  return year * 12 + month >= TODAY.year * 12 + TODAY.month ? "ok" : "past";
}

/* ------------------------------------------------------------------ */
/*  Form model                                                         */
/* ------------------------------------------------------------------ */

const COUNTRIES = ["United States", "United Kingdom", "Italy", "France", "Germany", "Spain", "Japan", "Australia", "Canada", "Other"];

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  brand: Brand;
  cardNumber: string;
  expiry: string;
  cvc: string;
  nameOnCard: string;
  country: string;
  agree: boolean;
  requests: string;
}

/* Obviously-test data so the demo can be paid in one click. */
const INITIAL: FormValues = {
  firstName: "Dan",
  lastName: "Journey",
  email: "dan@journey.example",
  phone: "+1 555 010 2030",
  brand: "visa",
  cardNumber: BRANDS.visa.sample,
  expiry: "12 / 29",
  cvc: BRANDS.visa.sampleCvc,
  nameOnCard: "Dan Journey",
  country: "United States",
  agree: true,
  requests: "",
};

type FieldKey = Exclude<keyof FormValues, "brand" | "requests">;
type Errors = Partial<Record<FieldKey, string>>;

/* Document order, so the first invalid field is the one that receives focus. */
const FIELD_ORDER: FieldKey[] = ["firstName", "lastName", "email", "phone", "cardNumber", "expiry", "cvc", "nameOnCard", "country", "agree"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(v: FormValues): Errors {
  const e: Errors = {};
  if (!v.firstName.trim()) e.firstName = "Enter your first name";
  if (!v.lastName.trim()) e.lastName = "Enter your last name";
  if (!v.email.trim()) e.email = "Enter your email address";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "That email address doesn't look right";
  if (digitsOnly(v.phone).length < 7) e.phone = "Enter a phone number we can reach you on";
  if (!cardNumberValid(digitsOnly(v.cardNumber), v.brand)) e.cardNumber = "That card number doesn't look right";
  const exp = expiryState(v.expiry);
  if (exp === "invalid") e.expiry = "Enter the expiry as MM / YY";
  else if (exp === "past") e.expiry = "This card has expired";
  if (v.cvc.length !== cvcLength(v.brand)) e.cvc = `Enter the ${cvcLength(v.brand)}-digit security code`;
  if (!v.nameOnCard.trim()) e.nameOnCard = "Enter the name on the card";
  if (!v.country) e.country = "Choose a billing country";
  if (!v.agree) e.agree = "Please agree to the terms to continue";
  return e;
}

type Stage = "idle" | "bank" | "properties" | "done";

const STAGE_TEXT: Record<Exclude<Stage, "idle">, string> = {
  bank: "Contacting your bank…",
  properties: "Confirming with the properties…",
  done: "Done",
};
const BANK_MS = 600;
const PROPERTIES_MS = 700;

interface Order {
  resolved: ResolvedStop[];
  totals: TripTotals;
  range: { start: string; end: string } | null;
}

/* ------------------------------------------------------------------ */
/*  Screen                                                             */
/* ------------------------------------------------------------------ */

export default function CheckoutScreen() {
  const trip = useTrip();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const timer = useRef<number | undefined>(undefined);

  const [values, setValues] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [stage, setStage] = useState<Stage>("idle");
  /* Frozen when "Pay" is pressed so the page holds still while confirmBooking
     empties the trip and we navigate away — no flash of the empty state. */
  const [locked, setLocked] = useState<Order | null>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const resolved = resolveStops(trip.stops);
  const live: Order = { resolved, totals: tripTotals(resolved), range: tripRange(resolved) };
  const order = locked ?? live;
  const submitted = locked !== null;
  const status = stage === "idle" ? null : STAGE_TEXT[stage];
  const processing = status !== null;

  if (!trip.ready) return <CheckoutSkeleton />;
  if (!submitted && order.resolved.length === 0) return <EmptyCheckout />;

  const subtitle = [order.range ? formatRange(order.range.start, order.range.end) : "", tripCountriesLabel(order.resolved)]
    .filter(Boolean)
    .join(" · ");

  const clearError = (key: FieldKey) =>
    setErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });

  const field = <K extends FieldKey>(key: K, value: FormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    clearError(key);
  };

  const onCardNumber = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = digitsOnly(e.target.value);
    setValues((v) => {
      const brand = detectBrand(digits) ?? v.brand;
      return { ...v, brand, cardNumber: formatCardNumber(digits, brand) };
    });
    clearError("cardNumber");
  };

  /* Picking a brand swaps in its test number unless the traveller typed their own. */
  const pickBrand = (brand: Brand) => {
    setValues((v) => {
      const digits = digitsOnly(v.cardNumber);
      const usingSample = !digits || BRAND_IDS.some((id) => digitsOnly(BRANDS[id].sample) === digits);
      const usingSampleCvc = !v.cvc || BRAND_IDS.some((id) => BRANDS[id].sampleCvc === v.cvc);
      return {
        ...v,
        brand,
        cardNumber: usingSample ? BRANDS[brand].sample : formatCardNumber(digits, brand),
        cvc: usingSample && usingSampleCvc ? BRANDS[brand].sampleCvc : v.cvc.slice(0, cvcLength(brand)),
      };
    });
    clearError("cardNumber");
    clearError("cvc");
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (processing) return;

    const errs = validate(values);
    setErrors(errs);
    const first = FIELD_ORDER.find((k) => errs[k]);
    if (first) {
      const el = formRef.current?.elements.namedItem(first);
      if (el instanceof HTMLElement) el.focus();
      return;
    }

    const guest = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
    };
    const payment = { brand: BRANDS[values.brand].label, last4: digitsOnly(values.cardNumber).slice(-4) };

    setLocked(live);
    setStage("bank");
    timer.current = window.setTimeout(() => {
      setStage("properties");
      timer.current = window.setTimeout(() => {
        setStage("done");
        const booking = trip.confirmBooking({ guest, payment });
        router.push(`/confirmation?ref=${encodeURIComponent(booking.ref)}`);
      }, PROPERTIES_MS);
    }, BANK_MS);
  };

  return (
    <div className="flow-inner co-page">
      <FlowSteps current={3} />

      <header className="flow-head">
        <span className="flow-icon">
          <Icon name="shield" size={22} />
        </span>
        <h1 className="flow-title">Checkout</h1>
        <p className="flow-subtitle">{subtitle}</p>
        <span className="flow-chip">
          <Icon name="sparkles" size={12} />
          Test mode — no real charge
        </span>
      </header>

      <div className="co-layout">
        <div className="co-main">
          <div className="co-topbar">
            <Link href="/trip" className="ghost-btn">
              <Icon name="arrowLeft" size={13} />
              Back to trip
            </Link>
          </div>

          <form ref={formRef} className="co-form" noValidate onSubmit={onSubmit} aria-busy={processing || undefined}>
            <fieldset className="co-fieldset" disabled={processing}>
              <section className="flow-panel" aria-labelledby="co-guest-title">
                <div className="co-panel-head">
                  <div>
                    <h2 id="co-guest-title" className="co-section-title">Guest details</h2>
                    <p className="co-section-hint">We&apos;ll send your confirmation and each property&apos;s arrival details here.</p>
                  </div>
                </div>
                <div className="co-fields">
                  <div className="co-row">
                    <TextField name="firstName" label="First name" autoComplete="given-name" value={values.firstName} error={errors.firstName} onChange={(e) => field("firstName", e.target.value)} />
                    <TextField name="lastName" label="Last name" autoComplete="family-name" value={values.lastName} error={errors.lastName} onChange={(e) => field("lastName", e.target.value)} />
                  </div>
                  <TextField name="email" label="Email" type="email" inputMode="email" autoComplete="email" value={values.email} error={errors.email} onChange={(e) => field("email", e.target.value)} />
                  <div className="co-row">
                    <TextField name="phone" label="Phone" type="tel" inputMode="tel" autoComplete="tel" value={values.phone} error={errors.phone} onChange={(e) => field("phone", e.target.value)} />
                  </div>
                </div>
              </section>

              <section className="flow-panel" aria-labelledby="co-payment-title">
                <div className="co-panel-head">
                  <div>
                    <h2 id="co-payment-title" className="co-section-title">Payment</h2>
                    <p className="co-section-hint">A simulated card payment for the demo — nothing is charged.</p>
                  </div>
                  <span className="co-secure">
                    <LockIcon size={13} />
                    Encrypted checkout
                  </span>
                </div>
                <div className="co-fields">
                  <div className="co-brands" role="group" aria-label="Card brand">
                    {BRAND_IDS.map((id) => (
                      <button
                        key={id}
                        type="button"
                        className={`ghost-btn co-brand${values.brand === id ? " on" : ""}`}
                        onClick={() => pickBrand(id)}
                        aria-pressed={values.brand === id}
                      >
                        {BRANDS[id].label}
                        <small aria-hidden="true">{BRANDS[id].sample.slice(0, 4)}</small>
                      </button>
                    ))}
                  </div>
                  <TextField
                    name="cardNumber"
                    label="Card number"
                    className="co-numeric"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder={values.brand === "amex" ? "0000 000000 00000" : "0000 0000 0000 0000"}
                    value={values.cardNumber}
                    error={errors.cardNumber}
                    onChange={onCardNumber}
                  />
                  <div className="co-note">
                    <span className="notice-tag">
                      <span className="dot" />
                      Test mode
                    </span>
                    <span>Any of the numbers above work; this is a simulated transaction and nothing is charged.</span>
                  </div>
                  <div className="co-row">
                    <TextField
                      name="expiry"
                      label="Expiry"
                      className="co-numeric"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM / YY"
                      value={values.expiry}
                      error={errors.expiry}
                      onChange={(e) => field("expiry", formatExpiry(e.target.value, values.expiry))}
                    />
                    <TextField
                      name="cvc"
                      label="CVC"
                      className="co-numeric"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder={values.brand === "amex" ? "0000" : "000"}
                      value={values.cvc}
                      error={errors.cvc}
                      onChange={(e) => field("cvc", digitsOnly(e.target.value).slice(0, cvcLength(values.brand)))}
                    />
                  </div>
                  <div className="co-row">
                    <TextField name="nameOnCard" label="Name on card" autoComplete="cc-name" value={values.nameOnCard} error={errors.nameOnCard} onChange={(e) => field("nameOnCard", e.target.value)} />
                    <SelectField name="country" label="Billing country" autoComplete="country-name" value={values.country} error={errors.country} onChange={(e) => field("country", e.target.value)}>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </SelectField>
                  </div>
                </div>
              </section>

              <section className="flow-panel" aria-labelledby="co-before-title">
                <div className="co-panel-head">
                  <div>
                    <h2 id="co-before-title" className="co-section-title">Before you pay</h2>
                    <p className="co-section-hint">A couple of things before we confirm with the properties.</p>
                  </div>
                </div>
                <div className="co-fields">
                  <div className="co-field">
                    <label className="co-check">
                      <input
                        type="checkbox"
                        name="agree"
                        checked={values.agree}
                        onChange={(e) => field("agree", e.target.checked)}
                        aria-invalid={errors.agree ? true : undefined}
                        aria-describedby={errors.agree ? "co-agree-error" : undefined}
                      />
                      <span>I agree to the booking terms and each property&apos;s cancellation policy</span>
                    </label>
                    {errors.agree && <p id="co-agree-error" className="co-error">{errors.agree}</p>}
                  </div>
                  <div className="co-field">
                    <label className="co-label" htmlFor="co-requests">
                      Special requests <small>(optional)</small>
                    </label>
                    <textarea
                      id="co-requests"
                      name="requests"
                      className="co-input"
                      placeholder="Late arrival, dietary needs, a birthday…"
                      value={values.requests}
                      onChange={(e) => setValues((v) => ({ ...v, requests: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>
              </section>
            </fieldset>

            <button type="submit" className="primary-btn co-pay" disabled={processing}>
              {status ? (
                <>
                  <span className="co-spinner" aria-hidden="true" />
                  {status}
                </>
              ) : (
                <>
                  <LockIcon size={14} />
                  Pay {money(order.totals.total)}
                </>
              )}
            </button>
            <p className="co-sr" role="status" aria-live="polite">{status ?? ""}</p>
            <p className="co-fine">Simulated payment — your card is never charged.</p>
          </form>
        </div>

        <aside className="co-side">
          <OrderSummary resolved={order.resolved} totals={order.totals} adults={trip.adults} kids={trip.children} />
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Fields                                                             */
/* ------------------------------------------------------------------ */

type InputProps = Omit<ComponentProps<"input">, "id" | "name" | "aria-invalid" | "aria-describedby">;

function TextField({ name, label, error, className, ...input }: { name: FieldKey; label: string; error?: string } & InputProps) {
  const id = `co-${name}`;
  return (
    <div className="co-field">
      <label className="co-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        className={`co-input${className ? ` ${className}` : ""}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...input}
      />
      {error && <p id={`${id}-error`} className="co-error">{error}</p>}
    </div>
  );
}

type SelectProps = Omit<ComponentProps<"select">, "id" | "name" | "className" | "aria-invalid" | "aria-describedby">;

function SelectField({ name, label, error, children, ...select }: { name: FieldKey; label: string; error?: string } & SelectProps) {
  const id = `co-${name}`;
  return (
    <div className="co-field">
      <label className="co-label" htmlFor={id}>{label}</label>
      <select id={id} name={name} className="co-input" aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} {...select}>
        {children}
      </select>
      {error && <p id={`${id}-error`} className="co-error">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading & empty states                                             */
/* ------------------------------------------------------------------ */

function CheckoutSkeleton() {
  return (
    <div className="flow-inner co-page" aria-busy="true">
      <FlowSteps current={3} />
      <header className="flow-head">
        <span className="flow-icon">
          <Icon name="shield" size={22} />
        </span>
        <h1 className="flow-title">Checkout</h1>
        <span className="co-skel co-skel-subtitle" aria-hidden="true" />
        <span className="flow-chip">
          <Icon name="sparkles" size={12} />
          Test mode — no real charge
        </span>
      </header>
      <div className="co-layout">
        <div className="flow-panel co-skeleton" role="status">
          <span className="co-sr">Loading your trip</span>
          <span className="co-skel co-skel-lg" aria-hidden="true" />
          <span className="co-skel co-skel-sm" aria-hidden="true" />
          <div className="co-skel-row" aria-hidden="true">
            <span className="co-skel co-skel-box" />
            <span className="co-skel co-skel-box" />
          </div>
          <span className="co-skel co-skel-box" aria-hidden="true" />
          <span className="co-skel co-skel-box" aria-hidden="true" />
        </div>
        <div className="flow-panel co-skeleton" aria-hidden="true">
          <span className="co-skel co-skel-lg" />
          <span className="co-skel co-skel-sm" />
          <span className="co-skel co-skel-md" />
          <span className="co-skel co-skel-md" />
          <span className="co-skel co-skel-lg" />
        </div>
      </div>
    </div>
  );
}

function EmptyCheckout() {
  return (
    <div className="flow-inner narrow co-page">
      <FlowSteps current={3} />
      <div className="flow-head co-empty">
        <span className="flow-icon">
          <Icon name="map" size={22} />
        </span>
        <h1 className="flow-title">Nothing to check out yet</h1>
        <p className="co-empty-sub">Add a stay or two to your trip and come back here to pay for the whole journey in one go.</p>
        <div className="co-actions">
          <Link href="/search" className="primary-btn">
            Find a stay
            <Icon name="arrowRight" size={14} />
          </Link>
          <Link href="/trip" className="ghost-btn">
            <Icon name="arrowLeft" size={13} />
            Back to trip
          </Link>
        </div>
      </div>
    </div>
  );
}
