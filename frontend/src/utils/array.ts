function sortArrayOfObjectsByKey<T extends Record<string, unknown>>(arr: T[], key: keyof T): T[] {
    return arr.slice().sort((a, b) => {
        if (a[key] < b[key]) {
            return -1;
        }
        if (a[key] > b[key]) {
            return 1;
        }
        return 0;
    });
}

function isLastElement<T>(arr: T[], index: number): boolean {
    return index === arr.length - 1;
}

export { sortArrayOfObjectsByKey, isLastElement };
