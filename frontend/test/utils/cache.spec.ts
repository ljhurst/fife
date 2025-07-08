import { describe, it, expect, beforeEach } from 'vitest';

import { getCachedItem, setCachedItem, getCacheKey, clearCache } from '@/utils/cache';

describe('cache', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('getCacheKey', () => {
        it('should return a cache key with the prefix and parts joined by hyphens', () => {
            const keyParts = ['part1', 'part2', 'part3'];
            const expectedKey = 'fife-part1-part2-part3';
            expect(getCacheKey(keyParts)).toBe(expectedKey);
        });
    });

    describe('getCachedItem', () => {
        it('should return null if item does not exist in localStorage', () => {
            const key = 'fife-test-key';
            expect(getCachedItem(key)).toBeNull();
        });

        it('should return parsed object if item exists in localStorage', () => {
            const key = 'fife-test-key';
            const value = { test: 'value' };
            setCachedItem(key, value);

            expect(getCachedItem(key)).toEqual(value);
        });
    });

    describe('setCachedItem', () => {
        it('should store an object in localStorage as a JSON string', () => {
            const key = 'fife-test-key';
            const value = { test: 'value' };
            setCachedItem(key, value);

            expect(localStorage.getItem(key)).toBe(JSON.stringify(value));
        });
    });

    describe('clearCache', () => {
        it('should remove all items with the cache prefix from localStorage', () => {
            setCachedItem('fife-test-key1', { test: 'value1' });
            setCachedItem('fife-test-key2', { test: 'value2' });
            setCachedItem('other-prefix-key', { test: 'value3' });

            clearCache();

            expect(localStorage.getItem('fife-test-key1')).toBeNull();
            expect(localStorage.getItem('fife-test-key2')).toBeNull();
            expect(localStorage.getItem('other-prefix-key')).toBe(
                JSON.stringify({ test: 'value3' }),
            );
        });
    });
});
