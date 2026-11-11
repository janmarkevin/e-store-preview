import {
    Basket,
    Cube,
    GearSix,
    Package,
    SignOut,
    SquaresFour,
    Stack,
    User,
    Wallet,
} from '@phosphor-icons/react';
import { useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useAdminStore } from '@/context/AdminStoreContext';

const MAIN_NAV = [
    { to: '/admin', label: 'Dashboard', icon: SquaresFour, end: true },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/categories', label: 'Categories', icon: Stack },
    { to: '/admin/orders', label: 'Orders', icon: Basket },
    { to: '/admin/payments', label: 'Payments', icon: Wallet },
    { to: '/admin/inventory', label: 'Inventory', icon: Cube },
    { to: '/admin/profile', label: 'Admin Profile', icon: User },
] as const;

type SearchHit = {
    id: string;
    label: string;
    meta: string;
    to: string;
};

export default function AdminLayout({ children }: PropsWithChildren) {
    const { logout } = useAdminAuth();
    const { orders, products, payments, categories, profile } = useAdminStore();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    function onLogout() {
        logout();
        navigate('/admin/login');
    }

    const hits = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (q.length < 1) return [] as SearchHit[];

        const results: SearchHit[] = [];

        orders.forEach((order) => {
            const hay = `${order.orderNumber} ${order.guest.fullName} ${order.guest.email} ${order.status}`;
            if (hay.toLowerCase().includes(q)) {
                results.push({
                    id: `order-${order.id}`,
                    label: order.orderNumber,
                    meta: `${order.guest.fullName} · ${order.status}`,
                    to: `/admin/orders/${order.id}`,
                });
            }
        });

        products.forEach((product) => {
            const hay = `${product.name} ${product.slug} ${product.variants.map((v) => v.sku).join(' ')}`;
            if (hay.toLowerCase().includes(q)) {
                results.push({
                    id: `product-${product.id}`,
                    label: product.name,
                    meta: `Product · ${product.status}`,
                    to: '/admin/products',
                });
            }
        });

        categories.forEach((category) => {
            if (
                category.name.toLowerCase().includes(q) ||
                category.slug.toLowerCase().includes(q)
            ) {
                results.push({
                    id: `cat-${category.id}`,
                    label: category.name,
                    meta: `Category · ${category.isActive ? 'active' : 'inactive'}`,
                    to: '/admin/categories',
                });
            }
        });

        payments.forEach((payment) => {
            const order = orders.find((o) => o.id === payment.orderId);
            const hay = `${order?.orderNumber ?? ''} ${payment.method} ${payment.status} ${payment.notes ?? ''}`;
            if (hay.toLowerCase().includes(q)) {
                results.push({
                    id: `pay-${payment.id}`,
                    label: order?.orderNumber ?? `Payment #${payment.id}`,
                    meta: `Payment · ${payment.method} · ${payment.status}`,
                    to: `/admin/payments?status=${payment.status}`,
                });
            }
        });

        return results.slice(0, 8);
    }, [query, orders, products, categories, payments]);

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            const target = e.target as Node;
            if (menuRef.current && !menuRef.current.contains(target)) {
                setMenuOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(target)) {
                setSearchOpen(false);
            }
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setMenuOpen(false);
                setSearchOpen(false);
            }
        }
        document.addEventListener('mousedown', onDocClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDocClick);
            document.removeEventListener('keydown', onKey);
        };
    }, []);

    const initials = profile.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? '')
        .join('') || 'KS';

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar" aria-label="Admin">
                <div className="admin-sidebar__brand">BlackBird Store</div>

                <nav className="admin-sidebar__nav">
                    {MAIN_NAV.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={'end' in item ? item.end : false}
                                className={({ isActive }) =>
                                    isActive
                                        ? 'admin-sidebar__link admin-sidebar__link--active'
                                        : 'admin-sidebar__link'
                                }
                            >
                                <Icon size={18} aria-hidden="true" />
                                {item.label}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="admin-sidebar__footer">
                    <NavLink
                        to="/admin/settings"
                        className={({ isActive }) =>
                            isActive
                                ? 'admin-sidebar__link admin-sidebar__link--active'
                                : 'admin-sidebar__link'
                        }
                    >
                        <GearSix size={18} aria-hidden="true" />
                        Store Settings
                    </NavLink>
                    <button type="button" className="admin-sidebar__link w-full" onClick={onLogout}>
                        <SignOut size={18} aria-hidden="true" />
                        Logout
                    </button>
                </div>
            </aside>

            <div className="admin-main">
                <div className="admin-chrome">
                <div className="demo-banner" role="note">
                    Admin preview — simulated gate + mock metrics only.
                </div>
                <header className="admin-topbar">
                    <div className="admin-topbar__search-wrap" ref={searchRef}>
                        <form
                            className="admin-topbar__search"
                            role="search"
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (hits[0]) {
                                    navigate(hits[0].to);
                                    setSearchOpen(false);
                                    setQuery('');
                                }
                            }}
                        >
                            <label className="sr-only" htmlFor="admin-search">
                                Search admin
                            </label>
                            <input
                                id="admin-search"
                                placeholder="Search orders, products, payments…"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setSearchOpen(true);
                                }}
                                onFocus={() => setSearchOpen(true)}
                                autoComplete="off"
                            />
                        </form>
                        {searchOpen && query.trim() ? (
                            <div className="admin-search-menu" role="listbox" aria-label="Search results">
                                {hits.length === 0 ? (
                                    <p className="admin-search-menu__empty">
                                        No matches for “{query.trim()}”. Try an order # or product name.
                                    </p>
                                ) : (
                                    hits.map((hit) => (
                                        <button
                                            key={hit.id}
                                            type="button"
                                            className="admin-search-menu__item"
                                            role="option"
                                            onClick={() => {
                                                navigate(hit.to);
                                                setSearchOpen(false);
                                                setQuery('');
                                            }}
                                        >
                                            <span className="admin-search-menu__label">{hit.label}</span>
                                            <span className="admin-search-menu__meta">{hit.meta}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        ) : null}
                    </div>

                    <Link to="/" className="btn btn--ghost text-sm">
                        View store
                    </Link>

                    <div className="admin-avatar-menu" ref={menuRef}>
                        <button
                            type="button"
                            className="admin-avatar-menu__trigger"
                            aria-label="Account menu"
                            aria-haspopup="menu"
                            aria-expanded={menuOpen}
                            onClick={() => setMenuOpen((open) => !open)}
                        >
                            {initials}
                        </button>
                        {menuOpen ? (
                            <div className="admin-avatar-menu__panel" role="menu">
                                <p className="admin-avatar-menu__who">
                                    {profile.name}
                                    <span>{profile.email}</span>
                                </p>
                                <Link
                                    role="menuitem"
                                    to="/admin/settings"
                                    className="admin-avatar-menu__item"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <GearSix size={16} aria-hidden />
                                    Store Settings
                                </Link>
                                <Link
                                    role="menuitem"
                                    to="/admin/profile"
                                    className="admin-avatar-menu__item"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <User size={16} aria-hidden />
                                    Admin Profile
                                </Link>
                                <button
                                    type="button"
                                    role="menuitem"
                                    className="admin-avatar-menu__item"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        onLogout();
                                    }}
                                >
                                    <SignOut size={16} aria-hidden />
                                    Logout
                                </button>
                            </div>
                        ) : null}
                    </div>
                </header>
                </div>
                <div className="admin-content">{children}</div>
            </div>
        </div>
    );
}
