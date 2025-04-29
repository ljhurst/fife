import { describe, expect, test } from 'vitest';

import { csvToJson } from '@/utils/data';

describe('data', () => {
    describe('csvToJson', () => {
        test('should convert CSV to JSON', () => {
            const csvString = 'name,age\nJohn,30\nDoe,25';
            const expectedJson = [
                { name: 'John', age: '30' },
                { name: 'Doe', age: '25' },
            ];

            expect(csvToJson(csvString)).toEqual(expectedJson);
        });

        test('should handle missing values', () => {
            const csvString = 'name,age\nJohn,30\nDoe';
            const expectedJson = [{ name: 'John', age: '30' }, { name: 'Doe' }];

            expect(csvToJson(csvString)).toEqual(expectedJson);
        });

        test('should handle empty CSV', () => {
            const csvString = '';
            const expectedJson: object[] = [];

            expect(csvToJson(csvString)).toEqual(expectedJson);
        });

        test('should handle CSV with only headers', () => {
            const csvString = 'name,age';
            const expectedJson: object[] = [];

            expect(csvToJson(csvString)).toEqual(expectedJson);
        });
    });
});
