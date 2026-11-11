import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '@/components/store/ProductCard';
import {
    EmptyState,
    LoadingSkeleton,
    NoSearchResultsState,
} from '@/components/ui/UiStates';
import {
    catalogProducts,
    getActiveCategories,
    paginate,
} from '@/data/selectors';

export default function CatalogPage() {
    const [params, setParams] = useSearchParams();
    const query = params.get('q') ?? '';
    const categorySlug = params.get('category') ?? '';
    const availability = (params.get('availability') as 'all' | 'in_stock' | 'preorder') || 'all';
    const sort = (params.get('sort') as 'newest' | 'price_asc' | 'price_desc') || 'newest';
    const page = Number(params.get('page') ?? '1') || 1;

    const categories = getActiveCategories();
    const [loading, setLoading] = useState(true);
    const filtered = useMemo(
        () =>
            catalogProducts({
                query,
                categorySlug: categorySlug || undefined,
                availability,
                sort,
            }),
        [query, categorySlug, availability, sort],
    );
    const paged = paginate(filtered, page);

    useEffect(() => {
        setLoading(true);
        const id = window.setTimeout(() => setLoading(false), 350);
        return () => window.clearTimeout(id);
    }, [query, categorySlug, availability, sort, page]);

    function update(next: Record<string, string>) {
        const merged = new URLSearchParams(params);
        Object.entries(next).forEach(([key, value]) => {
            if (!value || value === 'all' || (key === 'sort' && value === 'newest') || (key === 'page' && value === '1')) {
                if (key === 'sort' && value === 'newest') {
                    merged.delete(key);
                } else if (key === 'page' && value === '1') {
                    merged.delete(key);
                } else if (!value || value === 'all') {
                    merged.delete(key);
                } else {
                    merged.set(key, value);
                }
            } else {
                merged.set(key, value);
            }
        });
        if ('q' in next || 'category' in next || 'availability' in next || 'sort' in next) {
            merged.delete('page');
        }
        setParams(merged);
    }

    return (
        <div className="page-shell">
            <h1 className="page-title">Shop</h1>
            <p className="page-lead">
                Active catalog with search, category filter, sort, and numbered pagination.
            </p>

            <div className="filters">
                <div className="field">
                    <label className="field__label" htmlFor="catalog-q">
                        Search
                    </label>
                    <input
                        id="catalog-q"
                        className="field__input"
                        value={query}
                        onChange={(e) => update({ q: e.target.value })}
                        placeholder="Product name"
                    />
                </div>
                <div className="field">
                    <label className="field__label" htmlFor="catalog-cat">
                        Category
                    </label>
                    <select
                        id="catalog-cat"
                        className="field__select"
                        value={categorySlug}
                        onChange={(e) => update({ category: e.target.value })}
                    >
                        <option value="">All categories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.slug}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="field">
                    <label className="field__label" htmlFor="catalog-avail">
                        Availability
                    </label>
                    <select
                        id="catalog-avail"
                        className="field__select"
                        value={availability}
                        onChange={(e) => update({ availability: e.target.value })}
                    >
                        <option value="all">All</option>
                        <option value="in_stock">In stock</option>
                        <option value="preorder">Pre-order</option>
                    </select>
                </div>
                <div className="field">
                    <label className="field__label" htmlFor="catalog-sort">
                        Sort
                    </label>
                    <select
                        id="catalog-sort"
                        className="field__select"
                        value={sort}
                        onChange={(e) => update({ sort: e.target.value })}
                    >
                        <option value="newest">Newest</option>
                        <option value="price_asc">Price: low to high</option>
                        <option value="price_desc">Price: high to low</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <LoadingSkeleton variant="catalog" label="Loading catalog" />
            ) : paged.items.length === 0 && query.trim() ? (
                <NoSearchResultsState
                    query={query.trim()}
                    suggestions={['mug', 'tote', 'linen']}
                    clearAction={{
                        label: 'Clear search',
                        onClick: () => setParams({}),
                    }}
                    reviseAction={{ label: 'Try “mug”', to: '/shop?q=mug' }}
                />
            ) : paged.items.length === 0 ? (
                <EmptyState
                    title="No products in this view"
                    reason="Filters removed every active catalog item from this list."
                    nextStep="Clear filters to see the full catalog again."
                    action={{ label: 'Clear filters', onClick: () => setParams({}) }}
                />
            ) : (
                <>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Showing {paged.items.length} of {paged.total} · page {paged.page} of{' '}
                        {paged.totalPages}
                    </p>
                    <div className="product-grid">
                        {paged.items.map((product) => (
                            <ProductCard key={product.id} product={product} showActions />
                        ))}
                    </div>
                    <nav className="pagination" aria-label="Catalog pages">
                        {Array.from({ length: paged.totalPages }, (_, i) => i + 1).map(
                            (pageNumber) => (
                                <button
                                    key={pageNumber}
                                    type="button"
                                    className={
                                        pageNumber === paged.page
                                            ? 'pagination__btn pagination__btn--current'
                                            : 'pagination__btn'
                                    }
                                    onClick={() => update({ page: String(pageNumber) })}
                                    aria-current={
                                        pageNumber === paged.page ? 'page' : undefined
                                    }
                                >
                                    {pageNumber}
                                </button>
                            ),
                        )}
                    </nav>
                </>
            )}

            <p className="mt-8 text-sm text-muted-foreground">
                Looking for categories? <Link to="/categories">Browse categories</Link>
            </p>
        </div>
    );
}
