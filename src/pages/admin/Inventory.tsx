import { useEffect, useMemo, useState } from 'react';
import { CaretDown, CaretRight, Cube } from '@phosphor-icons/react';
import { useSearchParams } from 'react-router-dom';
import AdminPageFrame from '@/components/admin/AdminPageFrame';
import AdminPagination from '@/components/admin/AdminPagination';
import {
    ErrorState,
    NoSearchResultsState,
    SuccessState,
} from '@/components/ui/UiStates';
import { useAdminStore } from '@/context/AdminStoreContext';
import { usePagination } from '@/hooks/usePagination';
import { availableQuantity, formatDate } from '@/data/selectors';
import type { Product } from '@/types';

type ProductGroup = {
    product: Product;
    variants: Array<{
        variant: Product['variants'][number];
        available: number;
    }>;
    totalAvailable: number;
};

export default function AdminInventoryPage() {
    const { products, movements, adjustStock } = useAdminStore();
    const [params] = useSearchParams();
    const [query, setQuery] = useState(params.get('q') ?? '');
    const [variantId, setVariantId] = useState(params.get('variant') ?? '');
    const [delta, setDelta] = useState('5');
    const [reason, setReason] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [flash, setFlash] = useState<string | null>(null);
    const [block, setBlock] = useState<string | null>(null);
    const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({});

    const groups = useMemo(() => {
        const q = query.trim().toLowerCase();
        return products
            .map((product) => {
                const variants = product.variants
                    .filter((v) => {
                        if (!q) return true;
                        return (
                            product.name.toLowerCase().includes(q) ||
                            v.sku.toLowerCase().includes(q) ||
                            (v.name ?? '').toLowerCase().includes(q)
                        );
                    })
                    .map((variant) => ({
                        variant,
                        available: availableQuantity(variant),
                    }));
                return {
                    product,
                    variants,
                    totalAvailable: variants.reduce((sum, row) => sum + row.available, 0),
                } satisfies ProductGroup;
            })
            .filter((group) => group.variants.length > 0)
            .sort((a, b) => a.product.name.localeCompare(b.product.name));
    }, [products, query]);

    const { page, totalPages, pageItems, goTo, reset, rangeLabel } = usePagination(groups);

    useEffect(() => {
        reset();
    }, [query, reset]);

    useEffect(() => {
        const q = params.get('q');
        const variant = params.get('variant');
        if (q != null) setQuery(q);
        if (variant != null) setVariantId(variant);
    }, [params]);

    function toggleGroup(id: number) {
        setOpenGroups((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
    }

    function isOpen(id: number) {
        return openGroups[id] ?? true;
    }

    function validate() {
        const next: Record<string, string> = {};
        if (!variantId) next.variant = 'Select a variant to adjust.';
        const n = Number(delta);
        if (!delta.trim() || Number.isNaN(n) || n === 0)
            next.delta = 'Enter a non-zero adjustment (positive restock, negative reduce).';
        if (!reason.trim())
            next.reason = 'Add a reason — inventory adjustments require a note.';
        else if (reason.trim().length < 3)
            next.reason = 'Reason is too short — explain the adjustment briefly.';
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    function onAdjust(e: React.FormEvent) {
        e.preventDefault();
        setFlash(null);
        setBlock(null);
        if (!validate()) return;
        const result = adjustStock(Number(variantId), Number(delta), reason);
        if (!result.ok) {
            setBlock(result.message ?? 'Adjustment failed');
            return;
        }
        setFlash(
            `Stock adjusted by ${delta}. Movement logged with reason “${reason.trim()}”.`,
        );
        setReason('');
        setErrors({});
    }

    return (
        <AdminPageFrame
            title="Inventory"
            description="Stock grouped by product. Available = on hand − reserved. Adjustments need a reason."
            isEmpty={groups.length === 0 && !query}
            empty={{
                title: 'No stock rows',
                reason: 'There are no product variants to adjust in this session.',
                nextStep: 'Create a product draft first, then return here.',
                actionLabel: 'Go to products',
                onAction: () => {
                    window.location.href = '/admin/products';
                },
            }}
        >
            {flash ? (
                <div className="mb-4">
                    <SuccessState
                        title="Stock updated"
                        reassurance={flash}
                        next="Low-stock KPIs on the dashboard refresh from available quantity."
                        action={{ label: 'Back to dashboard', to: '/admin' }}
                    />
                </div>
            ) : null}
            {block ? (
                <div className="mb-4">
                    <ErrorState
                        title="Adjustment blocked"
                        whatFailed={block}
                        whoseFault="Input or missing variant — not a network fault."
                        howToFix="Pick a valid variant and include a reason note."
                        retry={{ label: 'Dismiss', onClick: () => setBlock(null) }}
                    />
                </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div>
                    <div className="admin-toolbar">
                        <div className="field admin-toolbar__search">
                            <label className="field__label" htmlFor="inv-q">
                                Search products / SKUs
                            </label>
                            <input
                                id="inv-q"
                                className="field__input"
                                value={query}
                                placeholder="Product, variant, or SKU"
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {groups.length === 0 && query ? (
                        <NoSearchResultsState
                            query={query}
                            reason="No product groups matched that product, variant, or SKU query."
                            suggestions={['LTP-', 'Sage', 'pillow']}
                            onSuggestionSelect={setQuery}
                            clearAction={{ label: 'Clear search', onClick: () => setQuery('') }}
                        />
                    ) : (
                        <>
                            <div className="space-y-3">
                                {pageItems.map(({ product, variants, totalAvailable }) => {
                                    const open = isOpen(product.id);
                                    return (
                                        <section
                                            key={product.id}
                                            className="admin-panel inventory-group"
                                        >
                                            <button
                                                type="button"
                                                className="inventory-group__header"
                                                aria-expanded={open}
                                                onClick={() => toggleGroup(product.id)}
                                            >
                                                <span className="inventory-group__title">
                                                    {open ? (
                                                        <CaretDown size={16} aria-hidden />
                                                    ) : (
                                                        <CaretRight size={16} aria-hidden />
                                                    )}
                                                    {product.name}
                                                </span>
                                                <span className="inventory-group__meta">
                                                    {variants.length} SKU
                                                    {variants.length === 1 ? '' : 's'} ·{' '}
                                                    {totalAvailable} available
                                                </span>
                                            </button>
                                            {open ? (
                                                <div className="overflow-x-auto">
                                                    <table className="admin-table">
                                                        <thead>
                                                            <tr>
                                                                <th>SKU</th>
                                                                <th>Variant</th>
                                                                <th>On hand</th>
                                                                <th>Reserved</th>
                                                                <th>Available</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {variants.map(
                                                                ({ variant, available }) => (
                                                                    <tr key={variant.id}>
                                                                        <td>
                                                                            <button
                                                                                type="button"
                                                                                className="text-left text-admin-primary"
                                                                                onClick={() =>
                                                                                    setVariantId(
                                                                                        String(
                                                                                            variant.id,
                                                                                        ),
                                                                                    )
                                                                                }
                                                                            >
                                                                                {variant.sku}
                                                                            </button>
                                                                        </td>
                                                                        <td>
                                                                            {variant.name ??
                                                                                'Default'}
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                variant.stockQuantity
                                                                            }
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                variant.reservedQuantity
                                                                            }
                                                                        </td>
                                                                        <td
                                                                            className={
                                                                                available <= 5
                                                                                    ? 'font-semibold text-danger'
                                                                                    : undefined
                                                                            }
                                                                        >
                                                                            {available}
                                                                        </td>
                                                                    </tr>
                                                                ),
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : null}
                                        </section>
                                    );
                                })}
                            </div>
                            <AdminPagination
                                page={page}
                                totalPages={totalPages}
                                rangeLabel={rangeLabel}
                                onPageChange={goTo}
                            />
                        </>
                    )}

                    <section className="admin-panel mt-6">
                        <h2 className="admin-panel__title">Recent movements</h2>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>When</th>
                                    <th>Variant</th>
                                    <th>Type</th>
                                    <th>Qty</th>
                                    <th>Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movements.slice(0, 10).map((m) => (
                                    <tr key={m.id}>
                                        <td>{formatDate(m.createdAt)}</td>
                                        <td>{m.variantId}</td>
                                        <td>{m.type}</td>
                                        <td>{m.quantity}</td>
                                        <td className="text-xs">{m.reason}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </div>

                <form className="admin-panel" onSubmit={onAdjust} noValidate>
                    <h2 className="admin-panel__title flex items-center gap-2">
                        <Cube size={18} aria-hidden />
                        Adjust stock
                    </h2>
                    <div className="field">
                        <label className="field__label" htmlFor="inv-variant">
                            Variant
                        </label>
                        <select
                            id="inv-variant"
                            className={`field__select${errors.variant ? ' field__input--error' : ''}`}
                            value={variantId}
                            onChange={(e) => setVariantId(e.target.value)}
                            aria-invalid={Boolean(errors.variant)}
                        >
                            <option value="">Select…</option>
                            {products.map((p) => (
                                <optgroup key={p.id} label={p.name}>
                                    {p.variants.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {v.sku}
                                            {v.name ? ` · ${v.name}` : ''}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        {errors.variant ? (
                            <p className="field__error">{errors.variant}</p>
                        ) : null}
                    </div>
                    <div className="field">
                        <label className="field__label" htmlFor="inv-delta">
                            Delta (+/−)
                        </label>
                        <input
                            id="inv-delta"
                            className={`field__input${errors.delta ? ' field__input--error' : ''}`}
                            value={delta}
                            onChange={(e) => setDelta(e.target.value)}
                            aria-invalid={Boolean(errors.delta)}
                            aria-describedby={errors.delta ? 'inv-delta-err' : undefined}
                        />
                        {errors.delta ? (
                            <p id="inv-delta-err" className="field__error">
                                {errors.delta}
                            </p>
                        ) : null}
                    </div>
                    <div className="field">
                        <label className="field__label" htmlFor="inv-reason">
                            Reason
                        </label>
                        <textarea
                            id="inv-reason"
                            className={`field__textarea${errors.reason ? ' field__input--error' : ''}`}
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            aria-invalid={Boolean(errors.reason)}
                            aria-describedby={errors.reason ? 'inv-reason-err' : undefined}
                        />
                        {errors.reason ? (
                            <p id="inv-reason-err" className="field__error">
                                {errors.reason}
                            </p>
                        ) : null}
                    </div>
                    <button type="submit" className="btn btn--admin w-full">
                        Apply adjustment
                    </button>
                </form>
            </div>
        </AdminPageFrame>
    );
}
