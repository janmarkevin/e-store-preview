import { Link } from 'react-router-dom';
import ProductMedia from '@/components/ui/ProductMedia';
import { EmptyState } from '@/components/ui/UiStates';
import { useCart } from '@/context/CartContext';
import {
    formatPeso,
    getProductById,
    getVariant,
    productImageForVariant,
    variantDisplayLabel,
} from '@/data/selectors';

export default function CartPage() {
    const { lines, setQuantity, removeItem, clear, loadSampleCart } = useCart();

    const resolved = lines
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
    }>;

    const subtotal = resolved.reduce(
        (sum, row) => sum + row.variant.price * row.line.quantity,
        0,
    );

    if (resolved.length === 0) {
        return (
            <div className="page-shell">
                <h1 className="page-title">Cart</h1>
                <EmptyState
                    title="Your cart is empty"
                    reason="You haven’t added any products yet, so there’s nothing to check out."
                    nextStep="Browse the catalog, or load the sample cart for a client walkthrough."
                    action={{ label: 'Browse catalog', to: '/shop' }}
                />
                <div className="mt-4">
                    <button type="button" className="btn btn--secondary" onClick={loadSampleCart}>
                        Load sample cart
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-shell">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h1 className="page-title mb-0">Cart</h1>
                <button type="button" className="btn btn--ghost" onClick={clear}>
                    Clear cart
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="cart-table">
                    <tbody>
                        {resolved.map(({ line, product, variant }) => {
                            const image = productImageForVariant(product, variant);
                            const label = variantDisplayLabel(variant);
                            return (
                                <tr key={`${line.productId}-${line.variantId}`} className="cart-line">
                                    <td className="w-24">
                                        <div className="h-20 w-20 overflow-hidden rounded-lg">
                                            <ProductMedia
                                                src={image?.src}
                                                tone={image?.tone}
                                                label={image?.label}
                                                alt={product.name}
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <Link
                                            to={`/products/${product.slug}`}
                                            className="font-semibold"
                                        >
                                            {product.name}
                                        </Link>
                                        <p className="text-sm text-muted-foreground">
                                            Variant: {label}
                                        </p>
                                    </td>
                                    <td>{formatPeso(variant.price)}</td>
                                    <td>
                                        <div className="qty-stepper">
                                            <button
                                                type="button"
                                                className="qty-stepper__btn"
                                                onClick={() =>
                                                    setQuantity(
                                                        line.productId,
                                                        line.variantId,
                                                        line.quantity - 1,
                                                    )
                                                }
                                                aria-label="Decrease quantity"
                                            >
                                                −
                                            </button>
                                            <span className="qty-stepper__value">
                                                {line.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                className="qty-stepper__btn"
                                                onClick={() =>
                                                    setQuantity(
                                                        line.productId,
                                                        line.variantId,
                                                        line.quantity + 1,
                                                    )
                                                }
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </td>
                                    <td className="font-medium">
                                        {formatPeso(variant.price * line.quantity)}
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn--ghost"
                                            onClick={() =>
                                                removeItem(line.productId, line.variantId)
                                            }
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 flex flex-col items-end gap-4">
                <p className="text-sm text-muted-foreground">
                    Subtotal estimate {formatPeso(subtotal)} — revalidated at checkout in production.
                </p>
                <Link to="/checkout" className="btn btn--primary">
                    Checkout
                </Link>
            </div>
        </div>
    );
}
