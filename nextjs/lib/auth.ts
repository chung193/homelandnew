export const CUSTOMER_TOKEN_KEY = 'homelend:customer-token';
export const CUSTOMER_USER_KEY = 'homelend:customer-user';

export type CustomerSession = {
    token: string;
    user?: unknown;
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
}

export function clearCustomerSession(): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    window.localStorage.removeItem(CUSTOMER_USER_KEY);
}
