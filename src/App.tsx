import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import RequireAdmin from '@/components/admin/RequireAdmin';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import { AdminStoreProvider } from '@/context/AdminStoreContext';
import { CartProvider } from '@/context/CartContext';
import AdminLayout from '@/layouts/AdminLayout';
import StoreLayout from '@/layouts/StoreLayout';
import AdminCategoriesPage from '@/pages/admin/Categories';
import AdminDashboardPage from '@/pages/admin/Dashboard';
import AdminInventoryPage from '@/pages/admin/Inventory';
import AdminOrderDetailPage from '@/pages/admin/OrderDetail';
import AdminOrdersPage from '@/pages/admin/Orders';
import AdminPaymentsPage from '@/pages/admin/Payments';
import AdminProductsPage from '@/pages/admin/Products';
import AdminProfilePage from '@/pages/admin/Profile';
import AdminSettingsPage from '@/pages/admin/Settings';
import AdminLoginPage from '@/pages/auth/AdminLogin';
import DemoPage from '@/pages/Demo';
import CartPage from '@/pages/store/Cart';
import CatalogPage from '@/pages/store/Catalog';
import CategoriesPage from '@/pages/store/Categories';
import CheckoutPage from '@/pages/store/Checkout';
import ConfirmationPage from '@/pages/store/Confirmation';
import HomePage from '@/pages/store/Home';
import ProductDetailPage from '@/pages/store/ProductDetail';
import TrackPage from '@/pages/tracking/Track';

function StoreRoute({ children }: { children: ReactNode }) {
    return <StoreLayout>{children}</StoreLayout>;
}

function AdminRoute({ children }: { children: ReactNode }) {
    return (
        <RequireAdmin>
            <AdminLayout>{children}</AdminLayout>
        </RequireAdmin>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <CartProvider>
                <AdminAuthProvider>
                    <AdminStoreProvider>
                        <Routes>
                        <Route
                            path="/"
                            element={
                                <StoreRoute>
                                    <HomePage />
                                </StoreRoute>
                            }
                        />
                        <Route
                            path="/shop"
                            element={
                                <StoreRoute>
                                    <CatalogPage />
                                </StoreRoute>
                            }
                        />
                        <Route
                            path="/categories"
                            element={
                                <StoreRoute>
                                    <CategoriesPage />
                                </StoreRoute>
                            }
                        />
                        <Route
                            path="/categories/:slug"
                            element={
                                <StoreRoute>
                                    <CategoriesPage />
                                </StoreRoute>
                            }
                        />
                        <Route
                            path="/products/:slug"
                            element={
                                <StoreRoute>
                                    <ProductDetailPage />
                                </StoreRoute>
                            }
                        />
                        <Route
                            path="/cart"
                            element={
                                <StoreRoute>
                                    <CartPage />
                                </StoreRoute>
                            }
                        />
                        <Route
                            path="/checkout"
                            element={
                                <StoreRoute>
                                    <CheckoutPage />
                                </StoreRoute>
                            }
                        />
                        <Route
                            path="/confirmation"
                            element={
                                <StoreRoute>
                                    <ConfirmationPage />
                                </StoreRoute>
                            }
                        />
                        <Route
                            path="/track"
                            element={
                                <StoreRoute>
                                    <TrackPage />
                                </StoreRoute>
                            }
                        />
                        <Route
                            path="/track/:token"
                            element={
                                <StoreRoute>
                                    <TrackPage />
                                </StoreRoute>
                            }
                        />
                        <Route
                            path="/demo"
                            element={
                                <StoreRoute>
                                    <DemoPage />
                                </StoreRoute>
                            }
                        />

                        <Route path="/admin/login" element={<AdminLoginPage />} />
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <AdminDashboardPage />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/products"
                            element={
                                <AdminRoute>
                                    <AdminProductsPage />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/categories"
                            element={
                                <AdminRoute>
                                    <AdminCategoriesPage />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/orders"
                            element={
                                <AdminRoute>
                                    <AdminOrdersPage />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/orders/:id"
                            element={
                                <AdminRoute>
                                    <AdminOrderDetailPage />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/payments"
                            element={
                                <AdminRoute>
                                    <AdminPaymentsPage />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/inventory"
                            element={
                                <AdminRoute>
                                    <AdminInventoryPage />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/settings"
                            element={
                                <AdminRoute>
                                    <AdminSettingsPage />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/profile"
                            element={
                                <AdminRoute>
                                    <AdminProfilePage />
                                </AdminRoute>
                            }
                        />

                        <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </AdminStoreProvider>
                </AdminAuthProvider>
            </CartProvider>
        </BrowserRouter>
    );
}
