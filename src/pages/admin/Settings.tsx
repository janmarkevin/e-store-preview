import { useState } from 'react';
import { FloppyDisk, GearSix } from '@phosphor-icons/react';
import AdminPageFrame from '@/components/admin/AdminPageFrame';
import { SuccessState } from '@/components/ui/UiStates';
import { useAdminStore } from '@/context/AdminStoreContext';

export default function AdminSettingsPage() {
    const { settings, updateSettings } = useAdminStore();
    const [draft, setDraft] = useState(settings);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [flash, setFlash] = useState<string | null>(null);

    function validate() {
        const next: Record<string, string> = {};
        if (!draft.storeName.trim())
            next.storeName = 'Store name is required — guests see this on the storefront.';
        if (!draft.messengerUrl.trim() || !draft.messengerUrl.startsWith('http'))
            next.messengerUrl = 'Enter a full Messenger URL starting with https://';
        if (Number.isNaN(Number(draft.defaultDeliveryFee)) || draft.defaultDeliveryFee < 0)
            next.defaultDeliveryFee = 'Delivery fee must be 0 or greater (PHP).';
        if (!draft.gcashDisplayName.trim())
            next.gcashDisplayName = 'GCash display name is required for checkout instructions.';
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    function onSave(e: React.FormEvent) {
        e.preventDefault();
        setFlash(null);
        if (!validate()) return;
        updateSettings(draft);
        setFlash('Store settings saved. Storefront mock reads these values on next view.');
    }

    return (
        <AdminPageFrame
            title="Store Settings"
            description="Public storefront settings used by checkout (Messenger, GCash, delivery fee)."
        >
            {flash ? (
                <div className="mb-4">
                    <SuccessState
                        title="Settings saved"
                        reassurance={flash}
                        next="Open the storefront checkout to confirm delivery fee and GCash copy."
                        action={{ label: 'View storefront', to: '/' }}
                    />
                </div>
            ) : null}

            <form className="admin-panel max-w-2xl" onSubmit={onSave} noValidate>
                <h2 className="admin-panel__title flex items-center gap-2">
                    <GearSix size={18} aria-hidden />
                    Public store details
                </h2>

                <div className="grid gap-4">
                    <div className="field">
                        <label className="field__label" htmlFor="set-name">
                            Store name
                        </label>
                        <input
                            id="set-name"
                            className={`field__input${errors.storeName ? ' field__input--error' : ''}`}
                            value={draft.storeName}
                            onChange={(e) => setDraft({ ...draft, storeName: e.target.value })}
                            aria-invalid={Boolean(errors.storeName)}
                            aria-describedby={errors.storeName ? 'set-name-err' : undefined}
                        />
                        {errors.storeName ? (
                            <p id="set-name-err" className="field__error">
                                {errors.storeName}
                            </p>
                        ) : null}
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="set-desc">
                            Description
                        </label>
                        <textarea
                            id="set-desc"
                            className="field__textarea"
                            rows={3}
                            value={draft.description}
                            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                        />
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="set-msg">
                            Messenger URL
                        </label>
                        <input
                            id="set-msg"
                            className={`field__input${errors.messengerUrl ? ' field__input--error' : ''}`}
                            value={draft.messengerUrl}
                            onChange={(e) => setDraft({ ...draft, messengerUrl: e.target.value })}
                            aria-invalid={Boolean(errors.messengerUrl)}
                            aria-describedby={errors.messengerUrl ? 'set-msg-err' : undefined}
                        />
                        {errors.messengerUrl ? (
                            <p id="set-msg-err" className="field__error">
                                {errors.messengerUrl}
                            </p>
                        ) : null}
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="set-fee">
                            Default delivery fee (PHP)
                        </label>
                        <input
                            id="set-fee"
                            className={`field__input${errors.defaultDeliveryFee ? ' field__input--error' : ''}`}
                            type="number"
                            min={0}
                            value={draft.defaultDeliveryFee}
                            onChange={(e) =>
                                setDraft({
                                    ...draft,
                                    defaultDeliveryFee: Number(e.target.value),
                                })
                            }
                            aria-invalid={Boolean(errors.defaultDeliveryFee)}
                            aria-describedby={
                                errors.defaultDeliveryFee ? 'set-fee-err' : undefined
                            }
                        />
                        {errors.defaultDeliveryFee ? (
                            <p id="set-fee-err" className="field__error">
                                {errors.defaultDeliveryFee}
                            </p>
                        ) : null}
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="set-time">
                            Delivery timeframe
                        </label>
                        <input
                            id="set-time"
                            className="field__input"
                            value={draft.defaultDeliveryTimeframe}
                            onChange={(e) =>
                                setDraft({
                                    ...draft,
                                    defaultDeliveryTimeframe: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="set-gcash">
                            GCash display name
                        </label>
                        <input
                            id="set-gcash"
                            className={`field__input${errors.gcashDisplayName ? ' field__input--error' : ''}`}
                            value={draft.gcashDisplayName}
                            onChange={(e) =>
                                setDraft({ ...draft, gcashDisplayName: e.target.value })
                            }
                            aria-invalid={Boolean(errors.gcashDisplayName)}
                        />
                        {errors.gcashDisplayName ? (
                            <p className="field__error">{errors.gcashDisplayName}</p>
                        ) : null}
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="set-gcash-ins">
                            GCash instructions
                        </label>
                        <textarea
                            id="set-gcash-ins"
                            className="field__textarea"
                            rows={3}
                            value={draft.gcashInstructions}
                            onChange={(e) =>
                                setDraft({ ...draft, gcashInstructions: e.target.value })
                            }
                        />
                    </div>
                </div>

                <button type="submit" className="btn btn--admin mt-6">
                    <FloppyDisk size={18} aria-hidden />
                    Save settings
                </button>
            </form>
        </AdminPageFrame>
    );
}
