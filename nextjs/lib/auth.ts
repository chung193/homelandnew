export const CUSTOMER_TOKEN_KEY = 'homelend:customer-token';
export const CUSTOMER_USER_KEY = 'homelend:customer-user';

export type CustomerSession = {
    token: string;
    user?: CustomerUser;
};

export type CustomerUser = {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    account_type?: 'customer' | 'property_owner' | string;
    wallet_balance?: number;
    test_posting_credits?: number;
    is_verified?: boolean;
    detail?: {
        phone?: string | null;
        address?: string | null;
        city?: string | null;
        birthday?: string | null;
        description?: string | null;
    } | null;
};

export function getCustomerToken(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.localStorage.getItem(CUSTOMER_TOKEN_KEY);
}

export function setCustomerSession(session: CustomerSession): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(CUSTOMER_TOKEN_KEY, session.token);

    if (session.user) {
        window.localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(session.user));
    }

    window.dispatchEvent(new Event('homelend:session-changed'));
}

export function getCustomerUser(): CustomerUser | null {
    if (typeof window === 'undefined') return null;
    const value = window.localStorage.getItem(CUSTOMER_USER_KEY);
    if (!value) return null;
    try {
        return JSON.parse(value) as CustomerUser;
    } catch {
        window.localStorage.removeItem(CUSTOMER_USER_KEY);
        return null;
    }
}

export function clearCustomerSession(): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    window.localStorage.removeItem(CUSTOMER_USER_KEY);
    window.dispatchEvent(new Event('homelend:session-changed'));
}
