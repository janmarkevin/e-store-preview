import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminLoginPage() {
    const { isAuthenticated, login } = useAdminAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('admin@kevinstore.demo');
    const [password, setPassword] = useState('preview-admin');
    const [error, setError] = useState<string | null>(null);

    if (isAuthenticated) {
        return <Navigate to="/admin" replace />;
    }

    function onSubmit(event: FormEvent) {
        event.preventDefault();
        const result = login(email, password);
        if (!result.ok) {
            setError(result.message ?? 'Login failed');
            return;
        }
        navigate('/admin');
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-admin-background px-4">
            <form
                onSubmit={onSubmit}
                className="w-full max-w-md rounded-xl bg-admin-surface p-8 shadow-md"
            >
                <p className="demo-banner -mx-8 -mt-8 mb-6 rounded-none">
                    Simulated admin gate — not Fortify.
                </p>
                <h1 className="text-2xl font-bold">Admin sign in</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Demo credentials are prefilled.
                </p>

                {error ? (
                    <p className="mt-4 text-sm text-danger" role="alert">
                        {error}
                    </p>
                ) : null}

                <div className="mt-6 field">
                    <label className="field__label" htmlFor="admin-email">
                        Email
                    </label>
                    <input
                        id="admin-email"
                        className="field__input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                    />
                </div>
                <div className="mt-4 field">
                    <label className="field__label" htmlFor="admin-password">
                        Password
                    </label>
                    <input
                        id="admin-password"
                        className="field__input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                    />
                </div>
                <button type="submit" className="btn btn--admin mt-6 w-full">
                    Sign in
                </button>
                <Link to="/" className="mt-4 inline-block text-sm underline-offset-2 hover:underline">
                    Back to storefront
                </Link>
            </form>
        </div>
    );
}
