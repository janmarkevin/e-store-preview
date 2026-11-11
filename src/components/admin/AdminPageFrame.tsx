import type { PropsWithChildren, ReactNode } from 'react';
import { EmptyState } from '@/components/ui/UiStates';

type AdminPageFrameProps = PropsWithChildren<{
    title: string;
    description?: string;
    actions?: ReactNode;
    empty?: {
        title: string;
        reason: string;
        nextStep: string;
        actionLabel: string;
        onAction: () => void;
    };
    isEmpty?: boolean;
}>;

export default function AdminPageFrame({
    title,
    description,
    actions,
    empty,
    isEmpty = false,
    children,
}: AdminPageFrameProps) {
    return (
        <div className="admin-page">
            <div className="admin-page__header">
                <div>
                    <h1 className="admin-page__title">{title}</h1>
                    {description ? (
                        <p className="admin-page__desc">{description}</p>
                    ) : null}
                </div>
                {actions ? <div className="admin-page__actions">{actions}</div> : null}
            </div>

            {isEmpty && empty ? (
                <EmptyState
                    title={empty.title}
                    reason={empty.reason}
                    nextStep={empty.nextStep}
                    action={{ label: empty.actionLabel, onClick: empty.onAction }}
                />
            ) : (
                children
            )}
        </div>
    );
}
