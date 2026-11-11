import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type PropsWithChildren,
} from 'react';
import { getProductById, getVariant } from '@/data/selectors';
import type { CartLine } from '@/types';

const STORAGE_KEY = 'kevin-store-preview-cart';

type CartContextValue = {
    lines: CartLine[];
    itemCount: number;
    addItem: (productId: number, variantId: number, quantity?: number) => void;
    setQuantity: (productId: number, variantId: number, quantity: number) => void;
    removeItem: (productId: number, variantId: number) => void;
    clear: () => void;
    replaceWithBuyNow: (productId: number, variantId: number, quantity: number) => void;
    loadSampleCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartLine[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw) as CartLine[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function CartProvider({ children }: PropsWithChildren) {
    const [lines, setLines] = useState<CartLine[]>(() =>
        typeof window === 'undefined' ? [] : readStorage(),
    );

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    }, [lines]);

    const value = useMemo<CartContextValue>(() => {
        const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

        return {
            lines,
            itemCount,
            addItem(productId, variantId, quantity = 1) {
                const product = getProductById(productId);
                const variant = product ? getVariant(product, variantId) : null;
                if (!product || !variant || variant.status !== 'active') {
                    return;
                }
                setLines((prev) => {
                    const existing = prev.find(
                        (l) => l.productId === productId && l.variantId === variantId,
                    );
                    if (existing) {
                        return prev.map((l) =>
                            l.productId === productId && l.variantId === variantId
                                ? { ...l, quantity: l.quantity + quantity }
                                : l,
                        );
                    }
                    return [...prev, { productId, variantId, quantity }];
                });
            },
            setQuantity(productId, variantId, quantity) {
                if (quantity < 1) {
                    setLines((prev) =>
                        prev.filter(
                            (l) =>
                                !(l.productId === productId && l.variantId === variantId),
                        ),
                    );
                    return;
                }
                setLines((prev) =>
                    prev.map((l) =>
                        l.productId === productId && l.variantId === variantId
                            ? { ...l, quantity }
                            : l,
                    ),
                );
            },
            removeItem(productId, variantId) {
                setLines((prev) =>
                    prev.filter(
                        (l) => !(l.productId === productId && l.variantId === variantId),
                    ),
                );
            },
            clear() {
                setLines([]);
            },
            replaceWithBuyNow(productId, variantId, quantity) {
                setLines([{ productId, variantId, quantity }]);
            },
            loadSampleCart() {
                setLines([
                    { productId: 1, variantId: 102, quantity: 1 },
                    { productId: 2, variantId: 201, quantity: 2 },
                ]);
            },
        };
    }, [lines]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error('useCart must be used within CartContext');
    }
    return ctx;
}
