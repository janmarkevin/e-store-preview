import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AdminPageFrame from '@/components/admin/AdminPageFrame';
import { ErrorState, SuccessState } from '@/components/ui/UiStates';
import { useAdminStore } from '@/context/AdminStoreContext';
import { formatDate, formatPeso, orderStatusLabel } from '@/data/selectors';
import { allowedOrderTransitions } from '@/lib/orderTransitions';
import type { OrderStatus } from '@/types';

export default function AdminOrderDetailPage() {
    const { id } = useParams();
    const orderId = Number(id);
    const { orders, payments, transitionOrder } = useAdminStore();
    const [flash, setFlash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const order = useMemo(() => orders.find((o) => o.id === orderId) ?? null, [orders, orderId]);
    const payment = order ? payments.find((p) => p.orderId === order.id) ?? null : null;
    const nextStatuses = order ? allowedOrderTransitions(order.status) : [];

    if (!order) {
        return (
            <div className="admin-page">
                <ErrorState
                    title="Order not found"
                    whatFailed={`No mock order matched id ${id}.`}
                    whoseFault="Likely a bad demo link — not a permissions issue."
                    howToFix="Return to the orders list and open a valid order."
                    retry={{ label: 'Back to orders', to: '/admin/orders' }}
                />
            </div>
        );
    }

    function apply(next: OrderStatus) {
        setFlash(null);
        setError(null);
        const result = transitionOrder(order!.id, next);
        if (!result.ok) {
            setError(result.message ?? 'Transition blocked');
            return;
        }
        setFlash(`Order moved to ${orderStatusLabel(next)}. Payment status was not changed.`);
    }

    return (
        <AdminPageFrame
            title={order.orderNumber}
            description="Admin order review + allowed transitions. Payment status stays independent."
            actions={
                <Link to="/admin/orders" className="btn btn--secondary">
                    Back to list
                </Link>
            }
        >
            {flash ? (
                <div className="mb-4">
                    <SuccessState
                        title="Transition saved (demo)"
                        reassurance={flash}
                        next="Continue fulfillment or open Payments if verification is still needed."
                        action={{ label: 'Open payments', to: '/admin/payments' }}
                    />
                </div>
            ) : null}
            {error ? (
                <div className="mb-4">
                    <ErrorState
                        title="Transition blocked"
                        whatFailed={error}
                        whoseFault="Workflow rule (R1 / allowed matrix) — not a network fault."
                        howToFix="Choose an allowed next status from the buttons below."
                        retry={{ label: 'Dismiss', onClick: () => setError(null) }}
                    />
                </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
                <section className="admin-panel">
                    <h2 className="admin-panel__title">Customer delivery snapshot</h2>
                    <dl className="admin-dl">
                        <div>
                            <dt>Name</dt>
                            <dd>{order.guest.fullName}</dd>
                        </div>
                        <div>
                            <dt>Email</dt>
                            <dd>{order.guest.email}</dd>
                        </div>
                        <div>
                            <dt>Mobile</dt>
                            <dd>{order.guest.mobile}</dd>
                        </div>
                        <div>
                            <dt>Address</dt>
                            <dd>
                                {order.guest.street}, {order.guest.barangay}, {order.guest.city}
                            </dd>
                        </div>
                    </dl>
                </section>

                <section className="admin-panel">
                    <h2 className="admin-panel__title">Status & payment</h2>
                    <p className="mb-2 text-sm">
                        Order:{' '}
                        <span className={`badge badge--status badge--${order.status}`}>
                            {orderStatusLabel(order.status)}
                        </span>
                    </p>
                    <p className="mb-4 text-sm">
                        Payment:{' '}
                        <span
                            className={`badge badge--status badge--${payment?.status ?? order.paymentStatus}`}
                        >
                            {(payment?.method ?? order.paymentMethod).toUpperCase()} ·{' '}
                            {payment?.status ?? order.paymentStatus}
                        </span>
                    </p>
                    <p className="mb-3 text-xs text-muted-foreground">
                        Changing order status does not mark payment paid. R1: cancel only from
                        pending / confirmed / preparing.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {nextStatuses.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No further transitions.</p>
                        ) : (
                            nextStatuses.map((next) => (
                                <button
                                    key={next}
                                    type="button"
                                    className={
                                        next === 'cancelled' ? 'btn btn--secondary' : 'btn btn--admin'
                                    }
                                    onClick={() => apply(next)}
                                >
                                    Mark {orderStatusLabel(next)}
                                </button>
                            ))
                        )}
                    </div>
                </section>
            </div>

            <section className="admin-panel mt-6">
                <h2 className="admin-panel__title">Items</h2>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Unit</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    {item.productName}
                                    {item.variantLabel ? ` · ${item.variantLabel}` : ''}
                                    {item.isPreorder ? ' (pre-order)' : ''}
                                </td>
                                <td>{item.quantity}</td>
                                <td>{formatPeso(item.unitPrice)}</td>
                                <td>{formatPeso(item.lineSubtotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="mt-4 text-sm">
                    <p>Delivery fee: {formatPeso(order.deliveryFee)}</p>
                    <p className="font-semibold">Total: {formatPeso(order.total)}</p>
                </div>
            </section>

            <section className="admin-panel mt-6">
                <h2 className="admin-panel__title">Status history</h2>
                <ol className="status-timeline">
                    {order.history.map((entry) => (
                        <li key={entry.id} className="status-timeline__item">
                            <p className="font-medium capitalize">
                                {orderStatusLabel(entry.toStatus)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatDate(entry.createdAt)}
                                {entry.note ? ` · ${entry.note}` : ''}
                            </p>
                        </li>
                    ))}
                </ol>
            </section>
        </AdminPageFrame>
    );
}
