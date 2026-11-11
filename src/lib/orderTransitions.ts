import type { OrderStatus, PaymentMethod, PaymentStatus } from '@/types';

/** R1 + normal workflow from BUSINESS-FLOWCHARTS / BUSINESS-RULES */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready_for_delivery', 'cancelled'],
    ready_for_delivery: ['in_transit'],
    in_transit: ['delivered'],
    delivered: [],
    cancelled: [],
};

export function allowedOrderTransitions(status: OrderStatus): OrderStatus[] {
    return TRANSITIONS[status] ?? [];
}

export function canCancelOrder(status: OrderStatus): boolean {
    return status === 'pending' || status === 'confirmed' || status === 'preparing';
}

export function paymentActionLabel(
    method: PaymentMethod,
    status: PaymentStatus,
): string | null {
    if (method === 'cod' && status === 'unpaid') {
        return 'Mark COD paid (cash received)';
    }
    if (method === 'gcash' && status === 'unpaid') {
        return 'Mark pending verification';
    }
    if (method === 'gcash' && status === 'pending_verification') {
        return 'Review proof';
    }
    return null;
}
