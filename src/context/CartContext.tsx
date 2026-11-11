import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type PropsWithChildren,
} from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, X } from '@phosphor-icons/react';
import { getProductById, getVariant, variantDisplayLabel } from '@/data/selectors';
import type { CartLine } from '@/types';

const STORAGE_KEY = 'kevin-store-preview-cart';
const TOAST_MS = 4000;

type CartToast = {
    id: number;
    title: string;
    detail: string;
};

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
    const [toast, setToast] = useState<CartToast | null>(null);
    const toastTimer = useRef<number | null>(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    }, [lines]);

    useEffect(() => {
        return () => {
            if (toastTimer.current != null) {
                window.clearTimeout(toastTimer.current);
            }
        };
    }, []);

    const showAddedToast = useCallback((productId: number, variantId: number, quantity: number) => {
        const product = getProductById(productId);
        const variant = product ? getVariant(product, variantId) : null;
        if (!product || !variant) {
            return;
        }
        const variantLabel = variantDisplayLabel(variant);
        setToast({
            id: Date.now(),
            title: 'Already added to the cart',
            detail:
                quantity > 1
                    ? `${quantity} × ${product.name}${variantLabel !== 'Default' ? ` · ${variantLabel}` : ''}`
                    : `${product.name}${variantLabel !== 'Default' ? ` · ${variantLabel}` : ''}`,
        });
        if (toastTimer.current != null) {
            window.clearTimeout(toastTimer.current);
        }
        toastTimer.current = window.setTimeout(() => {
            setToast(null);
            toastTimer.current = null;
        }, TOAST_MS);
    }, []);

    const dismissToast = useCallback(() => {
        if (toastTimer.current != null) {
            window.clearTimeout(toastTimer.current);
            toastTimer.current = null;
        }
        setToast(null);
    }, []);

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
                showAddedToast(productId, variantId, quantity);
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
    }, [lines, showAddedToast]);

    return (
        <CartContext.Provider value={value}>
            {children}
            {toast ? (
                <div
                    className="cart-toast"
                    role="status"
                    aria-live="polite"
                    key={toast.id}
                >
                    <CheckCircle
                        className="cart-toast__icon"
                        size={22}
                        weight="fill"
                        aria-hidden
                    />
                    <div className="cart-toast__body">
                        <p className="cart-toast__title">{toast.title}</p>
                        <p className="cart-toast__detail">{toast.detail}</p>
                        <Link to="/cart" className="cart-toast__link" onClick={dismissToast}>
                            View cart
                        </Link>
                    </div>
                    <button
                        type="button"
                        className="cart-toast__close"
                        aria-label="Dismiss notification"
                        onClick={dismissToast}
                    >
                        <X size={16} aria-hidden />
                    </button>
                </div>
            ) : null}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) {
        throw new Error('useCart must be used within CartContext');
    }
    return ctx;
}
