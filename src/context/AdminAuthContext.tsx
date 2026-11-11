import {
    createContext,
    useContext,
    useMemo,
    useState,
    type PropsWithChildren,
} from 'react';

const STORAGE_KEY = 'kevin-store-preview-admin';

type AdminAuthContextValue = {
    isAuthenticated: boolean;
    login: (email: string, password: string) => { ok: boolean; message?: string };
    logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

/** Simulated gate only — not real Fortify auth. */
const DEMO_EMAIL = 'admin@kevinstore.demo';
const DEMO_PASSWORD = 'preview-admin';

export function AdminAuthProvider({ children }: PropsWithChildren) {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }
        return localStorage.getItem(STORAGE_KEY) === '1';
    });

    const value = useMemo<AdminAuthContextValue>(
        () => ({
            isAuthenticated,
            login(email, password) {
                if (
                    email.trim().toLowerCase() === DEMO_EMAIL &&
                    password === DEMO_PASSWORD
                ) {
                    localStorage.setItem(STORAGE_KEY, '1');
                    setIsAuthenticated(true);
                    return { ok: true };
                }
                return {
                    ok: false,
                    message: `Use ${DEMO_EMAIL} / ${DEMO_PASSWORD} (demo only).`,
                };
            },
            logout() {
                localStorage.removeItem(STORAGE_KEY);
                setIsAuthenticated(false);
            },
        }),
        [isAuthenticated],
    );

    return (
        <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const ctx = useContext(AdminAuthContext);
    if (!ctx) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }
    return ctx;
}
