import { Link, useParams } from 'react-router-dom';
import CategoryCard from '@/components/store/CategoryCard';
import ProductCard from '@/components/store/ProductCard';
import {
    catalogProducts,
    getActiveCategories,
    getCategoryBySlug,
} from '@/data/selectors';

export default function CategoriesPage() {
    const { slug } = useParams();
    const active = getActiveCategories();

    if (slug) {
        const category = getCategoryBySlug(slug);
        if (!category) {
            return (
                <div className="page-shell">
                    <div className="empty-state">
                        <h1 className="empty-state__title">Category not found</h1>
                        <p className="empty-state__text">
                            That category does not exist in the preview dataset.
                        </p>
                        <div className="empty-state__action">
                            <Link to="/categories" className="btn btn--secondary">
                                Back to categories
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        if (!category.isActive) {
            return (
                <div className="page-shell">
                    <div className="empty-state">
                        <h1 className="empty-state__title">{category.name} is inactive</h1>
                        <p className="empty-state__text">
                            Inactive categories do not list products in category browse.
                            Active products under them remain reachable by direct product URL.
                        </p>
                        <div className="empty-state__action">
                            <Link
                                to="/products/inactive-category-lamp"
                                className="btn btn--secondary"
                            >
                                Open sample direct product URL
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        const products = catalogProducts({ categorySlug: category.slug });

        return (
            <div className="page-shell">
                <nav className="breadcrumbs" aria-label="Breadcrumb">
                    <Link to="/">Home</Link>
                    <span className="breadcrumbs__sep">/</span>
                    <Link to="/categories">Categories</Link>
                    <span className="breadcrumbs__sep">/</span>
                    <span>{category.name}</span>
                </nav>
                <h1 className="page-title">{category.name}</h1>
                <p className="page-lead">{category.description}</p>
                {products.length === 0 ? (
                    <div className="empty-state">
                        <h2 className="empty-state__title">No products yet</h2>
                        <p className="empty-state__text">
                            Try another category or browse the full catalog.
                        </p>
                        <div className="empty-state__action">
                            <Link to="/shop" className="btn btn--secondary">
                                Shop catalog
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="product-grid">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="page-shell">
            <h1 className="page-title">Categories</h1>
            <p className="page-lead">Active categories only. Inactive ones are hidden here.</p>
            <div className="category-grid">
                {active.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                ))}
            </div>
        </div>
    );
}
