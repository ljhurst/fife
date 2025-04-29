import { describe, expect, test } from 'vitest';

import { arrayToCommaSeparatedString } from '@/utils/string';

describe('string', () => {
    describe('arrayToCommaSeparatedString', () => {
        test('should convert array to comma-separated string', () => {
            const input = ['apple', 'banana', 'cherry'];
            const expected = 'apple, banana, cherry';
            expect(arrayToCommaSeparatedString(input)).toBe(expected);
        });

        test('should handle empty array', () => {
            const input: ReadonlyArray<string> = [];
            const expected = '';
            expect(arrayToCommaSeparatedString(input)).toBe(expected);
        });

        test('should handle single element array', () => {
            const input = ['apple'];
            const expected = 'apple';
            expect(arrayToCommaSeparatedString(input)).toBe(expected);
        });
    });
});
