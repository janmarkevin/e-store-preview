import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from '@phosphor-icons/react';
import AdminPageFrame from '@/components/admin/AdminPageFrame';
import AdminPagination from '@/components/admin/AdminPagination';
import { NoSearchResultsState, SuccessState } from '@/components/ui/UiStates';
import { useAdminStore } from '@/context/AdminStoreContext';
import { usePagination } from '@/hooks/usePagination';
import { formatDate, formatPeso } from '@/data/selectors';
import type { PaymentStatus } from '@/types';

const FILTERS: Array<PaymentStatus | 'all'> = [
    'all',
    'unpaid',
    'pending_verification',
    'paid',
    'rejected',
    'refunded',
];

function AdminPaymentsPage() {
    const { payments, orders, updatePaymentStatus } = useAdminStore();
    const [params, setParams] = useSearchParams();
    const filter = (params.get('status') as PaymentStatus | 'all') || 'all';
    const [query, setQuery] = useState('');
    const [flash, setFlash] = useState<string | null>(null);

    const rows = useMemo(() => {
        const q = query.trim().toLowerCase();
        return [...payments]
            .sort((a, b) => b.id - a.id)
            .filter((p) => (filter === 'all' ? true : p.status === filter))
            .map((payment) => ({
                payment,
                order: orders.find((o) => o.id === payment.orderId) ?? null,
            }))
            .filter(({ payment, order }) => {
                if (!q) return true;
                return (
                    String(payment.id).includes(q) ||
                    (order?.orderNumber.toLowerCase().includes(q) ?? false) ||
                    payment.method.includes(q) ||
                    (payment.notes ?? '').toLowerCase().includes(q)
                );
            });
    }, [payments, orders, filter, query]);

    const { page, totalPages, pageItems, goTo, reset, rangeLabel } = usePagination(rows);

    useEffect(() => {
        reset();
    }, [filter, query, reset]);

    function verify(id: number, next: PaymentStatus) {
        updatePaymentStatus(id, next);
        setFlash(
            next === 'paid'
                ? 'Payment marked paid. Order fulfillment status was not changed.'
                : `Payment set to ${next.replaceAll('_', ' ')}. Order status stayed the same.`,
        );
    }

    return (
        <AdminPageFrame
            title="Payments"
            description="Verify GCash / COD payments. Payment status is independent of order status."
            isEmpty={payments.length === 0}
            empty={{
                title: 'No payments yet',
                reason: 'There are no payment records in this preview session.',
                nextStep: 'Place a storefront order or open an existing mock order.',
                actionLabel: 'View orders',
                onAction: () => {
                    window.location.href = '/admin/orders';
                },
            }}
        >
            {flash ? (
                <div className="mb-4">
                    <SuccessState
                        title="Payment updated"
                        reassurance={flash}
                        next="Continue fulfillment from the Orders screen when ready."
                        action={{ label: 'Go to orders', to: '/admin/orders' }}
                    />
                </div>
            ) : null}

            <div className="admin-toolbar">
                <div className="field admin-toolbar__search">
                    <label className="field__label" htmlFor="pay-q">
                        Search
                    </label>
                    <input
                        id="pay-q"
                        className="field__input"
                        value={query}
                        placeholder="Order #, method, notes"
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <div className="field">
                    <label className="field__label" htmlFor="pay-filter">
                        Payment status
                    </label>
                    <select
                        id="pay-filter"
                        className="field__select"
                        value={filter}
                        onChange={(e) => {
                            const next = new URLSearchParams(params);
                            if (e.target.value === 'all') next.delete('status');
                            else next.set('status', e.target.value);
                            setParams(next);
                        }}
                    >
                        {FILTERS.map((s) => (
                            <option key={s} value={s}>
                                {s === 'all' ? 'All payments' : s.replaceAll('_', ' ')}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {rows.length === 0 && query ? (
                <NoSearchResultsState
                    query={query}
                    reason="No payments matched that search or status filter."
                    suggestions={['KS-', 'gcash', 'pending']}
                    onSuggestionSelect={setQuery}
                    clearAction={{ label: 'Clear search', onClick: () => setQuery('') }}
                    reviseAction={{
                        label: 'Show awaiting verification',
                        to: '/admin/payments?status=pending_verification',
                    }}
                />
            ) : (
                <>
                    <div className="admin-panel overflow-x-auto">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Guest</th>
                                    <th>Method</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Notes</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageItems.map(({ payment, order }) => (
                                    <tr key={payment.id}>
                                        <td>
                                            {order ? (
                                                <Link
                                                    className="text-admin-primary"
                                                    to={`/admin/orders/${order.id}`}
                                                >
                                                    {order.orderNumber}
                                                </Link>
                                            ) : (
                                                `Order #${payment.orderId}`
                                            )}
                                            {order ? (
                                                <div className="text-xs text-muted-foreground">
                                                    {formatDate(order.createdAt)}
                                                </div>
                                            ) : null}
                                        </td>
                                        <td>{order?.guest.fullName ?? '—'}</td>
                                        <td className="uppercase">{payment.method}</td>
                                        <td>{formatPeso(payment.amount)}</td>
                                        <td>
                                            <span
                                                className={`badge badge--status badge--${payment.status}`}
                                            >
                                                {payment.status.replaceAll('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="max-w-[14rem] text-xs">
                                            {payment.notes ?? '—'}
                                        </td>
                                        <td>
                                            <div className="flex flex-wrap gap-2">
                                                {payment.status === 'pending_verification' ||
                                                payment.status === 'unpaid' ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="btn btn--admin btn--sm"
                                                            onClick={() =>
                                                                verify(payment.id, 'paid')
                                                            }
                                                        >
                                                            <CheckCircle size={16} aria-hidden />
                                                            Mark paid
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn--secondary btn--sm"
                                                            onClick={() =>
                                                                verify(payment.id, 'rejected')
                                                            }
                                                        >
                                                            <XCircle size={16} aria-hidden />
                                                            Reject
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">
                                                        No action
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <AdminPagination
                        page={page}
                        totalPages={totalPages}
                        rangeLabel={rangeLabel}
                        onPageChange={goTo}
                    />
                </>
            )}
        </AdminPageFrame>
    );
}

export { AdminPaymentsPage };
export default AdminPaymentsPage;
