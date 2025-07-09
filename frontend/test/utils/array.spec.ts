import { describe, it, expect } from 'vitest';

import { sortArrayOfObjectsByKey } from '@/utils/array';

describe('array', () => {
    describe('sortArrayOfObjectsByKey', () => {
        it('should sort an array of objects by a string key', () => {
            const unsortedArray = [
                { name: 'Charlie', age: 30 },
                { name: 'Alice', age: 25 },
                { name: 'Bob', age: 35 },
            ];

            const sortedArray = sortArrayOfObjectsByKey(unsortedArray, 'name');

            expect(sortedArray).toEqual([
                { name: 'Alice', age: 25 },
                { name: 'Bob', age: 35 },
                { name: 'Charlie', age: 30 },
            ]);
        });

        it('should sort an array of objects by a numeric key', () => {
            const unsortedArray = [
                { name: 'Charlie', age: 30 },
                { name: 'Alice', age: 25 },
                { name: 'Bob', age: 35 },
            ];

            const sortedArray = sortArrayOfObjectsByKey(unsortedArray, 'age');

            expect(sortedArray).toEqual([
                { name: 'Alice', age: 25 },
                { name: 'Charlie', age: 30 },
                { name: 'Bob', age: 35 },
            ]);
        });

        it('should return an empty array when given an empty array', () => {
            const emptyArray: Array<Record<string, unknown>> = [];

            const sortedArray = sortArrayOfObjectsByKey(emptyArray, 'name');

            expect(sortedArray).toEqual([]);
        });

        it('should not modify the original array', () => {
            const originalArray = [
                { name: 'Charlie', age: 30 },
                { name: 'Alice', age: 25 },
                { name: 'Bob', age: 35 },
            ];

            const arrayClone = [...originalArray];

            sortArrayOfObjectsByKey(originalArray, 'name');

            expect(originalArray).toEqual(arrayClone);
        });
    });
});
