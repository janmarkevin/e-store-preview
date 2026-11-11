import type { StoreSettings } from '@/types';

export const storeSettings: StoreSettings = {
    storeName: 'BlackBird Store',
    logoText: 'BlackBird Store',
    description:
        'A single-seller surigao city storefront with guest checkout, COD, and manual GCash.',
    messengerUrl: 'https://m.me/107074822443656',
    gcashDisplayName: 'BlackBird Store Demo',
    gcashInstructions:
        'Pay the exact amount in GCash, then send your order number and screenshot via Messenger. Verification is manual.',
    gcashQrLabel: 'GCash QR (sample)',
    defaultDeliveryFee: 80,
    defaultDeliveryTimeframe: '2–5 business days (seller-operated)',
    currency: 'PHP',
    featuredProductIds: [1, 2, 5, 8],
};
