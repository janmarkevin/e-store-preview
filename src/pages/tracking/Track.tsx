import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductMedia from '@/components/ui/ProductMedia';
import {
    formatDate,
    formatPeso,
    getOrderByTrackingToken,
    getPaymentForOrder,
    getProductById,
    getVariant,
    orderStatusLabel,
    productImageForVariant,
    variantDisplayLabel,
} from '@/data/selectors';
import { trackingTokens } from '@/data/trackingTokens';

export default function TrackPage() {
    const { token: routeToken } = useParams();
    const navigate = useNavigate();
    const [tokenInput, setTokenInput] = useState(routeToken ?? '');

    const order = routeToken ? getOrderByTrackingToken(routeToken) : null;
    const payment = order ? getPaymentForOrder(order.id) : null;

    function onSubmit(event: FormEvent) {
        event.preventDefault();
        const next = tokenInput.trim();
        if (!next) {
            return;
        }
        navigate(`/track/${encodeURIComponent(next)}`);
    }

    if (!routeToken) {
        return (
            <div className="page-shell">
                <h1 className="page-title">Track order</h1>
                <p className="page-lead">
                    Enter a secure tracking token. Demo tokens are listed below for client walkthroughs.
                </p>
                <form className="max-w-lg rounded-xl bg-surface p-6 shadow-sm" onSubmit={onSubmit}>
                    <div className="field">
                        <label className="field__label" htmlFor="track-token">
                            Tracking token
                        </label>
                        <input
                            id="track-token"
                            className="field__input"
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            placeholder="demo-track-pending"
                        />
                    </div>
                    <button type="submit" className="btn btn--primary mt-4">
                        Track
                    </button>
                </form>
                <ul className="mt-8 space-y-2 text-sm">
                    {trackingTokens.map((t) => (
                        <li key={t.token}>
                            <Link className="underline-offset-2 hover:underline" to={`/track/${t.token}`}>
                                {t.token}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="page-shell">
                <div className="empty-state">
                    <h1 className="empty-state__title">Tracking link not found</h1>
                    <p className="empty-state__text">
                        This preview does not reveal whether an order number exists. Try a demo token.
                    </p>
                    <div className="empty-state__action">
                        <Link to="/track" className="btn btn--secondary">
                            Back to tracking
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-shell">
            <h1 className="page-title">Order {order.orderNumber}</h1>
            <p className="page-lead">
                Customer-safe tracking view. Private address details are omitted.
            </p>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl bg-surface p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground">Order status</p>
                    <p className="mt-1">
                        <span className={`badge badge--status badge--${order.status}`}>
                            {orderStatusLabel(order.status)}
                        </span>
                    </p>
                    <p className="mt-4 text-sm text-muted-foreground">Payment</p>
                    <p className="mt-1 text-sm">
                        {order.paymentMethod.toUpperCase()} ·{' '}
                        <span
                            className={`badge badge--status badge--${payment?.status ?? order.paymentStatus}`}
                        >
                            {payment?.status ?? order.paymentStatus}
                        </span>
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Payment status and order status are independent.
                    </p>
                    <p className="mt-4 text-sm text-muted-foreground">Delivery estimate</p>
                    <p className="font-medium">{formatDate(order.estimatedDeliveryAt)}</p>
                    {order.deliveredAt ? (
                        <>
                            <p className="mt-4 text-sm text-muted-foreground">Delivered</p>
                            <p className="font-medium">{formatDate(order.deliveredAt)}</p>
                        </>
                    ) : null}
                    <p className="mt-4 text-sm text-muted-foreground">Total</p>
                    <p className="text-lg font-semibold">{formatPeso(order.total)}</p>
                </div>

                <div className="rounded-xl bg-surface p-6 shadow-sm">
                    <h2 className="mb-4 font-semibold">Items</h2>
                    <ul className="space-y-1 text-sm">
                        {order.items.map((item) => {
                            const product = getProductById(item.productId);
                            const variant = product
                                ? getVariant(product, item.variantId)
                                : null;
                            const image = product
                                ? productImageForVariant(product, variant)
                                : null;
                            const label =
                                item.variantLabel ||
                                (variant ? variantDisplayLabel(variant) : 'Default');

                            return (
                                <li key={item.id} className="track-item">
                                    <div className="track-item__product">
                                        <div className="track-item__thumb">
                                            <ProductMedia
                                                src={image?.src}
                                                tone={image?.tone}
                                                label={image?.label}
                                                alt={item.productName}
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {item.productName} × {item.quantity}
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                Variant: {label}
                                                {item.isPreorder ? ' · Pre-order' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="shrink-0 font-medium">
                                        {formatPeso(item.lineSubtotal)}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>

                    <h2 className="mb-3 mt-8 font-semibold">Status timeline</h2>
                    <ol className="status-timeline">
                        {order.history.map((entry) => (
                            <li key={entry.id} className="status-timeline__item">
                                <p className="font-medium capitalize">
                                    {orderStatusLabel(entry.toStatus)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(entry.createdAt)}
                                </p>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>
    );
}
