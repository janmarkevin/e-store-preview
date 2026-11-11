import type { PropsWithChildren, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Action = {
    label: string;
    to?: string;
    onClick?: () => void;
};

function ActionButton({ action, variant = 'primary' }: { action: Action; variant?: 'primary' | 'secondary' }) {
    const className = variant === 'primary' ? 'btn btn--primary' : 'btn btn--secondary';
    if (action.to) {
        return (
            <Link to={action.to} className={className}>
                {action.label}
            </Link>
        );
    }
    return (
        <button type="button" className={className} onClick={action.onClick}>
            {action.label}
        </button>
    );
}

export function EmptyState({
    title,
    reason,
    nextStep,
    action,
}: {
    title: string;
    reason: string;
    nextStep: string;
    action: Action;
}) {
    return (
        <div className="ui-state ui-state--empty" role="status">
            <h2 className="ui-state__title">{title}</h2>
            <p className="ui-state__reason">{reason}</p>
            <p className="ui-state__next">{nextStep}</p>
            <div className="ui-state__actions">
                <ActionButton action={action} />
            </div>
        </div>
    );
}

export function LoadingSkeleton({
    label = 'Loading content',
    variant = 'catalog',
}: {
    label?: string;
    variant?: 'catalog' | 'pdp' | 'dashboard';
}) {
    return (
        <div className={`ui-skeleton ui-skeleton--${variant}`} aria-busy="true" aria-label={label}>
            {variant === 'catalog' ? (
                <div className="ui-skeleton__grid">
                    {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} className="ui-skeleton__card">
                            <div className="ui-skeleton__block ui-skeleton__block--image" />
                            <div className="ui-skeleton__block ui-skeleton__block--line" />
                            <div className="ui-skeleton__block ui-skeleton__block--line-sm" />
                        </div>
                    ))}
                </div>
            ) : null}
            {variant === 'pdp' ? (
                <div className="ui-skeleton__pdp">
                    <div className="ui-skeleton__block ui-skeleton__block--hero" />
                    <div className="ui-skeleton__pdp-copy">
                        <div className="ui-skeleton__block ui-skeleton__block--title" />
                        <div className="ui-skeleton__block ui-skeleton__block--line" />
                        <div className="ui-skeleton__block ui-skeleton__block--line" />
                        <div className="ui-skeleton__block ui-skeleton__block--button" />
                    </div>
                </div>
            ) : null}
            {variant === 'dashboard' ? (
                <div className="ui-skeleton__dash">
                    <div className="ui-skeleton__kpi-row">
                        {Array.from({ length: 4 }, (_, i) => (
                            <div key={i} className="ui-skeleton__block ui-skeleton__block--kpi" />
                        ))}
                    </div>
                    <div className="ui-skeleton__block ui-skeleton__block--chart" />
                </div>
            ) : null}
        </div>
    );
}

export function ErrorState({
    title,
    whatFailed,
    whoseFault,
    howToFix,
    retry,
    secondary,
}: {
    title: string;
    whatFailed: string;
    whoseFault: string;
    howToFix: string;
    retry?: Action;
    secondary?: Action;
}) {
    return (
        <div className="ui-state ui-state--error" role="alert">
            <h2 className="ui-state__title">{title}</h2>
            <p className="ui-state__reason">
                <strong>What failed:</strong> {whatFailed}
            </p>
            <p className="ui-state__meta">
                <strong>Whose side:</strong> {whoseFault}
            </p>
            <p className="ui-state__next">
                <strong>How to fix:</strong> {howToFix}
            </p>
            <div className="ui-state__actions">
                {retry ? <ActionButton action={retry} /> : null}
                {secondary ? <ActionButton action={secondary} variant="secondary" /> : null}
            </div>
        </div>
    );
}

export function OfflineState({
    stillWorks,
    needsConnection,
    action,
    children,
}: PropsWithChildren<{
    stillWorks: string;
    needsConnection: string;
    action?: Action;
}>) {
    return (
        <div className="ui-state-stack">
            <div className="ui-banner ui-banner--offline" role="status">
                <p className="ui-banner__title">You’re offline</p>
                <p className="ui-banner__text">
                    <strong>Still works:</strong> {stillWorks}
                </p>
                <p className="ui-banner__text">
                    <strong>Needs connection:</strong> {needsConnection}
                </p>
                {action ? (
                    <div className="ui-banner__actions">
                        <ActionButton action={action} variant="secondary" />
                    </div>
                ) : null}
            </div>
            {children}
        </div>
    );
}

export function SlowNetworkState({
    progressPercent,
    progressLabel,
    lighterPath,
    onCancel,
}: {
    progressPercent: number;
    progressLabel: string;
    lighterPath: Action;
    onCancel?: () => void;
}) {
    const value = Math.min(100, Math.max(0, progressPercent));
    return (
        <div className="ui-state ui-state--slow" role="status" aria-live="polite">
            <h2 className="ui-state__title">Connection is slow</h2>
            <p className="ui-state__reason">{progressLabel}</p>
            <div
                className="ui-progress"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={value}
                aria-label="Request progress"
            >
                <div className="ui-progress__bar" style={{ ['--progress-value' as string]: `${value}%` }} />
            </div>
            <p className="ui-state__next">Prefer a lighter path while this finishes.</p>
            <div className="ui-state__actions">
                <ActionButton action={lighterPath} variant="secondary" />
                {onCancel ? (
                    <button type="button" className="btn btn--ghost" onClick={onCancel}>
                        Cancel request
                    </button>
                ) : null}
            </div>
        </div>
    );
}

export function NoSearchResultsState({
    query,
    suggestions,
    clearAction,
    reviseAction,
    onSuggestionSelect,
    reason = 'Nothing in the active list matched that search.',
}: {
    query: string;
    suggestions: string[];
    clearAction: Action;
    reviseAction?: Action;
    onSuggestionSelect?: (suggestion: string) => void;
    reason?: string;
}) {
    return (
        <div className="ui-state ui-state--empty" role="status">
            <h2 className="ui-state__title">No results for “{query}”</h2>
            <p className="ui-state__reason">{reason}</p>
            <p className="ui-state__next">Try fixing the query with one of these next searches.</p>
            <ul className="ui-state__suggestions">
                {suggestions.map((item) => (
                    <li key={item}>
                        {onSuggestionSelect ? (
                            <button
                                type="button"
                                className="text-admin-primary underline-offset-2 hover:underline"
                                onClick={() => onSuggestionSelect(item)}
                            >
                                {item}
                            </button>
                        ) : (
                            <Link to={`/shop?q=${encodeURIComponent(item)}`}>{item}</Link>
                        )}
                    </li>
                ))}
            </ul>
            <div className="ui-state__actions">
                <ActionButton action={clearAction} />
                {reviseAction ? <ActionButton action={reviseAction} variant="secondary" /> : null}
            </div>
        </div>
    );
}

export function PermissionDeniedState({
    title = 'Permission denied',
    why,
    back,
}: {
    title?: string;
    why: string;
    back: Action;
}) {
    return (
        <div className="ui-state ui-state--permission" role="alert">
            <h2 className="ui-state__title">{title}</h2>
            <p className="ui-state__reason">
                <strong>Why:</strong> {why}
            </p>
            <p className="ui-state__next">You can go back to a safe page without retrying this action.</p>
            <div className="ui-state__actions">
                <ActionButton action={back} />
            </div>
        </div>
    );
}

export function SessionExpiredState({
    preservedSummary,
    signIn,
    discard,
}: {
    preservedSummary: string;
    signIn: Action;
    discard?: Action;
}) {
    return (
        <div className="ui-state ui-state--session" role="alertdialog" aria-labelledby="session-expired-title">
            <h2 id="session-expired-title" className="ui-state__title">
                Session expired
            </h2>
            <p className="ui-state__reason">
                Your admin preview session ended. We kept safe draft work so you don’t lose it.
            </p>
            <p className="ui-state__meta">
                <strong>Saved before sign-out:</strong> {preservedSummary}
            </p>
            <p className="ui-state__next">Sign in again to continue, or discard the draft.</p>
            <div className="ui-state__actions">
                <ActionButton action={signIn} />
                {discard ? <ActionButton action={discard} variant="secondary" /> : null}
            </div>
        </div>
    );
}

export function FieldValidationHint({ id, message }: { id?: string; message: string }) {
    return (
        <p id={id} className="field__error">
            {message}
        </p>
    );
}

export function SuccessState({
    title,
    reassurance,
    next,
    action,
    children,
}: PropsWithChildren<{
    title: string;
    reassurance: string;
    next: string;
    action: Action;
}>) {
    return (
        <div className="ui-state ui-state--success" role="status">
            <div className="success-burst" aria-hidden="true">
                <svg className="success-burst__ring" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="44" />
                </svg>
                <svg className="success-burst__check" viewBox="0 0 96 96">
                    <path d="M28 50 L42 64 L68 34" />
                </svg>
            </div>
            <h2 className="ui-state__title">{title}</h2>
            <p className="ui-state__reason">{reassurance}</p>
            <p className="ui-state__next">
                <strong>What happens next:</strong> {next}
            </p>
            {children}
            <div className="ui-state__actions">
                <ActionButton action={action} />
            </div>
        </div>
    );
}

export function StateSection({
    eyebrow,
    title,
    contract,
    children,
}: {
    eyebrow: string;
    title: string;
    contract: string;
    children: ReactNode;
}) {
    return (
        <section className="state-gallery__item">
            <p className="state-gallery__eyebrow">{eyebrow}</p>
            <h2 className="state-gallery__title">{title}</h2>
            <p className="state-gallery__contract">{contract}</p>
            <div className="state-gallery__preview">{children}</div>
        </section>
    );
}
