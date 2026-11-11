type AdminPaginationProps = {
    page: number;
    totalPages: number;
    rangeLabel: string;
    onPageChange: (page: number) => void;
};

export default function AdminPagination({
    page,
    totalPages,
    rangeLabel,
    onPageChange,
}: AdminPaginationProps) {
    if (totalPages <= 1) {
        return (
            <div className="admin-pagination">
                <p className="admin-pagination__meta">{rangeLabel}</p>
            </div>
        );
    }

    return (
        <div className="admin-pagination" role="navigation" aria-label="Table pagination">
            <p className="admin-pagination__meta">{rangeLabel}</p>
            <div className="admin-pagination__controls">
                <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    Previous
                </button>
                <span className="admin-pagination__page">
                    Page {page} of {totalPages}
                </span>
                <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
