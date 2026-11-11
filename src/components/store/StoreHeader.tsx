import { MagnifyingGlass, ShoppingCart, List, X } from '@phosphor-icons/react';
import { useId, useState, type FormEvent } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { storeSettings } from '@/data/storeSettings';

const NAV = [
    { to: '/', label: 'Home', end: true },
    { to: '/shop', label: 'Shop' },
    { to: '/categories', label: 'Categories' },
] as const;

export default function StoreHeader() {
    const { itemCount } = useCart();
    const [menuOpen, setMenuOpen] = useState(false);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const menuId = useId();
    const searchId = useId();
    const cartLabel =
        itemCount === 1 ? '1 item in cart' : `${itemCount} items in cart`;

    function onSearch(event: FormEvent) {
        event.preventDefault();
        const q = query.trim();
        navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
        setMenuOpen(false);
    }

    return (
        <header className="store-chrome">
            <div className="store-utility">
                <div className="store-utility__inner">
                    <p className="store-utility__note">
                        Seller-fulfilled delivery · COD &amp; GCash
                    </p>
                    <Link to="/track" className="store-utility__link">
                        Track order
                    </Link>
                </div>
            </div>

            <div className="store-header">
                <div className="store-header__inner">
                    <button
                        type="button"
                        className="store-header__menu-toggle"
                        aria-expanded={menuOpen}
                        aria-controls={menuId}
                        onClick={() => setMenuOpen((o) => !o)}
                    >
                        {menuOpen ? <X size={20} /> : <List size={20} />}
                        <span className="sr-only">
                            {menuOpen ? 'Close menu' : 'Open menu'}
                        </span>
                    </button>

                    <Link to="/" className="store-header__brand">
                        {storeSettings.logoText}
                        <span className="store-header__brand-dot" aria-hidden="true" />
                    </Link>

                    <nav
                        id={menuId}
                        className={
                            menuOpen
                                ? 'store-header__nav store-header__nav--open'
                                : 'store-header__nav'
                        }
                        aria-label="Store"
                    >
                        <ul className="store-header__nav-list">
                            {NAV.map((item) => (
                                <li key={item.to}>
                                    <NavLink
                                        to={item.to}
                                        end={'end' in item ? item.end : false}
                                        className={({ isActive }) =>
                                            isActive
                                                ? 'store-header__nav-link store-header__nav-link--current'
                                                : 'store-header__nav-link'
                                        }
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {item.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="store-header__actions">
                        <form className="store-header__search" onSubmit={onSearch}>
                            <MagnifyingGlass size={18} aria-hidden="true" />
                            <label className="sr-only" htmlFor={searchId}>
                                Search products
                            </label>
                            <input
                                id={searchId}
                                className="store-header__search-input"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search products"
                            />
                        </form>

                        <Link to="/cart" className="store-header__icon-btn">
                            <ShoppingCart size={22} aria-hidden="true" />
                            <span className="sr-only">Cart</span>
                            {itemCount > 0 ? (
                                <span className="store-header__cart-count" aria-hidden="true">
                                    {itemCount}
                                </span>
                            ) : null}
                            <span className="sr-only" role="status" aria-atomic="true">
                                {cartLabel}
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
