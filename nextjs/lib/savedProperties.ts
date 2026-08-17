export const SAVED_PROPERTIES_CHANGED = 'homelend:saved-properties-changed';

let cachedToken: string | null = null;
let cachedIds: Set<string> | null = null;
let pending: Promise<Set<string>> | null = null;

export async function loadSavedPropertyIds(token: string, force = false): Promise<Set<string>> {
    if (!force && cachedToken === token && cachedIds) return new Set(cachedIds);
    if (!force && cachedToken === token && pending) return new Set(await pending);
    cachedToken = token;
    pending = fetch('/api/saved-properties', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
        .then(async (response) => {
            if (!response.ok) throw new Error('Unable to load saved properties.');
            const result = await response.json();
            const items = Array.isArray(result.data) ? result.data : [];
            cachedIds = new Set<string>(items.map((item: { id: string | number }) => String(item.id)));
            return cachedIds;
        })
        .finally(() => { pending = null; });
    return new Set(await pending);
}

export async function toggleSavedProperty(id: string, token: string, saved: boolean): Promise<boolean> {
    const response = await fetch(saved ? `/api/saved-properties/${id}` : '/api/saved-properties', {
        method: saved ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', ...(saved ? {} : { 'Content-Type': 'application/json' }) },
        body: saved ? undefined : JSON.stringify({ property_id: id }),
    });
    if (!response.ok) throw new Error('Unable to update saved property.');
    if (!cachedIds || cachedToken !== token) cachedIds = new Set<string>();
    cachedToken = token;
    if (saved) cachedIds.delete(id); else cachedIds.add(id);
    window.dispatchEvent(new CustomEvent(SAVED_PROPERTIES_CHANGED));
    return !saved;
}

export function clearSavedPropertiesCache() {
    cachedToken = null;
    cachedIds = null;
    pending = null;
}
