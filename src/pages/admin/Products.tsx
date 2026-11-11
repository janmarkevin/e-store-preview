import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Image as ImageIcon, Package, PencilSimple, Plus, X } from '@phosphor-icons/react';
import AdminPageFrame from '@/components/admin/AdminPageFrame';
import AdminPagination from '@/components/admin/AdminPagination';
import { NoSearchResultsState, SuccessState } from '@/components/ui/UiStates';
import { useAdminStore } from '@/context/AdminStoreContext';
import { usePagination } from '@/hooks/usePagination';
import { availableQuantity, formatPeso } from '@/data/selectors';
import type { Product, ProductStatus } from '@/types';

type FormState = {
    name: string;
    description: string;
    price: string;
    categoryId: string;
    status: ProductStatus;
    imageSrc: string | null;
    imageLabel: string;
};

const EMPTY_FORM: FormState = {
    name: '',
    description: '',
    price: '499',
    categoryId: '1',
    status: 'draft',
    imageSrc: null,
    imageLabel: '',
};

function primaryImage(product: Product) {
    return product.images.find((i) => i.isPrimary) ?? product.images[0] ?? null;
}

export default function AdminProductsPage() {
    const { products, categories, upsertProduct } = useAdminStore();
    const [query, setQuery] = useState('');
    const [flash, setFlash] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<FormState>({
        ...EMPTY_FORM,
        categoryId: String(categories[0]?.id ?? 1),
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return products.filter((p) => {
            if (!q) return true;
            return (
                p.name.toLowerCase().includes(q) ||
                p.slug.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.variants.some((v) => v.sku.toLowerCase().includes(q))
            );
        });
    }, [products, query]);

    const { page, totalPages, pageItems, goTo, reset, rangeLabel } = usePagination(filtered);

    useEffect(() => {
        reset();
    }, [query, reset]);

    function resetForm() {
        setEditingId(null);
        setForm({
            ...EMPTY_FORM,
            categoryId: String(categories[0]?.id ?? 1),
        });
        setErrors({});
    }

    function startEdit(product: Product) {
        const image = primaryImage(product);
        const fromPrice = Math.min(...product.variants.map((v) => v.price));
        setEditingId(product.id);
        setForm({
            name: product.name,
            description: product.description,
            price: String(fromPrice),
            categoryId: String(product.categoryId ?? categories[0]?.id ?? 1),
            status: product.status,
            imageSrc: image?.src ?? null,
            imageLabel: image?.label ?? '',
        });
        setFlash(null);
        setErrors({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function validate() {
        const next: Record<string, string> = {};
        if (!form.name.trim()) next.name = 'Enter a product name (at least 2 characters).';
        else if (form.name.trim().length < 2)
            next.name = 'Name is too short — use at least 2 characters.';
        if (!form.description.trim())
            next.description = 'Add a short description guests will see on the PDP.';
        else if (form.description.trim().length < 12)
            next.description = 'Description is too short — aim for at least one clear sentence.';
        const price = Number(form.price);
        if (!form.price.trim() || Number.isNaN(price) || price <= 0)
            next.price = 'Enter a price greater than 0 (PHP).';
        if (!form.categoryId) next.category = 'Choose a category.';
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    function onImageChange(file: File | null) {
        if (!file) {
            setForm((prev) => ({ ...prev, imageSrc: null, imageLabel: '' }));
            return;
        }
        if (!file.type.startsWith('image/')) {
            setErrors((prev) => ({
                ...prev,
                image: 'Choose an image file (JPG, PNG, WebP, etc.).',
            }));
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setForm((prev) => ({
                ...prev,
                imageSrc: String(reader.result),
                imageLabel: file.name,
            }));
            setErrors((prev) => {
                const { image: _removed, ...rest } = prev;
                return rest;
            });
        };
        reader.readAsDataURL(file);
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        const price = Number(form.price);
        const isEdit = editingId != null;
        const existing = isEdit ? products.find((p) => p.id === editingId) : null;
        const id = existing?.id ?? Math.max(0, ...products.map((p) => p.id)) + 1;
        const variantId =
            existing?.variants[0]?.id ??
            Math.max(0, ...products.flatMap((p) => p.variants.map((v) => v.id))) + 1;
        const slugBase = form.name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const images =
            form.imageSrc != null
                ? [
                      {
                          id: existing?.images[0]?.id ?? id * 10 + 1,
                          productId: id,
                          tone: '#efebe6',
                          label: form.imageLabel || 'Primary',
                          altText: `${form.name.trim()} product image`,
                          sortOrder: 0,
                          isPrimary: true,
                          src: form.imageSrc,
                      },
                  ]
                : existing?.images ?? [];

        const product: Product = {
            id,
            categoryId: Number(form.categoryId),
            name: form.name.trim(),
            slug: existing?.slug ?? `${slugBase}-${id}`,
            description: form.description.trim(),
            status: form.status,
            isPreorder: existing?.isPreorder ?? false,
            preorderAvailableAt: existing?.preorderAvailableAt ?? null,
            preorderLimit: existing?.preorderLimit ?? null,
            preorderReservedQuantity: existing?.preorderReservedQuantity ?? 0,
            createdAt: existing?.createdAt ?? new Date().toISOString().replace('Z', '+08:00'),
            images,
            variants: existing
                ? existing.variants.map((v, index) =>
                      index === 0 ? { ...v, price } : v,
                  )
                : [
                      {
                          id: variantId,
                          productId: id,
                          sku: `DEMO-${id}`,
                          name: null,
                          attributes: null,
                          price,
                          stockQuantity: 0,
                          reservedQuantity: 0,
                          isDefault: true,
                          status: 'active',
                          imageIndex: form.imageSrc ? 0 : null,
                      },
                  ],
        };

        upsertProduct(product);
        setFlash(
            isEdit
                ? `“${product.name}” updated. Catalog and inventory views use the new details.`
                : `“${product.name}” saved as ${product.status}. Add stock on Inventory when ready.`,
        );
        resetForm();
    }

    return (
        <AdminPageFrame
            title="Products"
            description="Create and edit catalog products — name, description, image, price, and status."
            isEmpty={products.length === 0}
            empty={{
                title: 'No products in catalog',
                reason: 'The product list is empty in this preview session.',
                nextStep: 'Add a product using the form on this page.',
                actionLabel: 'Reload demo data',
                onAction: () => window.location.reload(),
            }}
        >
            {flash ? (
                <div className="mb-4">
                    <SuccessState
                        title={editingId ? 'Product updated' : 'Product saved'}
                        reassurance={flash}
                        next="Adjust stock on Inventory when you are ready to sell."
                        action={{ label: 'Open inventory', to: '/admin/inventory' }}
                    />
                </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <div>
                    <div className="admin-toolbar">
                        <div className="field admin-toolbar__search">
                            <label className="field__label" htmlFor="products-q">
                                Search products
                            </label>
                            <input
                                id="products-q"
                                className="field__input"
                                value={query}
                                placeholder="Name, slug, description, or SKU"
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {filtered.length === 0 && query ? (
                        <NoSearchResultsState
                            query={query}
                            reason="No products matched that name, slug, description, or SKU."
                            suggestions={['linen', 'pillow', 'draft']}
                            onSuggestionSelect={setQuery}
                            clearAction={{
                                label: 'Clear search',
                                onClick: () => setQuery(''),
                            }}
                        />
                    ) : (
                        <>
                            <div className="admin-panel overflow-x-auto">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Category</th>
                                            <th>From price</th>
                                            <th>Status</th>
                                            <th>Available</th>
                                            <th />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pageItems.map((product) => {
                                            const category = categories.find(
                                                (c) => c.id === product.categoryId,
                                            );
                                            const stock = product.variants.reduce(
                                                (sum, v) => sum + availableQuantity(v),
                                                0,
                                            );
                                            const fromPrice = Math.min(
                                                ...product.variants.map((v) => v.price),
                                            );
                                            const image = primaryImage(product);
                                            return (
                                                <tr key={product.id}>
                                                    <td>
                                                        <div className="flex items-center gap-3">
                                                            {image?.src ? (
                                                                <img
                                                                    src={image.src}
                                                                    alt=""
                                                                    className="product-thumb"
                                                                />
                                                            ) : (
                                                                <span
                                                                    className="product-thumb product-thumb--empty"
                                                                    aria-hidden
                                                                >
                                                                    <Package size={18} />
                                                                </span>
                                                            )}
                                                            <div>
                                                                <div className="font-medium">
                                                                    {product.name}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {product.slug}
                                                                    {product.isPreorder
                                                                        ? ' · pre-order'
                                                                        : ''}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{category?.name ?? '—'}</td>
                                                    <td>{formatPeso(fromPrice)}</td>
                                                    <td>
                                                        <span
                                                            className={`badge badge--status badge--${product.status}`}
                                                        >
                                                            {product.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {stock}
                                                        <Link
                                                            className="ml-2 text-xs text-admin-primary"
                                                            to="/admin/inventory"
                                                        >
                                                            Adjust
                                                        </Link>
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="btn btn--secondary btn--sm"
                                                            onClick={() => startEdit(product)}
                                                        >
                                                            <PencilSimple size={14} aria-hidden />
                                                            Edit
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <AdminPagination
                                page={page}
                                totalPages={totalPages}
                                rangeLabel={rangeLabel}
                                onPageChange={goTo}
                            />
                        </>
                    )}
                </div>

                <form className="admin-panel" onSubmit={onSubmit} noValidate>
                    <div className="mb-4 flex items-start justify-between gap-2">
                        <h2 className="admin-panel__title mb-0 flex items-center gap-2">
                            {editingId ? (
                                <PencilSimple size={18} aria-hidden />
                            ) : (
                                <Plus size={18} aria-hidden />
                            )}
                            {editingId ? 'Edit product' : 'Add product'}
                        </h2>
                        {editingId ? (
                            <button
                                type="button"
                                className="btn btn--ghost btn--sm"
                                onClick={resetForm}
                            >
                                <X size={14} aria-hidden />
                                Cancel
                            </button>
                        ) : null}
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="p-name">
                            Name
                        </label>
                        <input
                            id="p-name"
                            className={`field__input${errors.name ? ' field__input--error' : ''}`}
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={errors.name ? 'p-name-err' : undefined}
                        />
                        {errors.name ? (
                            <p id="p-name-err" className="field__error">
                                {errors.name}
                            </p>
                        ) : null}
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="p-desc">
                            Description
                        </label>
                        <textarea
                            id="p-desc"
                            className={`field__textarea${errors.description ? ' field__input--error' : ''}`}
                            rows={4}
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            aria-invalid={Boolean(errors.description)}
                            aria-describedby={errors.description ? 'p-desc-err' : undefined}
                            placeholder="What guests should know on the product page"
                        />
                        {errors.description ? (
                            <p id="p-desc-err" className="field__error">
                                {errors.description}
                            </p>
                        ) : null}
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="p-image">
                            Product image
                        </label>
                        <div className="product-image-field">
                            {form.imageSrc ? (
                                <div className="product-image-field__preview">
                                    <img src={form.imageSrc} alt="" />
                                    <button
                                        type="button"
                                        className="btn btn--secondary btn--sm"
                                        onClick={() => onImageChange(null)}
                                    >
                                        Remove image
                                    </button>
                                </div>
                            ) : (
                                <label className="product-image-field__drop" htmlFor="p-image">
                                    <ImageIcon size={22} aria-hidden />
                                    <span>Upload image</span>
                                    <span className="text-xs text-muted-foreground">
                                        JPG, PNG, or WebP — preview only in this demo
                                    </span>
                                </label>
                            )}
                            <input
                                id="p-image"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
                            />
                        </div>
                        {errors.image ? <p className="field__error">{errors.image}</p> : null}
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="p-price">
                            Price (PHP)
                        </label>
                        <input
                            id="p-price"
                            className={`field__input${errors.price ? ' field__input--error' : ''}`}
                            value={form.price}
                            inputMode="decimal"
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                            aria-invalid={Boolean(errors.price)}
                            aria-describedby={errors.price ? 'p-price-err' : undefined}
                        />
                        {errors.price ? (
                            <p id="p-price-err" className="field__error">
                                {errors.price}
                            </p>
                        ) : null}
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="p-cat">
                            Category
                        </label>
                        <select
                            id="p-cat"
                            className={`field__select${errors.category ? ' field__input--error' : ''}`}
                            value={form.categoryId}
                            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                            aria-invalid={Boolean(errors.category)}
                        >
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        {errors.category ? (
                            <p className="field__error">{errors.category}</p>
                        ) : null}
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="p-status">
                            Status
                        </label>
                        <select
                            id="p-status"
                            className="field__select"
                            value={form.status}
                            onChange={(e) =>
                                setForm({ ...form, status: e.target.value as ProductStatus })
                            }
                        >
                            <option value="draft">draft</option>
                            <option value="active">active</option>
                            <option value="archived">archived</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn--admin w-full">
                        {editingId ? 'Save changes' : 'Save product'}
                    </button>
                </form>
            </div>
        </AdminPageFrame>
    );
}
