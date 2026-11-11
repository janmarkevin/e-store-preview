import { Link } from 'react-router-dom';
import { trackingTokens } from '@/data/trackingTokens';

const STEPS = [
    {
        title: '1. Featured → PDP → Cart → COD checkout',
        links: [
            { to: '/', label: 'Home' },
            { to: '/products/linen-throw-pillow', label: 'Linen Throw Pillow' },
            { to: '/cart', label: 'Cart' },
            { to: '/checkout', label: 'Checkout' },
        ],
    },
    {
        title: '2. Buy Now pre-order → GCash confirmation',
        links: [
            { to: '/products/ceramic-diffuser-set', label: 'Ceramic Diffuser Set (pre-order)' },
        ],
    },
    {
        title: '3. Catalog filters + page 2',
        links: [{ to: '/shop?page=2', label: 'Shop page 2' }],
    },
    {
        title: '4. Unavailable / draft-archived routes',
        links: [
            { to: '/products/draft-shelf-unit', label: 'Draft product' },
            { to: '/products/archived-lotion', label: 'Archived product' },
            { to: '/categories/archive-samples', label: 'Inactive category' },
        ],
    },
    {
        title: '5. Empty cart + sample cart',
        links: [{ to: '/cart', label: 'Cart' }],
    },
    {
        title: '6. Admin (login → dashboard → orders → payments → inventory)',
        links: [
            { to: '/admin/login', label: 'Admin login' },
            { to: '/admin', label: 'Dashboard' },
            { to: '/admin/orders', label: 'Orders' },
            { to: '/admin/payments?status=pending_verification', label: 'Awaiting verification' },
            { to: '/admin/inventory', label: 'Inventory' },
            { to: '/admin/settings', label: 'Settings (demo states)' },
            { to: '/admin/profile', label: 'Profile' },
        ],
    },
    {
        title: '7. Tracking tokens',
        links: trackingTokens.map((t) => ({
            to: `/track/${t.token}`,
            label: t.token,
        })),
    },
];

export default function DemoPage() {
    return (
        <div className="page-shell">
            <h1 className="page-title">Client demo script</h1>
            <p className="page-lead">
                Click-paths for the static preview. Admin demo login:{' '}
                <code>admin@kevinstore.demo</code> / <code>preview-admin</code>
            </p>
            <div className="space-y-6">
                {STEPS.map((step) => (
                    <section key={step.title} className="rounded-xl bg-surface p-5 shadow-sm">
                        <h2 className="font-semibold">{step.title}</h2>
                        <ul className="mt-3 flex flex-wrap gap-3 text-sm">
                            {step.links.map((link) => (
                                <li key={link.to}>
                                    <Link
                                        className="underline-offset-2 hover:underline"
                                        to={link.to}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </div>
    );
}
