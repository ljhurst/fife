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

export { getCachedItem, setCachedItem };
