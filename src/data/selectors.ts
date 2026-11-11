import { categories } from '@/data/categories';
import { orders } from '@/data/orders';
import { payments } from '@/data/payments';
import { products } from '@/data/products';
import { storeSettings } from '@/data/storeSettings';
import { trackingTokens } from '@/data/trackingTokens';
import type {
    Order,
    OrderStatus,
    Product,
    ProductVariant,
} from '@/types';

export const CATALOG_PAGE_SIZE = 8;

export function availableQuantity(variant: ProductVariant): number {
    return Math.max(0, variant.stockQuantity - variant.reservedQuantity);
}

export function isCatalogVisible(product: Product): boolean {
    return product.status === 'active';
}

export function getActiveCategories() {
    return categories
        .filter((c) => c.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategoryBySlug(slug: string) {
    return categories.find((c) => c.slug === slug) ?? null;
}

export function getProductBySlug(slug: string) {
    return products.find((p) => p.slug === slug) ?? null;
}

export function getProductById(id: number) {
    return products.find((p) => p.id === id) ?? null;
}

export function getVariant(product: Product, variantId: number) {
    return product.variants.find((v) => v.id === variantId) ?? null;
}

export function variantDisplayLabel(variant: ProductVariant): string {
    if (variant.name) {
        return variant.name;
    }
    if (variant.attributes) {
        return Object.values(variant.attributes).join(' / ');
    }
    return 'Default';
}

export function productImageForVariant(product: Product, variant?: ProductVariant | null) {
    if (variant?.imageIndex != null && product.images[variant.imageIndex]) {
        return product.images[variant.imageIndex];
    }
    return product.images.find((i) => i.isPrimary) ?? product.images[0] ?? null;
}

export function getDefaultOrFirstActiveVariant(product: Product) {
    const active = product.variants.filter((v) => v.status === 'active');
    return active.find((v) => v.isDefault) ?? active[0] ?? null;
}

export function hasSelectableVariants(product: Product) {
    const active = product.variants.filter((v) => v.status === 'active');
    if (active.length <= 1) {
        return false;
    }
    return active.some((v) => !v.isDefault || v.attributes);
}

export function catalogProducts(filters?: {
    query?: string;
    categorySlug?: string;
    availability?: 'all' | 'in_stock' | 'preorder';
    sort?: 'newest' | 'price_asc' | 'price_desc';
}) {
    let list = products.filter(isCatalogVisible);

    if (filters?.categorySlug) {
        const category = getCategoryBySlug(filters.categorySlug);
        if (!category || !category.isActive) {
            list = [];
        } else {
            list = list.filter((p) => p.categoryId === category.id);
        }
    }

    if (filters?.query?.trim()) {
        const q = filters.query.trim().toLowerCase();
        list = list.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q),
        );
    }

    if (filters?.availability === 'preorder') {
        list = list.filter((p) => p.isPreorder);
    } else if (filters?.availability === 'in_stock') {
        list = list.filter((p) => {
            if (p.isPreorder) {
                return false;
            }
            return p.variants.some(
                (v) => v.status === 'active' && availableQuantity(v) > 0,
            );
        });
    }

    const sort = filters?.sort ?? 'newest';
    list = [...list].sort((a, b) => {
        if (sort === 'newest') {
            return b.createdAt.localeCompare(a.createdAt);
        }
        const priceA = Math.min(
            ...a.variants.filter((v) => v.status === 'active').map((v) => v.price),
        );
        const priceB = Math.min(
            ...b.variants.filter((v) => v.status === 'active').map((v) => v.price),
        );
        return sort === 'price_asc' ? priceA - priceB : priceB - priceA;
    });

    return list;
}

export function paginate<T>(items: T[], page: number, pageSize = CATALOG_PAGE_SIZE) {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;
    return {
        items: items.slice(start, start + pageSize),
        page: safePage,
        totalPages,
        total: items.length,
    };
}

export function featuredProducts() {
    return storeSettings.featuredProductIds
        .map((id) => getProductById(id))
        .filter((p): p is Product => !!p && isCatalogVisible(p));
}

export function getOrderById(id: number) {
    return orders.find((o) => o.id === id) ?? null;
}

export function getOrderByNumber(orderNumber: string) {
    return orders.find((o) => o.orderNumber === orderNumber) ?? null;
}

export function getOrderByTrackingToken(token: string) {
    const map = trackingTokens.find((t) => t.token === token);
    if (!map) {
        return null;
    }
    return getOrderById(map.orderId);
}

export function getPaymentForOrder(orderId: number) {
    return payments.find((p) => p.orderId === orderId) ?? null;
}

export function countOrdersByStatus(status: OrderStatus) {
    return orders.filter((o) => o.status === status).length;
}

export function paymentsAwaitingVerification() {
    return payments.filter((p) => p.status === 'pending_verification');
}

export function paidSalesInRange(startIso: string, endIso: string) {
    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();
    return payments
        .filter((p) => p.status === 'paid' && p.verifiedAt)
        .filter((p) => {
            const t = new Date(p.verifiedAt!).getTime();
            return t >= start && t <= end;
        })
        .reduce((sum, p) => sum + p.amount, 0);
}

export function paidSalesSeries() {
    const paid = payments
        .filter((p) => p.status === 'paid' && p.verifiedAt)
        .sort((a, b) => a.verifiedAt!.localeCompare(b.verifiedAt!));

    const buckets = new Map<string, number>();
    for (const payment of paid) {
        const day = payment.verifiedAt!.slice(0, 10);
        buckets.set(day, (buckets.get(day) ?? 0) + payment.amount);
    }
    return Array.from(buckets.entries()).map(([date, amount]) => ({ date, amount }));
}

export function lowStockVariants(threshold = 5) {
    const rows: Array<{
        product: Product;
        variant: ProductVariant;
        available: number;
    }> = [];

    for (const product of products) {
        if (product.status !== 'active' || product.isPreorder) {
            continue;
        }
        for (const variant of product.variants) {
            if (variant.status !== 'active') {
                continue;
            }
            const available = availableQuantity(variant);
            if (available <= threshold) {
                rows.push({ product, variant, available });
            }
        }
    }

    return rows.sort((a, b) => a.available - b.available);
}

export function recentOrders(limit = 6): Order[] {
    return [...orders]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limit);
}

export function priceLabel(product: Product): string {
    const active = product.variants.filter((v) => v.status === 'active');
    if (active.length === 0) {
        return '—';
    }
    const prices = active.map((v) => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) {
        return formatPeso(min);
    }
    return `${formatPeso(min)} – ${formatPeso(max)}`;
}

export function formatPeso(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(amount);
}

export function formatDate(iso: string | null): string {
    if (!iso) {
        return '—';
    }
    return new Intl.DateTimeFormat('en-PH', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(iso));
}

export function orderStatusLabel(status: OrderStatus): string {
    return status.replaceAll('_', ' ');
}

export function canPurchaseVariant(product: Product, variant: ProductVariant) {
    if (product.status !== 'active') {
        return false;
    }
    if (variant.status !== 'active') {
        return false;
    }
    if (product.isPreorder) {
        if (product.preorderLimit == null) {
            return true;
        }
        return product.preorderReservedQuantity < product.preorderLimit;
    }
    return availableQuantity(variant) > 0;
}
