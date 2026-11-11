export type ProductStatus = 'draft' | 'active' | 'archived';
export type VariantStatus = 'active' | 'inactive';
export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'ready_for_delivery'
    | 'in_transit'
    | 'delivered'
    | 'cancelled';
export type PaymentMethod = 'cod' | 'gcash';
export type PaymentStatus =
    | 'unpaid'
    | 'pending_verification'
    | 'paid'
    | 'rejected'
    | 'refunded';
export type InventoryMovementType =
    | 'adjustment'
    | 'reservation'
    | 'reservation_release'
    | 'fulfillment'
    | 'return';

export interface StoreSettings {
    storeName: string;
    logoText: string;
    description: string;
    messengerUrl: string;
    gcashDisplayName: string;
    gcashInstructions: string;
    gcashQrLabel: string;
    defaultDeliveryFee: number;
    defaultDeliveryTimeframe: string;
    currency: 'PHP';
    featuredProductIds: number[];
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    imageTone: string;
    /** Public mock asset path ending in .webp */
    imageSrc?: string | null;
    isActive: boolean;
    sortOrder: number;
}

export interface ProductVariant {
    id: number;
    productId: number;
    sku: string;
    name: string | null;
    attributes: Record<string, string> | null;
    price: number;
    stockQuantity: number;
    reservedQuantity: number;
    isDefault: boolean;
    status: VariantStatus;
    /** Gallery image index to show when this variant is selected */
    imageIndex?: number | null;
}

export interface ProductImage {
    id: number;
    productId: number;
    tone: string;
    label: string;
    altText: string;
    sortOrder: number;
    isPrimary: boolean;
    /** Public mock asset path ending in .webp */
    src?: string | null;
}

export interface Product {
    id: number;
    categoryId: number | null;
    name: string;
    slug: string;
    description: string;
    status: ProductStatus;
    isPreorder: boolean;
    preorderAvailableAt: string | null;
    preorderLimit: number | null;
    preorderReservedQuantity: number;
    createdAt: string;
    variants: ProductVariant[];
    images: ProductImage[];
}

export interface GuestContact {
    fullName: string;
    email: string;
    mobile: string;
    city: string;
    barangay: string;
    street: string;
    region?: string;
    province?: string;
    postalCode?: string;
    deliveryNotes?: string;
}

export interface OrderItem {
    id: number;
    productId: number;
    variantId: number;
    productName: string;
    variantLabel: string;
    quantity: number;
    unitPrice: number;
    lineSubtotal: number;
    isPreorder: boolean;
    preorderAvailableAt: string | null;
}

export interface OrderStatusHistory {
    id: number;
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus;
    note: string | null;
    createdAt: string;
}

export interface Order {
    id: number;
    orderNumber: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    deliveryFee: number;
    subtotal: number;
    total: number;
    estimatedDeliveryAt: string | null;
    deliveredAt: string | null;
    createdAt: string;
    guest: GuestContact;
    items: OrderItem[];
    history: OrderStatusHistory[];
}

export interface Payment {
    id: number;
    orderId: number;
    method: PaymentMethod;
    status: PaymentStatus;
    amount: number;
    verifiedAt: string | null;
    notes: string | null;
}

export interface InventoryMovement {
    id: number;
    variantId: number;
    type: InventoryMovementType;
    quantity: number;
    reason: string;
    createdAt: string;
}

export interface CartLine {
    productId: number;
    variantId: number;
    quantity: number;
}

export interface TrackingTokenMap {
    token: string;
    orderId: number;
}
