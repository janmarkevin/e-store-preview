import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type PropsWithChildren,
} from 'react';
import { categories as seedCategories } from '@/data/categories';
import { inventoryMovements as seedMovements } from '@/data/inventoryMovements';
import { orders as seedOrders } from '@/data/orders';
import { payments as seedPayments } from '@/data/payments';
import { products as seedProducts } from '@/data/products';
import { storeSettings as seedSettings } from '@/data/storeSettings';
import { allowedOrderTransitions } from '@/lib/orderTransitions';
import type {
    Category,
    InventoryMovement,
    Order,
    OrderStatus,
    Payment,
    PaymentStatus,
    Product,
    StoreSettings,
} from '@/types';

type AdminProfile = {
    name: string;
    email: string;
};

type AdminStoreValue = {
    orders: Order[];
    payments: Payment[];
    products: Product[];
    categories: Category[];
    movements: InventoryMovement[];
    settings: StoreSettings;
    profile: AdminProfile;
    transitionOrder: (orderId: number, next: OrderStatus, note?: string) => { ok: boolean; message?: string };
    updatePaymentStatus: (
        paymentId: number,
        status: PaymentStatus,
        notes?: string,
    ) => { ok: boolean; message?: string };
    adjustStock: (
        variantId: number,
        delta: number,
        reason: string,
    ) => { ok: boolean; message?: string };
    updateSettings: (patch: Partial<StoreSettings>) => void;
    updateProfile: (patch: Partial<AdminProfile>) => void;
    upsertProduct: (product: Product) => void;
    upsertCategory: (category: Category) => void;
    archiveProduct: (productId: number) => void;
    setCategoryActive: (categoryId: number, isActive: boolean) => void;
};

const AdminStoreContext = createContext<AdminStoreValue | null>(null);

function nowIso() {
    return new Date().toISOString().replace('Z', '+08:00');
}

export function AdminStoreProvider({ children }: PropsWithChildren) {
    const [orders, setOrders] = useState(() => structuredClone(seedOrders));
    const [payments, setPayments] = useState(() => structuredClone(seedPayments));
    const [products, setProducts] = useState(() => structuredClone(seedProducts));
    const [categories, setCategories] = useState(() => structuredClone(seedCategories));
    const [movements, setMovements] = useState(() => structuredClone(seedMovements));
    const [settings, setSettings] = useState(() => structuredClone(seedSettings));
    const [profile, setProfile] = useState<AdminProfile>({
        name: 'Kevin Admin',
        email: 'admin@kevinstore.demo',
    });

    const transitionOrder = useCallback((orderId: number, next: OrderStatus, note?: string) => {
        const order = orders.find((o) => o.id === orderId);
        if (!order) {
            return { ok: false, message: 'Order not found.' };
        }
        const allowed = allowedOrderTransitions(order.status);
        if (!allowed.includes(next)) {
            return {
                ok: false,
                message: `Cannot move from ${order.status} to ${next} (R1 / workflow).`,
            };
        }

        setOrders((prev) =>
            prev.map((o) => {
                if (o.id !== orderId) {
                    return o;
                }
                const history = [
                    ...o.history,
                    {
                        id: Date.now(),
                        fromStatus: o.status,
                        toStatus: next,
                        note: note ?? null,
                        createdAt: nowIso(),
                    },
                ];
                return {
                    ...o,
                    status: next,
                    deliveredAt: next === 'delivered' ? nowIso() : o.deliveredAt,
                    history,
                };
            }),
        );

        if (next === 'ready_for_delivery') {
            setMovements((prev) => [
                {
                    id: Date.now(),
                    variantId: order.items[0]?.variantId ?? 0,
                    type: 'fulfillment',
                    quantity: order.items[0]?.quantity ?? 1,
                    reason: `ready_for_delivery ${order.orderNumber}`,
                    createdAt: nowIso(),
                },
                ...prev,
            ]);
        }

        if (next === 'cancelled') {
            setMovements((prev) => [
                {
                    id: Date.now(),
                    variantId: order.items[0]?.variantId ?? 0,
                    type: 'reservation_release',
                    quantity: order.items[0]?.quantity ?? 1,
                    reason: `Cancel ${order.orderNumber}`,
                    createdAt: nowIso(),
                },
                ...prev,
            ]);
        }

        return { ok: true };
    }, [orders]);

    const updatePaymentStatus = useCallback(
        (paymentId: number, status: PaymentStatus, notes?: string) => {
            const payment = payments.find((p) => p.id === paymentId);
            if (!payment) {
                return { ok: false, message: 'Payment not found.' };
            }

            const verified =
                status === 'paid' || status === 'rejected' ? nowIso() : null;

            setPayments((prev) =>
                prev.map((p) =>
                    p.id === paymentId
                        ? {
                              ...p,
                              status,
                              verifiedAt: verified,
                              notes: notes ?? p.notes,
                          }
                        : p,
                ),
            );

            // Mirror denormalized fields on order — payment remains independent of order status
            setOrders((prev) =>
                prev.map((o) =>
                    o.id === payment.orderId
                        ? { ...o, paymentStatus: status, paymentMethod: payment.method }
                        : o,
                ),
            );

            return { ok: true };
        },
        [payments],
    );

    const adjustStock = useCallback((variantId: number, delta: number, reason: string) => {
        if (!reason.trim()) {
            return { ok: false, message: 'A reason/note is required for stock adjustments.' };
        }

        let found = false;
        setProducts((prev) =>
            prev.map((product) => ({
                ...product,
                variants: product.variants.map((variant) => {
                    if (variant.id !== variantId) {
                        return variant;
                    }
                    found = true;
                    const nextQty = Math.max(0, variant.stockQuantity + delta);
                    return { ...variant, stockQuantity: nextQty };
                }),
            })),
        );

        if (!found) {
            return { ok: false, message: 'Variant not found.' };
        }

        setMovements((prev) => [
            {
                id: Date.now(),
                variantId,
                type: 'adjustment',
                quantity: Math.abs(delta),
                reason: reason.trim(),
                createdAt: nowIso(),
            },
            ...prev,
        ]);

        return { ok: true };
    }, []);

    const value = useMemo<AdminStoreValue>(
        () => ({
            orders,
            payments,
            products,
            categories,
            movements,
            settings,
            profile,
            transitionOrder,
            updatePaymentStatus,
            adjustStock,
            updateSettings(patch) {
                setSettings((prev) => ({ ...prev, ...patch }));
            },
            updateProfile(patch) {
                setProfile((prev) => ({ ...prev, ...patch }));
            },
            upsertProduct(product) {
                setProducts((prev) => {
                    const idx = prev.findIndex((p) => p.id === product.id);
                    if (idx === -1) {
                        return [product, ...prev];
                    }
                    const next = [...prev];
                    next[idx] = product;
                    return next;
                });
            },
            upsertCategory(category) {
                setCategories((prev) => {
                    const idx = prev.findIndex((c) => c.id === category.id);
                    if (idx === -1) {
                        return [...prev, category].sort((a, b) => a.sortOrder - b.sortOrder);
                    }
                    const next = [...prev];
                    next[idx] = category;
                    return next.sort((a, b) => a.sortOrder - b.sortOrder);
                });
            },
            archiveProduct(productId) {
                setProducts((prev) =>
                    prev.map((p) =>
                        p.id === productId ? { ...p, status: 'archived' } : p,
                    ),
                );
            },
            setCategoryActive(categoryId, isActive) {
                setCategories((prev) =>
                    prev.map((c) => (c.id === categoryId ? { ...c, isActive } : c)),
                );
            },
        }),
        [
            orders,
            payments,
            products,
            categories,
            movements,
            settings,
            profile,
            transitionOrder,
            updatePaymentStatus,
            adjustStock,
        ],
    );

    return (
        <AdminStoreContext.Provider value={value}>{children}</AdminStoreContext.Provider>
    );
}

export function useAdminStore() {
    const ctx = useContext(AdminStoreContext);
    if (!ctx) {
        throw new Error('useAdminStore must be used within AdminStoreProvider');
    }
    return ctx;
}
