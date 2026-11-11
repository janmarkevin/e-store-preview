import { Link } from 'react-router-dom';
import { storeSettings } from '@/data/storeSettings';

export function StoreFooter() {
    return (
        <footer className="store-footer">
            <div className="store-footer__inner">
                <div>
                    <p className="store-footer__title">{storeSettings.storeName}</p>
                    <p className="text-sm text-muted-foreground">
                        {storeSettings.description}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                        Preview photos via{' '}
                        <a href="https://unsplash.com/" target="_blank" rel="noreferrer">
                            Unsplash
                        </a>
                        .
                    </p>
                </div>
                <div>
                    <p className="store-footer__title">Shop</p>
                    <ul className="store-footer__list">
                        <li>
                            <Link to="/shop">Catalog</Link>
                        </li>
                        <li>
                            <Link to="/categories">Categories</Link>
                        </li>
                        <li>
                            <Link to="/track">Track order</Link>
                        </li>
                        <li>
                            <Link to="/cart">Cart</Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <p className="store-footer__title">Support</p>
                    <ul className="store-footer__list">
                        <li>
                            <a href={storeSettings.messengerUrl} target="_blank" rel="noreferrer">
                                Messenger
                            </a>
                        </li>
                        <li>
                            <Link to="/admin/login">Admin preview</Link>
                        </li>
                        <li>
                            <Link to="/demo">Demo script</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}

export default StoreFooter;
