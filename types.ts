import { Session } from 'koa-session'

export interface ShopCollection {
    shop: string,
    active: boolean,
    subscribed: subscription,
    accessToken: string,
    orders: [Order],
    storeName: string,
    storeEmail: string,
    origin: string,
    configuration: emailConfiguration,
}

export interface emailConfiguration {
    purchaserCustomMessage: string,
    recipientCustomMessage: string,
    deleteCustomMessage: string,
}

interface subscription {
    subscriptionId: string,
    subscriptionStatus: boolean
}

interface node {
    id: string;
    available: number;
    incoming: number;
}

interface edges {
    node: node;
}
export interface inventoryLevels {
    edges: edges[];
}

interface inventoryInterface {
    id: string;
    inventoryLevels: inventoryLevels;
}

export interface queryNodes {
    id: string;
    inventoryItem: inventoryInterface;
    inventoryPolicy: string;
    inventoryQuantity: number;
}

export interface lineItems {
    variantId: string;
    quantity: number;
}

export interface Order {
    id: string,
    name: string,
    createdAt: string,
    status: string,
    price: string,
    purchaserName: string,
    purchaserEmail: string,
    recipientName: string,
    recipientEmail: string,
    customMessage: string,
    recipientPhone: string,
    addedInventoryBack: boolean,
    url: string,
    [key: string]: string | boolean
}

export interface CustomError {
    type: string,
    error: string,
    message: string
}