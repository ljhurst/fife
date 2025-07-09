const CACHE_PREFIX = 'fife';

function getCacheKey(keyParts: string[]): string {
    return [CACHE_PREFIX, ...keyParts].join('-');
}

function getCachedItem(key: string): object | null {
    const item = localStorage.getItem(key);
    if (item) {
        return JSON.parse(item);
    }
    return null;
}

function setCachedItem(key: string, value: object): void {
    localStorage.setItem(key, JSON.stringify(value));
}

function deleteCachedItem(key: string): void {
    localStorage.removeItem(key);
}

function clearCache(): void {
    for (const key in localStorage) {
        if (key.startsWith(CACHE_PREFIX)) {
            localStorage.removeItem(key);
        }
    }
}

export { getCacheKey, getCachedItem, setCachedItem, deleteCachedItem, clearCache };
