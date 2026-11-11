import { Link } from 'react-router-dom';
import CategoryCard from '@/components/store/CategoryCard';
import ProductCard from '@/components/store/ProductCard';
import { getActiveCategories, featuredProducts } from '@/data/selectors';

export default function HomePage() {
    const featured = featuredProducts();
    const cats = getActiveCategories();

    return (
        <>
            <section className="page-shell section">
                <div className="section__header">
                    <h2 className="section__title">Categories</h2>
                    <Link to="/categories" className="text-sm font-medium underline-offset-2 hover:underline">
                        View all
                    </Link>
                </div>
                <div className="category-grid">
                    {cats.map((category) => (
                        <CategoryCard key={category.id} category={category} titleAs="h3" />
                    ))}
                </div>
            </section>

            <section className="page-shell section pt-0">
                <div className="section__header">
                    <h2 className="section__title">Featured</h2>
                    <Link to="/shop" className="text-sm font-medium underline-offset-2 hover:underline">
                        Shop catalog
                    </Link>
                </div>
                <div className="product-grid">
                    {featured.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>
        </>
    );
}
