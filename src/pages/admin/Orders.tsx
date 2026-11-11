import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminPageFrame from '@/components/admin/AdminPageFrame';
import AdminPagination from '@/components/admin/AdminPagination';
import { NoSearchResultsState } from '@/components/ui/UiStates';
import { useAdminStore } from '@/context/AdminStoreContext';
import { usePagination } from '@/hooks/usePagination';
import { formatDate, formatPeso, orderStatusLabel } from '@/data/selectors';
import type { OrderStatus } from '@/types';

const STATUSES: Array<OrderStatus | 'all'> = [
    'all',
    'pending',
    'confirmed',
    'preparing',
    'ready_for_delivery',
    'in_transit',
    'delivered',
    'cancelled',
];

function toDayKey(iso: string) {
    return iso.slice(0, 10);
}

export default function AdminOrdersPage() {
    const { orders, payments } = useAdminStore();
    const [params, setParams] = useSearchParams();
    const status = (params.get('status') as OrderStatus | 'all') || 'all';
    const dateFrom = params.get('from') ?? '';
    const dateTo = params.get('to') ?? '';
    const [query, setQuery] = useState(params.get('q') ?? '');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return [...orders]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .filter((order) => (status === 'all' ? true : order.status === status))
            .filter((order) => {
                const day = toDayKey(order.createdAt);
                if (dateFrom && day < dateFrom) return false;
                if (dateTo && day > dateTo) return false;
                return true;
            })
            .filter((order) => {
                if (!q) return true;
                return (
                    order.orderNumber.toLowerCase().includes(q) ||
                    order.guest.fullName.toLowerCase().includes(q) ||
                    order.guest.email.toLowerCase().includes(q) ||
                    order.guest.mobile.includes(q)
                );
            });
    }, [orders, status, query, dateFrom, dateTo]);

    const { page, totalPages, pageItems, goTo, reset, rangeLabel } = usePagination(filtered);

    useEffect(() => {
        reset();
    }, [status, query, dateFrom, dateTo, reset]);

    function patchParams(mutate: (next: URLSearchParams) => void) {
        const next = new URLSearchParams(params);
        mutate(next);
        setParams(next);
    }

    const noResults =
        filtered.length === 0 && Boolean(query || dateFrom || dateTo || status !== 'all');

    return (
        <AdminPageFrame
            title="Orders"
            description="Review guest order snapshots and apply allowed transitions (flowchart / R1)."
            isEmpty={filtered.length === 0 && !query && status === 'all' && !dateFrom && !dateTo}
            empty={{
                title: 'No orders yet',
                reason: 'The mock order list is empty in this preview session.',
                nextStep: 'Return to the dashboard or place a demo storefront order.',
                actionLabel: 'Back to dashboard',
                onAction: () => {
                    window.location.href = '/admin';
                },
            }}
        >
            <div className="admin-toolbar">
                <div className="field admin-toolbar__search">
                    <label className="field__label" htmlFor="orders-q">
                        Search
                    </label>
                    <input
                        id="orders-q"
                        className="field__input"
                        value={query}
                        placeholder="Order #, name, email, mobile"
                        onChange={(e) => {
                            setQuery(e.target.value);
                            patchParams((next) => {
                                if (e.target.value) next.set('q', e.target.value);
                                else next.delete('q');
                            });
                        }}
                    />
                </div>
                <div className="field">
                    <label className="field__label" htmlFor="orders-status">
                        Order status
                    </label>
                    <select
                        id="orders-status"
                        className="field__select"
                        value={status}
                        onChange={(e) => {
                            patchParams((next) => {
                                if (e.target.value === 'all') next.delete('status');
                                else next.set('status', e.target.value);
                            });
                        }}
                    >
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {s === 'all' ? 'All statuses' : orderStatusLabel(s)}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="field">
                    <label className="field__label" htmlFor="orders-from">
                        From date
                    </label>
                    <input
                        id="orders-from"
                        type="date"
                        className="field__input"
                        value={dateFrom}
                        max={dateTo || undefined}
                        onChange={(e) => {
                            patchParams((next) => {
                                if (e.target.value) next.set('from', e.target.value);
                                else next.delete('from');
                            });
                        }}
                    />
                </div>
                <div className="field">
                    <label className="field__label" htmlFor="orders-to">
                        To date
                    </label>
                    <input
                        id="orders-to"
                        type="date"
                        className="field__input"
                        value={dateTo}
                        min={dateFrom || undefined}
                        onChange={(e) => {
                            patchParams((next) => {
                                if (e.target.value) next.set('to', e.target.value);
                                else next.delete('to');
                            });
                        }}
                    />
                </div>
                {dateFrom || dateTo ? (
                    <div className="field">
                        <span className="field__label opacity-0">Clear</span>
                        <button
                            type="button"
                            className="btn btn--secondary btn--sm"
                            onClick={() => {
                                patchParams((next) => {
                                    next.delete('from');
                                    next.delete('to');
                                });
                            }}
                        >
                            Clear dates
                        </button>
                    </div>
                ) : null}
            </div>

            {noResults ? (
                <NoSearchResultsState
                    query={query || `${dateFrom || '…'} → ${dateTo || '…'}`}
                    reason="No orders matched that search, status, or date range."
                    suggestions={['KS-10001', 'Ana', 'pending']}
                    onSuggestionSelect={(item) => {
                        setQuery(item);
                        patchParams((next) => {
                            next.set('q', item);
                            next.delete('from');
                            next.delete('to');
                        });
                    }}
                    clearAction={{
                        label: 'Clear filters',
                        onClick: () => {
                            setQuery('');
                            patchParams((next) => {
                                next.delete('q');
                                next.delete('status');
                                next.delete('from');
                                next.delete('to');
                            });
                        },
                    }}
                    reviseAction={{ label: 'Show pending', to: '/admin/orders?status=pending' }}
                />
            ) : (
                <>
                    <div className="admin-panel overflow-x-auto">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Order</th>
                                    <th>Guest</th>
                                    <th>Total</th>
                                    <th>Order status</th>
                                    <th>Payment</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {pageItems.map((order) => {
                                    const payment = payments.find((p) => p.orderId === order.id);
                                    return (
                                        <tr key={order.id}>
                                            <td>{formatDate(order.createdAt)}</td>
                                            <td>{order.orderNumber}</td>
                                            <td>
                                                <div>{order.guest.fullName}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {order.guest.mobile}
                                                </div>
                                            </td>
                                            <td>{formatPeso(order.total)}</td>
                                            <td>
                                                <span
                                                    className={`badge badge--status badge--${order.status}`}
                                                >
                                                    {orderStatusLabel(order.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge badge--status badge--${payment?.status ?? order.paymentStatus}`}
                                                >
                                                    {(
                                                        payment?.method ?? order.paymentMethod
                                                    ).toUpperCase()}{' '}
                                                    · {payment?.status ?? order.paymentStatus}
                                                </span>
                                            </td>
                                            <td>
                                                <Link
                                                    className="text-sm font-medium text-admin-primary"
                                                    to={`/admin/orders/${order.id}`}
                                                >
                                                    Open
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
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
