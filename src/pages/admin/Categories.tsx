import { useEffect, useMemo, useState } from 'react';
import { Eye, EyeSlash, Plus, Stack } from '@phosphor-icons/react';
import AdminPageFrame from '@/components/admin/AdminPageFrame';
import AdminPagination from '@/components/admin/AdminPagination';
import { SuccessState } from '@/components/ui/UiStates';
import { useAdminStore } from '@/context/AdminStoreContext';
import { usePagination } from '@/hooks/usePagination';
import type { Category } from '@/types';

const TONES = ['#efebe6', '#e8f0eb', '#e8f1f8', '#fef3c7', '#fce7f3', '#ede9fe'];

export default function AdminCategoriesPage() {
    const { categories, products, setCategoryActive, upsertCategory } = useAdminStore();
    const [flash, setFlash] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const sorted = useMemo(
        () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
        [categories],
    );

    const { page, totalPages, pageItems, goTo, reset, rangeLabel } = usePagination(sorted);

    useEffect(() => {
        reset();
    }, [categories.length, reset]);

    function toggle(id: number, isActive: boolean, categoryName: string) {
        setCategoryActive(id, isActive);
        setFlash(
            isActive
                ? `“${categoryName}” is active again and will appear in storefront browse.`
                : `“${categoryName}” is inactive. It no longer lists in browse; direct PDP links still work for active products.`,
        );
    }

    function validate() {
        const next: Record<string, string> = {};
        if (!name.trim()) next.name = 'Enter a category name.';
        else if (name.trim().length < 2) next.name = 'Name needs at least 2 characters.';
        const slug = name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        if (categories.some((c) => c.slug === slug))
            next.name = 'A category with that slug already exists — pick a different name.';
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    function onCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        const id = Math.max(0, ...categories.map((c) => c.id)) + 1;
        const slug = name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        const category: Category = {
            id,
            name: name.trim(),
            slug,
            description: description.trim() || 'New category for the storefront browse.',
            imageTone: TONES[id % TONES.length],
            imageSrc: null,
            isActive: true,
            sortOrder: Math.max(0, ...categories.map((c) => c.sortOrder)) + 1,
        };
        upsertCategory(category);
        setFlash(`“${category.name}” added and set active for storefront browse.`);
        setName('');
        setDescription('');
        setErrors({});
    }

    return (
        <AdminPageFrame
            title="Categories"
            description="Create, activate, or hide categories for storefront browse (Spec IA)."
            isEmpty={categories.length === 0}
            empty={{
                title: 'No categories',
                reason: 'The category list is empty in this preview session.',
                nextStep: 'Add a category with the form on this page.',
                actionLabel: 'Reload',
                onAction: () => window.location.reload(),
            }}
        >
            {flash ? (
                <div className="mb-4">
                    <SuccessState
                        title="Category saved"
                        reassurance={flash}
                        next="Check the storefront Categories page to confirm browse behavior."
                        action={{ label: 'View storefront categories', to: '/categories' }}
                    />
                </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div>
                    <div className="admin-panel overflow-x-auto">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Products</th>
                                    <th>Sort</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageItems.map((category) => {
                                    const count = products.filter(
                                        (p) => p.categoryId === category.id,
                                    ).length;
                                    return (
                                        <tr key={category.id}>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md"
                                                        style={{ background: category.imageTone }}
                                                        aria-hidden
                                                    >
                                                        <Stack size={16} />
                                                    </span>
                                                    <div>
                                                        <div className="font-medium">
                                                            {category.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {category.slug}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{count}</td>
                                            <td>{category.sortOrder}</td>
                                            <td>
                                                <span
                                                    className={`badge badge--status badge--${category.isActive ? 'confirmed' : 'cancelled'}`}
                                                >
                                                    {category.isActive ? 'active' : 'inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                {category.isActive ? (
                                                    <button
                                                        type="button"
                                                        className="btn btn--secondary btn--sm"
                                                        onClick={() =>
                                                            toggle(
                                                                category.id,
                                                                false,
                                                                category.name,
                                                            )
                                                        }
                                                    >
                                                        <EyeSlash size={16} aria-hidden />
                                                        Deactivate
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="btn btn--admin btn--sm"
                                                        onClick={() =>
                                                            toggle(
                                                                category.id,
                                                                true,
                                                                category.name,
                                                            )
                                                        }
                                                    >
                                                        <Eye size={16} aria-hidden />
                                                        Activate
                                                    </button>
                                                )}
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
                </div>

                <form className="admin-panel" onSubmit={onCreate} noValidate>
                    <h2 className="admin-panel__title flex items-center gap-2">
                        <Plus size={18} aria-hidden />
                        Add category
                    </h2>
                    <div className="field">
                        <label className="field__label" htmlFor="cat-name">
                            Name
                        </label>
                        <input
                            id="cat-name"
                            className={`field__input${errors.name ? ' field__input--error' : ''}`}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={errors.name ? 'cat-name-err' : undefined}
                        />
                        {errors.name ? (
                            <p id="cat-name-err" className="field__error">
                                {errors.name}
                            </p>
                        ) : null}
                    </div>
                    <div className="field">
                        <label className="field__label" htmlFor="cat-desc">
                            Description
                        </label>
                        <textarea
                            id="cat-desc"
                            className="field__textarea"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional short browse copy"
                        />
                    </div>
                    <button type="submit" className="btn btn--admin w-full">
                        Create category
                    </button>
                </form>
            </div>
        </AdminPageFrame>
    );
}
