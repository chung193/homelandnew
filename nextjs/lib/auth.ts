export const CUSTOMER_TOKEN_KEY = 'homelend:customer-token';
export const CUSTOMER_USER_KEY = 'homelend:customer-user';
export const ACCOUNT_MODE_KEY = 'homelend:account-mode';

export type AccountMode = 'customer' | 'property_owner';

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
    identity_verified?: boolean;
    is_property_owner?: boolean;
    owner_type?: 'household_business' | 'broker' | 'company' | string | null;
    owner_types?: string[];
    owner_applications?: Array<{
        id: number;
        owner_type: string;
        status: 'pending' | 'approved' | 'rejected';
        rejection_reason?: string | null;
    }>;
    owner_application_status?: 'pending' | 'approved' | 'rejected' | null;
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

export function getAccountMode(user: CustomerUser | null = getCustomerUser()): AccountMode {
    if (typeof window === 'undefined' || !user?.is_property_owner) return 'customer';
    return window.localStorage.getItem(ACCOUNT_MODE_KEY) === 'customer' ? 'customer' : 'property_owner';
}

export function setAccountMode(mode: AccountMode, user: CustomerUser | null = getCustomerUser()): void {
    if (typeof window === 'undefined') return;
    const allowedMode = user?.is_property_owner ? mode : 'customer';
    window.localStorage.setItem(ACCOUNT_MODE_KEY, allowedMode);
    window.dispatchEvent(new Event('homelend:account-mode-changed'));
}

export function clearCustomerSession(): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    window.localStorage.removeItem(CUSTOMER_USER_KEY);
    window.localStorage.removeItem(ACCOUNT_MODE_KEY);
    window.dispatchEvent(new Event('homelend:session-changed'));
}
