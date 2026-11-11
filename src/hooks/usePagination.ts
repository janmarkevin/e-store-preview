import { useCallback, useMemo, useState } from 'react';

export const ADMIN_PAGE_SIZE = 10;

export function usePagination<T>(items: T[], pageSize = ADMIN_PAGE_SIZE) {
    const [page, setPage] = useState(1);
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
    const currentPage = Math.min(page, totalPages);

    const pageItems = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return items.slice(start, start + pageSize);
    }, [items, currentPage, pageSize]);

    const goTo = useCallback(
        (next: number) => {
            setPage(Math.min(totalPages, Math.max(1, next)));
        },
        [totalPages],
    );

    const reset = useCallback(() => {
        setPage(1);
    }, []);

    return {
        page: currentPage,
        pageSize,
        total,
        totalPages,
        pageItems,
        goTo,
        reset,
        rangeLabel:
            total === 0
                ? '0 results'
                : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, total)} of ${total}`,
    };
}
