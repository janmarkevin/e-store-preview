import { useState } from 'react';

type ProductMediaProps = {
    tone?: string;
    label?: string;
    alt: string;
    src?: string | null;
    className?: string;
};

export default function ProductMedia({
    tone,
    label,
    alt,
    src,
    className = '',
}: ProductMediaProps) {
    const [failed, setFailed] = useState(false);

    if (src && !failed) {
        return (
            <img
                className={`product-media__img ${className}`.trim()}
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                onError={() => setFailed(true)}
            />
        );
    }

    if (!tone) {
        return (
            <div className={`product-media__fallback ${className}`} role="img" aria-label={alt}>
                Image unavailable
            </div>
        );
    }

    return (
        <div
            className={className}
            style={{
                background: `linear-gradient(145deg, ${tone}, #ffffff 120%)`,
                width: '100%',
                height: '100%',
                display: 'grid',
                placeItems: 'center',
                color: '#6b6560',
                fontSize: '0.875rem',
                fontWeight: 600,
            }}
            role="img"
            aria-label={alt}
        >
            {label}
        </div>
    );
}
