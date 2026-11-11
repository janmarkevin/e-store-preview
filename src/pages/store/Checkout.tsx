import { useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ProductMedia from '@/components/ui/ProductMedia';
import { useCart } from '@/context/CartContext';
import { storeSettings } from '@/data/storeSettings';
import {
    formatPeso,
    getProductById,
    getVariant,
    productImageForVariant,
    variantDisplayLabel,
} from '@/data/selectors';
import type { PaymentMethod } from '@/types';

type FormState = {
    fullName: string;
    email: string;
    mobile: string;
    city: string;
    barangay: string;
    street: string;
    notes: string;
    paymentMethod: PaymentMethod;
};

const INITIAL: FormState = {
    fullName: '',
    email: '',
    mobile: '',
    city: '',
    barangay: '',
    street: '',
    notes: '',
    paymentMethod: 'cod',
};

const REQUIRED_FIELDS: Array<keyof FormState> = [
    'fullName',
    'email',
    'mobile',
    'city',
    'barangay',
    'street',
    'paymentMethod',
];

export default function CheckoutPage() {
    const { lines, clear, removeItem } = useCart();
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [form, setForm] = useState<FormState>(INITIAL);
    const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
    const [submitting, setSubmitting] = useState(false);
    const [successAnimating, setSuccessAnimating] = useState(false);
    const summaryRef = useRef<HTMLDivElement>(null);
    const errorTitleId = useId();

    const resolved = useMemo(
        () =>
            lines
                .map((line) => {
                    const product = getProductById(line.productId);
                    const variant = product ? getVariant(product, line.variantId) : null;
                    if (!product || !variant) {
                        return null;
                    }
                    return { line, product, variant };
                })
                .filter(Boolean) as Array<{
                line: (typeof lines)[number];
                product: NonNullable<ReturnType<typeof getProductById>>;
                variant: NonNullable<ReturnType<typeof getVariant>>;
            }>,
        [lines],
    );

    const subtotal = resolved.reduce(
        (sum, row) => sum + row.variant.price * row.line.quantity,
        0,
    );
    const deliveryFee = storeSettings.defaultDeliveryFee;
    const total = subtotal + deliveryFee;
    const mode = params.get('mode');

    function validate(next: FormState) {
        const e: Partial<Record<keyof FormState, string>> = {};
        if (!next.fullName.trim()) e.fullName = 'Enter your full name.';
        if (!next.email.trim() || !next.email.includes('@')) e.email = 'Enter a valid email.';
        if (!/^(09\d{9}|639\d{9}|\+639\d{9})$/.test(next.mobile.replace(/\s+/g, ''))) {
            e.mobile = 'Enter a Philippine mobile (09…, 639…, or +639…).';
        }
        if (!next.city.trim()) e.city = 'Enter city/municipality.';
        if (!next.barangay.trim()) e.barangay = 'Enter barangay.';
        if (!next.street.trim()) e.street = 'Enter street/building/unit.';
        if (!next.paymentMethod) e.paymentMethod = 'Choose COD or GCash.';
        return e;
    }

    function clearFieldError(key: keyof FormState) {
        setErrors((prev) => {
            if (!prev[key]) {
                return prev;
            }
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }

    function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
        clearFieldError(key);
    }

    function onSubmit(event: FormEvent) {
        event.preventDefault();
        if (submitting || successAnimating) {
            return;
        }
        const nextErrors = validate(form);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
            summaryRef.current?.focus();
            return;
        }
        setSubmitting(true);
        setSuccessAnimating(true);
        const orderNumber = `KS-DEMO-${Date.now().toString().slice(-6)}`;
        const trackingToken = `demo-new-${orderNumber.toLowerCase()}`;
        sessionStorage.setItem(
            'kevin-store-preview-last-order',
            JSON.stringify({
                orderNumber,
                trackingToken,
                total,
                paymentMethod: form.paymentMethod,
                guestName: form.fullName,
            }),
        );
        window.setTimeout(() => {
            clear();
            navigate(
                `/confirmation?order=${orderNumber}&token=${trackingToken}&method=${form.paymentMethod}&total=${total}`,
            );
        }, 900);
    }

    if (resolved.length === 0 && !successAnimating) {
        return (
            <div className="page-shell">
                <div className="empty-state">
                    <h1 className="empty-state__title">Nothing to checkout</h1>
                    <p className="empty-state__text">
                        Add items to your cart or use Buy Now from a product page.
                    </p>
                    <div className="empty-state__action">
                        <Link to="/shop" className="btn btn--secondary">
                            Browse catalog
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const errorEntries = Object.entries(errors) as Array<[keyof FormState, string]>;

    return (
        <div className="page-shell">
            <h1 className="page-title">Guest checkout</h1>
            <p className="page-lead">
                {mode === 'buy-now'
                    ? 'Buy Now path — cart was replaced with the selected item only.'
                    : 'No account required. This submit simulates order creation only.'}
            </p>

            {successAnimating ? (
                <div className="checkout-success" role="status" aria-live="polite">
                    <div className="success-burst" aria-hidden="true">
                        <svg className="success-burst__ring" viewBox="0 0 96 96">
                            <circle cx="48" cy="48" r="44" />
                        </svg>
                        <svg className="success-burst__check" viewBox="0 0 96 96">
                            <path d="M28 50 L42 64 L68 34" />
                        </svg>
                    </div>
                    <p className="checkout-success__title">Order placed</p>
                    <p className="checkout-success__text">Taking you to confirmation…</p>
                </div>
            ) : (
                <form className="checkout-grid" onSubmit={onSubmit} noValidate>
                    <div>
                        {errorEntries.length > 0 ? (
                            <div
                                className="error-summary"
                                role="alert"
                                tabIndex={-1}
                                ref={summaryRef}
                                aria-labelledby={errorTitleId}
                            >
                                <h2 id={errorTitleId} className="font-semibold">
                                    There is a problem
                                </h2>
                                <ul className="mt-2 list-disc pl-5 text-sm">
                                    {errorEntries.map(([key, message]) => (
                                        <li key={key}>
                                            <a href={`#field-${key}`}>{message}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}

                        <div className="grid gap-4 rounded-xl bg-surface p-6 shadow-sm">
                            {(
                                [
                                    ['fullName', 'Full name', 'text'],
                                    ['email', 'Email', 'email'],
                                    ['mobile', 'Mobile (+639…)', 'tel'],
                                    ['city', 'City / municipality', 'text'],
                                    ['barangay', 'Barangay', 'text'],
                                    ['street', 'Street / building / unit', 'text'],
                                ] as const
                            ).map(([key, label, type]) => (
                                <div className="field" key={key}>
                                    <label className="field__label" htmlFor={`field-${key}`}>
                                        {label}
                                        {REQUIRED_FIELDS.includes(key) ? (
                                            <span className="field__required" aria-hidden="true">
                                                *
                                            </span>
                                        ) : null}
                                        <span className="sr-only"> (required)</span>
                                    </label>
                                    <input
                                        id={`field-${key}`}
                                        className="field__input"
                                        type={type}
                                        value={form[key]}
                                        required
                                        aria-invalid={Boolean(errors[key])}
                                        aria-describedby={
                                            errors[key] ? `${key}-error` : undefined
                                        }
                                        onChange={(e) => updateField(key, e.target.value)}
                                    />
                                    {errors[key] ? (
                                        <p id={`${key}-error`} className="field__error">
                                            {errors[key]}
                                        </p>
                                    ) : null}
                                </div>
                            ))}

                            <div className="field">
                                <label className="field__label" htmlFor="field-notes">
                                    Delivery notes (optional)
                                </label>
                                <textarea
                                    id="field-notes"
                                    className="field__textarea"
                                    rows={3}
                                    value={form.notes}
                                    onChange={(e) => updateField('notes', e.target.value)}
                                />
                            </div>

                            <fieldset className="field" id="field-paymentMethod">
                                <legend className="field__label">
                                    Payment method
                                    <span className="field__required" aria-hidden="true">
                                        *
                                    </span>
                                    <span className="sr-only"> (required)</span>
                                </legend>
                                <label className="mt-2 flex items-center gap-2 text-sm">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        checked={form.paymentMethod === 'cod'}
                                        onChange={() => updateField('paymentMethod', 'cod')}
                                    />
                                    Cash on Delivery (COD)
                                </label>
                                <label className="mt-2 flex items-center gap-2 text-sm">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        checked={form.paymentMethod === 'gcash'}
                                        onChange={() => updateField('paymentMethod', 'gcash')}
                                    />
                                    GCash (manual verification)
                                </label>
                                {errors.paymentMethod ? (
                                    <p id="paymentMethod-error" className="field__error">
                                        {errors.paymentMethod}
                                    </p>
                                ) : null}
                            </fieldset>
                        </div>
                    </div>

                    <aside className="checkout-summary">
                        <h2 className="mb-4 text-lg font-semibold">Order summary</h2>
                        {resolved.map(({ line, product, variant }) => {
                            const image = productImageForVariant(product, variant);
                            const label = variantDisplayLabel(variant);
                            return (
                                <div
                                    key={`${line.productId}-${line.variantId}`}
                                    className="summary-row summary-row--item"
                                >
                                    <div className="summary-row__product">
                                        <div className="summary-row__thumb">
                                            <ProductMedia
                                                src={image?.src}
                                                tone={image?.tone}
                                                label={image?.label}
                                                alt={product.name}
                                            />
                                        </div>
                                        <div className="summary-row__meta">
                                            <span className="summary-row__name">
                                                {product.name} × {line.quantity}
                                            </span>
                                            <p className="summary-row__variant">
                                                Variant: {label}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="summary-row__side">
                                        <span>{formatPeso(variant.price * line.quantity)}</span>
                                        <button
                                            type="button"
                                            className="summary-row__remove"
                                            onClick={() =>
                                                removeItem(line.productId, line.variantId)
                                            }
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="summary-row">
                            <span>Delivery fee (estimate)</span>
                            <span>{formatPeso(deliveryFee)}</span>
                        </div>
                        <div className="summary-row summary-row--total">
                            <span>Total</span>
                            <span>{formatPeso(total)}</span>
                        </div>
                        <button
                            type="submit"
                            className="btn btn--primary mt-6 w-full"
                            disabled={submitting || resolved.length === 0}
                        >
                            {submitting ? 'Placing order…' : 'Place order (demo)'}
                        </button>
                        <p className="mt-3 text-xs text-muted-foreground">
                            Demo only — no backend order is created.
                        </p>
                    </aside>
                </form>
            )}
        </div>
    );
}
