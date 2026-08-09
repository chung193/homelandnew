const isBrowser = typeof window !== 'undefined';

export const loadListViewOptions = (storageKey, defaults) => {
    if (!isBrowser) {
        return defaults;
    }

    try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) {
            return defaults;
        }

        const parsed = JSON.parse(raw);
        return {
            ...defaults,
            ...parsed,
            columnVisibilityModel: {
                ...(defaults?.columnVisibilityModel || {}),
                ...(parsed?.columnVisibilityModel || {}),
            },
        };
    } catch (error) {
        return defaults;
    }
};

export const saveListViewOptions = (storageKey, options) => {
    if (!isBrowser) {
        return;
    }

    try {
        window.localStorage.setItem(storageKey, JSON.stringify(options));
    } catch (error) {
        // Ignore localStorage write errors (private mode, quota exceeded, etc.)
    }
};
