import { Truck, ChatCircle } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductMedia from '@/components/ui/ProductMedia';
import { useCart } from '@/context/CartContext';
import { categories } from '@/data/categories';
import { storeSettings } from '@/data/storeSettings';
import {
    availableQuantity,
    canPurchaseVariant,
    formatDate,
    formatPeso,
    getDefaultOrFirstActiveVariant,
    getProductBySlug,
    hasSelectableVariants,
} from '@/data/selectors';

export default function ProductDetailPage() {
    const { slug } = useParams();
    const product = slug ? getProductBySlug(slug) : null;
    const navigate = useNavigate();
    const { addItem, replaceWithBuyNow } = useCart();

    const initialVariant = product
        ? getDefaultOrFirstActiveVariant(product)
        : null;
    const [variantId, setVariantId] = useState<number | null>(
        initialVariant?.id ?? null,
    );
    const [qty, setQty] = useState(1);
    const [imageIndex, setImageIndex] = useState(
        initialVariant?.imageIndex ?? 0,
    );

    function selectVariant(nextId: number, nextImageIndex?: number | null) {
        setVariantId(nextId);
        if (nextImageIndex != null && product && product.images[nextImageIndex]) {
            setImageIndex(nextImageIndex);
        }
    }

    const variant = useMemo(() => {
        if (!product || variantId == null) {
            return null;
        }
        return product.variants.find((v) => v.id === variantId) ?? null;
    }, [product, variantId]);

    if (!product) {
        return (
            <div className="page-shell">
                <div className="empty-state">
                    <h1 className="empty-state__title">Product not found</h1>
                    <div className="empty-state__action">
                        <Link to="/shop" className="btn btn--secondary">
                            Back to shop
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (product.status !== 'active') {
        return (
            <div className="page-shell">
                <div className="empty-state">
                    <h1 className="empty-state__title">Unavailable</h1>
                    <p className="empty-state__text">
                        This product is {product.status} and cannot be purchased.
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

    const category = categories.find((c) => c.id === product.categoryId);
    const image = product.images[imageIndex] ?? product.images[0];
    const selectable = hasSelectableVariants(product);
    const purchasable = variant ? canPurchaseVariant(product, variant) : false;
    const available = variant ? availableQuantity(variant) : 0;

    function onAdd() {
        if (!variant || !purchasable) {
            return;
        }
        addItem(product!.id, variant.id, qty);
    }

    function onBuyNow() {
        if (!variant || !purchasable) {
            return;
        }
        replaceWithBuyNow(product!.id, variant.id, qty);
        navigate('/checkout?mode=buy-now');
    }

    return (
        <div className="page-shell">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
                <Link to="/">Home</Link>
                <span className="breadcrumbs__sep">/</span>
                {category ? (
                    <>
                        <Link to={`/categories/${category.slug}`}>{category.name}</Link>
                        <span className="breadcrumbs__sep">/</span>
                    </>
                ) : null}
                <span>{product.name}</span>
            </nav>

            <div className="pdp">
                <div>
                    <div className="pdp__gallery-main">
                        <ProductMedia
                            src={image?.src}
                            tone={image?.tone}
                            label={image?.label}
                            alt={image?.altText ?? product.name}
                        />
                    </div>
                    {product.images.length > 1 ? (
                        <div className="pdp__thumbs">
                            {product.images.map((img, index) => (
                                <button
                                    key={img.id}
                                    type="button"
                                    className={
                                        index === imageIndex
                                            ? 'pdp__thumb pdp__thumb--active'
                                            : 'pdp__thumb'
                                    }
                                    onClick={() => setImageIndex(index)}
                                    aria-label={`Show image ${index + 1}`}
                                >
                                    <ProductMedia
                                        src={img.src}
                                        tone={img.tone}
                                        label={img.label}
                                        alt={img.altText}
                                    />
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>

                <div>
                    <h1 className="pdp__title">{product.name}</h1>
                    <p className="pdp__desc">{product.description}</p>
                    {product.isPreorder ? (
                        <p className="mt-4">
                            <span className="badge badge--preorder">Pre-order</span>
                            <span className="ml-2 text-sm text-muted-foreground">
                                Available {formatDate(product.preorderAvailableAt)}
                            </span>
                        </p>
                    ) : null}
                    <p className="pdp__price">
                        {variant ? formatPeso(variant.price) : 'Select a variant'}
                    </p>

                    {selectable ? (
                        <div className="pdp__variants">
                            <p className="text-sm font-semibold">Choose a variant</p>
                            <div className="pdp__variant-list" role="list">
                                {product.variants.map((v) => {
                                    const label =
                                        v.name ??
                                        (v.attributes
                                            ? Object.values(v.attributes).join(' / ')
                                            : 'Default');
                                    const disabled = !canPurchaseVariant(product, v);
                                    return (
                                        <button
                                            key={v.id}
                                            type="button"
                                            className={
                                                v.id === variantId
                                                    ? 'pdp__variant pdp__variant--active'
                                                    : 'pdp__variant'
                                            }
                                            disabled={disabled}
                                            onClick={() => selectVariant(v.id, v.imageIndex)}
                                            aria-disabled={disabled}
                                        >
                                            {label}
                                            {disabled ? ' (unavailable)' : ''}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}

                    <div className="pdp__qty">
                        <div className="qty-stepper" aria-label="Quantity">
                            <button
                                type="button"
                                className="qty-stepper__btn"
                                onClick={() => setQty((q) => Math.max(1, q - 1))}
                                aria-label="Decrease quantity"
                            >
                                −
                            </button>
                            <span className="qty-stepper__value">{qty}</span>
                            <button
                                type="button"
                                className="qty-stepper__btn"
                                onClick={() => setQty((q) => q + 1)}
                                aria-label="Increase quantity"
                            >
                                +
                            </button>
                        </div>
                        {!product.isPreorder && variant ? (
                            <p className="text-sm text-muted-foreground">
                                {available === 0
                                    ? 'Out of stock'
                                    : available <= 5
                                      ? `Only ${available} left`
                                      : `${available} available`}
                            </p>
                        ) : null}
                    </div>

                    <div className="pdp__actions">
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

                    <div className="pdp__delivery">
                        <div className="pdp__delivery-row">
                            <Truck size={20} aria-hidden="true" />
                            <div>
                                <p className="font-medium">Seller-operated delivery</p>
                                <p className="text-muted-foreground">
                                    {storeSettings.defaultDeliveryTimeframe} · fee{' '}
                                    {formatPeso(storeSettings.defaultDeliveryFee)} (snapshot at
                                    checkout)
                                </p>
                            </div>
                        </div>
                        <div className="pdp__delivery-row">
                            <ChatCircle size={20} aria-hidden="true" />
                            <div>
                                <p className="font-medium">COD &amp; GCash</p>
                                <p className="text-muted-foreground">
                                    GCash proof via{' '}
                                    <a
                                        href={storeSettings.messengerUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Messenger
                                    </a>{' '}
                                    — clicking Messenger does not mark payment paid.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
