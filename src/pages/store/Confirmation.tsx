import { useSearchParams } from 'react-router-dom';
import { SuccessState } from '@/components/ui/UiStates';
import { storeSettings } from '@/data/storeSettings';
import { formatPeso } from '@/data/selectors';

export default function ConfirmationPage() {
    const [params] = useSearchParams();
    const orderNumber = params.get('order') ?? 'KS-DEMO';
    const token = params.get('token') ?? 'demo-track-pending';
    const method = params.get('method') ?? 'cod';
    const total = Number(params.get('total') ?? '0');

    return (
        <div className="page-shell">
            <SuccessState
                title="Order confirmed (demo)"
                reassurance="Simulated checkout only — no real payment or inventory change occurred."
                next={
                    method === 'gcash'
                        ? 'Pay via GCash, send proof in Messenger, then track status anytime with your link.'
                        : 'Wait for seller delivery, pay COD cash on receipt, and track status with your link.'
                }
                action={{ label: 'Track this order', to: `/track/${token}` }}
            >
                <div className="mt-6 rounded-lg border border-border bg-surface p-4 text-foreground">
                    <p className="text-sm text-muted-foreground">Order number</p>
                    <p className="text-xl font-bold">{orderNumber}</p>
                    <p className="mt-4 text-sm text-muted-foreground">Amount due</p>
                    <p className="text-lg font-semibold">{formatPeso(total)}</p>
                    <p className="mt-4 text-sm text-muted-foreground">Payment method</p>
                    <p className="font-medium uppercase">{method}</p>

                    {method === 'gcash' ? (
                        <div className="mt-6 rounded-lg border border-border p-4">
                            <p className="font-semibold">{storeSettings.gcashQrLabel}</p>
                            <div
                                className="mt-3 flex h-40 items-center justify-center rounded-md bg-muted text-sm text-muted-foreground"
                                role="img"
                                aria-label="Sample GCash QR placeholder"
                            >
                                Sample QR
                            </div>
                            <p className="mt-3 text-sm">
                                Pay <strong>{storeSettings.gcashDisplayName}</strong>
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {storeSettings.gcashInstructions}
                            </p>
                            <a
                                className="btn btn--secondary mt-4"
                                href={storeSettings.messengerUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Open Messenger
                            </a>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Messenger click does not change payment status.
                            </p>
                        </div>
                    ) : (
                        <p className="mt-6 text-sm text-muted-foreground">
                            COD: pay cash to the seller on delivery. Delivery completion alone does
                            not mark payment paid.
                        </p>
                    )}
                </div>
            </SuccessState>
        </div>
    );
}
