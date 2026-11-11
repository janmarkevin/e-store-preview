import { Link } from 'react-router-dom';
import type { Category } from '@/types';

type CategoryCardProps = {
    category: Category;
    titleAs?: 'h2' | 'h3';
};

export default function CategoryCard({ category, titleAs = 'h2' }: CategoryCardProps) {
    const Title = titleAs;

    return (
        <Link to={`/categories/${category.slug}`} className="category-card">
            <div
                className="category-card__swatch"
                style={{ background: category.imageTone }}
            >
                {category.imageSrc ? (
                    <img
                        className="category-card__image"
                        src={category.imageSrc}
                        alt=""
                        loading="lazy"
                        decoding="async"
                    />
                ) : null}
            </div>
            <div className="category-card__body">
                <Title className="font-semibold">{category.name}</Title>
                <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
            </div>
        </Link>
    );
}
