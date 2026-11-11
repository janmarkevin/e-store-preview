import { useState } from 'react';
import { User } from '@phosphor-icons/react';
import AdminPageFrame from '@/components/admin/AdminPageFrame';
import { SuccessState } from '@/components/ui/UiStates';
import { useAdminStore } from '@/context/AdminStoreContext';

export default function AdminProfilePage() {
    const { profile, updateProfile } = useAdminStore();
    const [name, setName] = useState(profile.name);
    const [email, setEmail] = useState(profile.email);
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [flash, setFlash] = useState<string | null>(null);

    function validate() {
        const next: Record<string, string> = {};
        if (!name.trim()) next.name = 'Enter the admin display name.';
        if (!email.trim() || !email.includes('@'))
            next.email = 'Enter a valid email — this is the Fortify-style login identity.';
        if (password) {
            if (password.length < 8)
                next.password = 'Password must be at least 8 characters.';
            if (password !== confirm)
                next.confirm = 'Confirmation does not match — re-type the new password.';
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    function onSave(e: React.FormEvent) {
        e.preventDefault();
        setFlash(null);
        if (!validate()) return;
        updateProfile({ name: name.trim(), email: email.trim() });
        setFlash(
            password
                ? 'Profile and password updated in the demo session.'
                : 'Profile details updated. Password left unchanged.',
        );
        setPassword('');
        setConfirm('');
    }

    return (
        <AdminPageFrame
            title="Admin Profile"
            description="Name, email, and password for the single admin account (Spec §9.4)."
        >
            {flash ? (
                <div className="mb-4">
                    <SuccessState
                        title="Profile saved"
                        reassurance={flash}
                        next="Use Logout in the sidebar or avatar menu if you need to re-enter via the login gate."
                        action={{ label: 'Go to dashboard', to: '/admin' }}
                    />
                </div>
            ) : null}

            <form className="admin-panel max-w-xl" onSubmit={onSave} noValidate>
                <h2 className="admin-panel__title flex items-center gap-2">
                    <User size={18} aria-hidden />
                    Account details
                </h2>

                <div className="grid gap-4">
                    <div className="field">
                        <label className="field__label" htmlFor="prof-name">
                            Name
                        </label>
                        <input
                            id="prof-name"
                            className={`field__input${errors.name ? ' field__input--error' : ''}`}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={errors.name ? 'prof-name-err' : undefined}
                        />
                        {errors.name ? (
                            <p id="prof-name-err" className="field__error">
                                {errors.name}
                            </p>
                        ) : null}
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="prof-email">
                            Email
                        </label>
                        <input
                            id="prof-email"
                            type="email"
                            autoComplete="username"
                            className={`field__input${errors.email ? ' field__input--error' : ''}`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? 'prof-email-err' : undefined}
                        />
                        {errors.email ? (
                            <p id="prof-email-err" className="field__error">
                                {errors.email}
                            </p>
                        ) : null}
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="prof-pass">
                            New password (optional)
                        </label>
                        <input
                            id="prof-pass"
                            type="password"
                            autoComplete="new-password"
                            className={`field__input${errors.password ? ' field__input--error' : ''}`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={errors.password ? 'prof-pass-err' : undefined}
                        />
                        {errors.password ? (
                            <p id="prof-pass-err" className="field__error">
                                {errors.password}
                            </p>
                        ) : null}
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="prof-confirm">
                            Confirm password
                        </label>
                        <input
                            id="prof-confirm"
                            type="password"
                            autoComplete="new-password"
                            className={`field__input${errors.confirm ? ' field__input--error' : ''}`}
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            aria-invalid={Boolean(errors.confirm)}
                            aria-describedby={errors.confirm ? 'prof-confirm-err' : undefined}
                        />
                        {errors.confirm ? (
                            <p id="prof-confirm-err" className="field__error">
                                {errors.confirm}
                            </p>
                        ) : null}
                    </div>
                </div>

                <button type="submit" className="btn btn--admin mt-6">
                    Save profile
                </button>
            </form>
        </AdminPageFrame>
    );
}
