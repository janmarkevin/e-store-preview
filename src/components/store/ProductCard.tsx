import type { MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductMedia from '@/components/ui/ProductMedia';
import { useCart } from '@/context/CartContext';
import {
    canPurchaseVariant,
    getDefaultOrFirstActiveVariant,
    priceLabel,
} from '@/data/selectors';
import type { Product } from '@/types';

type ProductCardProps = {
    product: Product;
    /** Shop catalog only — Add to Cart + Buy Now under the price */
    showActions?: boolean;
};

export default function ProductCard({ product, showActions = false }: ProductCardProps) {
    const primary = product.images.find((i) => i.isPrimary) ?? product.images[0];
    const navigate = useNavigate();
    const { addItem, replaceWithBuyNow } = useCart();
    const variant = getDefaultOrFirstActiveVariant(product);
    const purchasable = variant ? canPurchaseVariant(product, variant) : false;

    function onAdd(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        event.stopPropagation();
        if (!variant || !purchasable) {
            return;
        }
        addItem(product.id, variant.id, 1);
    }

    function onBuyNow(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        event.stopPropagation();
        if (!variant || !purchasable) {
            return;
        }
        replaceWithBuyNow(product.id, variant.id, 1);
        navigate('/checkout?mode=buy-now');
    }

    return (
        <article className="product-card">
            <Link to={`/products/${product.slug}`} className="product-card__image">
                {product.isPreorder ? (
                    <span className="product-card__badge badge badge--preorder">Pre-order</span>
                ) : null}
                <ProductMedia
                    src={primary?.src}
                    tone={primary?.tone}
                    label={primary?.label}
                    alt={primary?.altText ?? product.name}
                />
            </Link>
            <div className="product-card__body">
                <h3 className="product-card__title">
                    <Link to={`/products/${product.slug}`}>{product.name}</Link>
                </h3>
                <p className="product-card__price">{priceLabel(product)}</p>
                {showActions ? (
                    <div className="product-card__actions">
                        <button
                            type="button"
                            className="btn btn--secondary"
                            disabled={!purchasable}
                            onClick={onAdd}
                        >
                            Add to Cart
                        </button>
                        <button
                            type="button"
                            className="btn btn--primary"
                            disabled={!purchasable}
                            onClick={onBuyNow}
                        >
                            Buy Now
                        </button>
                    </div>
                ) : null}
            </div>
        </article>
    );
}
