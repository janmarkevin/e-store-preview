import {
    Basket,
    CheckCircle,
    Cube,
    CurrencyCircleDollar,
    Package,
    Truck,
    WarningCircle,
    Clock,
} from '@phosphor-icons/react';
import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import AdminPageFrame from '@/components/admin/AdminPageFrame';
import AdminPagination from '@/components/admin/AdminPagination';
import { EmptyState } from '@/components/ui/UiStates';
import { useAdminStore } from '@/context/AdminStoreContext';
import { usePagination } from '@/hooks/usePagination';
import {
    availableQuantity,
    formatDate,
    formatPeso,
    orderStatusLabel,
} from '@/data/selectors';
import type { OrderStatus } from '@/types';

type IconType = ComponentType<{ size?: number; weight?: 'duotone' | 'regular'; className?: string }>;

export default function AdminDashboardPage() {
    const { orders, payments, products } = useAdminStore();

    const rangeStart = '2026-10-01T00:00:00+08:00';
    const rangeEnd = '2026-11-10T23:59:59+08:00';
    const paidSales = payments
        .filter((p) => p.status === 'paid' && p.verifiedAt)
        .filter((p) => {
            const t = new Date(p.verifiedAt!).getTime();
            return t >= new Date(rangeStart).getTime() && t <= new Date(rangeEnd).getTime();
        })
        .reduce((sum, p) => sum + p.amount, 0);

    const seriesMap = new Map<string, number>();
    payments
        .filter((p) => p.status === 'paid' && p.verifiedAt)
        .forEach((p) => {
            const day = p.verifiedAt!.slice(0, 10);
            seriesMap.set(day, (seriesMap.get(day) ?? 0) + p.amount);
        });
    const series = Array.from(seriesMap.entries())
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date));
    const maxSeries = Math.max(...series.map((s) => s.amount), 1);

    const count = (status: OrderStatus) => orders.filter((o) => o.status === status).length;
    const awaiting = payments.filter((p) => p.status === 'pending_verification');
    const lowStock = products.flatMap((product) =>
        product.status === 'active' && !product.isPreorder
            ? product.variants
                  .filter((v) => v.status === 'active' && availableQuantity(v) <= 5)
                  .map((variant) => ({
                      product,
                      variant,
                      available: availableQuantity(variant),
                  }))
            : [],
    );
    const recentAll = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const {
        page: recentPage,
        totalPages: recentPages,
        pageItems: recent,
        goTo: goRecent,
        rangeLabel: recentRange,
    } = usePagination(recentAll);

    const kpis: Array<{
        label: string;
        value: string;
        hint: string;
        icon: IconType;
        tone: string;
        to: string;
    }> = [
        {
            label: 'Total orders',
            value: String(orders.length),
            hint: 'All mock orders',
            icon: Basket,
            tone: 'kpi-card__icon--blue',
            to: '/admin/orders',
        },
        {
            label: 'Pending',
            value: String(count('pending')),
            hint: 'Awaiting seller confirm',
            icon: Clock,
            tone: 'kpi-card__icon--amber',
            to: '/admin/orders?status=pending',
        },
        {
            label: 'Preparing',
            value: String(count('preparing')),
            hint: 'In preparation',
            icon: Package,
            tone: 'kpi-card__icon--violet',
            to: '/admin/orders?status=preparing',
        },
        {
            label: 'In transit',
            value: String(count('in_transit')),
            hint: 'Seller delivery underway',
            icon: Truck,
            tone: 'kpi-card__icon--sky',
            to: '/admin/orders?status=in_transit',
        },
        {
            label: 'Delivered',
            value: String(count('delivered')),
            hint: 'Completed deliveries',
            icon: CheckCircle,
            tone: 'kpi-card__icon--green',
            to: '/admin/orders?status=delivered',
        },
        {
            label: 'Awaiting verification',
            value: String(awaiting.length),
            hint: 'GCash pending_verification',
            icon: WarningCircle,
            tone: 'kpi-card__icon--orange',
            to: '/admin/payments?status=pending_verification',
        },
        {
            label: 'Paid sales',
            value: formatPeso(paidSales),
            hint: 'Paid by verified_at · Asia/Manila Oct 1–Nov 10',
            icon: CurrencyCircleDollar,
            tone: 'kpi-card__icon--emerald',
            to: '/admin/payments?status=paid',
        },
        {
            label: 'Low stock SKUs',
            value: String(lowStock.length),
            hint: 'Available ≤ 5 (non-preorder)',
            icon: Cube,
            tone: 'kpi-card__icon--rose',
            to: '/admin/inventory',
        },
    ];

    return (
        <AdminPageFrame
            title="Dashboard"
            description="Spec §9.2 metrics from mock data — paid sales use verified_at (not delivery time)."
        >
            <div className="kpi-grid">
                {kpis.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <Link key={kpi.label} to={kpi.to} className="kpi-card kpi-card--link">
                            <div className="kpi-card__top">
                                <p className="kpi-card__label">{kpi.label}</p>
                                <span className={`kpi-card__icon ${kpi.tone}`} aria-hidden="true">
                                    <Icon size={20} weight="duotone" />
                                </span>
                            </div>
                            <p className="kpi-card__value">{kpi.value}</p>
                            <p className="kpi-card__hint">{kpi.hint}</p>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <section className="admin-panel">
                    <h2 className="admin-panel__title">Paid sales trend</h2>
                    <p className="mb-4 text-xs text-muted-foreground">
                        Sum of payments with status = paid, bucketed by verified_at (Asia/Manila).
                    </p>
                    {series.length === 0 ? (
                        <EmptyState
                            title="No paid sales in range"
                            reason="No payments with status paid and verified_at fall in this demo window."
                            nextStep="Open Payments and mark a GCash or COD payment as paid."
                            action={{ label: 'Open payments', to: '/admin/payments' }}
                        />
                    ) : (
                        <>
                            <div className="chart-bars" role="img" aria-label="Paid sales by day">
                                {series.map((point) => {
                                    const pct = Math.max(
                                        4,
                                        Math.round((point.amount / maxSeries) * 100),
                                    );
                                    return (
                                        <div key={point.date} className="chart-bars__col">
                                            <div className="chart-bars__plot">
                                                <div
                                                    className="chart-bars__bar"
                                                    style={{ height: `${pct}%` }}
                                                    title={formatPeso(point.amount)}
                                                    aria-label={`${point.date}: ${formatPeso(point.amount)}`}
                                                />
                                            </div>
                                            <span className="chart-bars__label">
                                                {point.date.slice(5)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <table className="admin-table mt-4">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Paid amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {series.map((point) => (
                                        <tr key={`row-${point.date}`}>
                                            <td>{point.date}</td>
                                            <td>{formatPeso(point.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </section>

                <section className="admin-panel">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className="admin-panel__title mb-0">Low-stock items</h2>
                        <Link
                            to="/admin/inventory"
                            className="text-sm font-medium text-admin-primary"
                        >
                            Open inventory
                        </Link>
                    </div>
                    {lowStock.length === 0 ? (
                        <EmptyState
                            title="No low-stock variants"
                            reason="Every active non-preorder SKU is above the demo threshold (5)."
                            nextStep="Open Inventory to adjust stock down for a walkthrough."
                            action={{ label: 'Open inventory', to: '/admin/inventory' }}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Variant</th>
                                        <th>Available</th>
                                        <th />
                                    </tr>
                                </thead>
                                <tbody>
                                    {lowStock.map(({ product, variant, available }) => (
                                        <tr key={variant.id}>
                                            <td>
                                                <Link
                                                    className="font-medium text-admin-primary"
                                                    to={`/admin/inventory?q=${encodeURIComponent(variant.sku)}&variant=${variant.id}`}
                                                >
                                                    {product.name}
                                                </Link>
                                            </td>
                                            <td>{variant.name ?? variant.sku}</td>
                                            <td
                                                className={
                                                    available <= 2
                                                        ? 'font-semibold text-danger'
                                                        : undefined
                                                }
                                            >
                                                {available}
                                            </td>
                                            <td>
                                                <Link
                                                    className="text-sm font-medium text-admin-primary"
                                                    to={`/admin/inventory?q=${encodeURIComponent(variant.sku)}&variant=${variant.id}`}
                                                >
                                                    Restock
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>

            <section className="admin-panel mt-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="admin-panel__title mb-0">Recent orders</h2>
                    <Link to="/admin/orders" className="text-sm font-medium text-admin-primary">
                        View all
                    </Link>
                </div>
                <div className="overflow-x-auto">
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
                            {recent.map((order) => {
                                const payment = payments.find((p) => p.orderId === order.id);
                                return (
                                    <tr key={order.id}>
                                        <td>{formatDate(order.createdAt)}</td>
                                        <td>{order.orderNumber}</td>
                                        <td>{order.guest.fullName}</td>
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
                                                {(payment?.method ?? order.paymentMethod).toUpperCase()}{' '}
                                                · {payment?.status ?? order.paymentStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <Link
                                                to={`/admin/orders/${order.id}`}
                                                className="text-sm font-medium text-admin-primary"
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
                    page={recentPage}
                    totalPages={recentPages}
                    rangeLabel={recentRange}
                    onPageChange={goRecent}
                />
            </section>
        </AdminPageFrame>
    );
}
