import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function RequireAdmin({ children }: PropsWithChildren) {
    const { isAuthenticated } = useAdminAuth();
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }
    return children;
}
