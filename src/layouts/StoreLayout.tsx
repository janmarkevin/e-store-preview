import type { PropsWithChildren } from 'react';
import { StoreFooter } from '@/components/store/StoreFooter';
import StoreHeader from '@/components/store/StoreHeader';

export default function StoreLayout({ children }: PropsWithChildren) {
    return (
        <div className="store-layout">
            <div className="demo-banner" role="note">
                Static preview — sample data only; no real orders or payments.
            </div>
            <StoreHeader />
            <main className="store-layout__main">{children}</main>
            <StoreFooter />
        </div>
    );
}
