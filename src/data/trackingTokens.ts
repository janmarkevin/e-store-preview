import type { TrackingTokenMap } from '@/types';

/** Demo tokens only — guessable for client walkthroughs. */
export const trackingTokens: TrackingTokenMap[] = [
    { token: 'demo-track-pending', orderId: 1 },
    { token: 'demo-track-gcash-unpaid', orderId: 2 },
    { token: 'demo-track-preparing', orderId: 3 },
    { token: 'demo-track-transit', orderId: 5 },
    { token: 'demo-track-delivered', orderId: 6 },
    { token: 'demo-track-cancelled', orderId: 7 },
];
