import type { InventoryMovement } from '@/types';

export const inventoryMovements: InventoryMovement[] = [
    {
        id: 1,
        variantId: 301,
        type: 'adjustment',
        quantity: 5,
        reason: 'Cycle count correction',
        createdAt: '2026-11-01T09:00:00+08:00',
    },
    {
        id: 2,
        variantId: 102,
        type: 'reservation',
        quantity: 1,
        reason: 'Checkout KS-10001',
        createdAt: '2026-11-09T10:15:00+08:00',
    },
    {
        id: 3,
        variantId: 401,
        type: 'fulfillment',
        quantity: 1,
        reason: 'ready_for_delivery KS-10004',
        createdAt: '2026-11-08T10:00:00+08:00',
    },
    {
        id: 4,
        variantId: 301,
        type: 'reservation_release',
        quantity: 1,
        reason: 'Cancel KS-10007',
        createdAt: '2026-11-04T10:00:00+08:00',
    },
    {
        id: 5,
        variantId: 601,
        type: 'reservation',
        quantity: 2,
        reason: 'Open reservations including KS-10009',
        createdAt: '2026-11-09T18:00:00+08:00',
    },
];
