import { describe, expect, test } from 'vitest';

import { formatUSD, round } from '@/utils/number';

describe('number', () => {
    describe('formatUSD', () => {
        test('should format positive number to USD', () => {
            const value = 1234.5611;
            const formattedValue = formatUSD(value);
            expect(formattedValue).toBe('$1234.56');
        });

        test('should format zero to USD', () => {
            const value = 0;
            const formattedValue = formatUSD(value);
            expect(formattedValue).toBe('$0.00');
        });

        test('should format negative number to USD', () => {
            const value = -1234.5611;
            const formattedValue = formatUSD(value);
            expect(formattedValue).toBe('-$1234.56');
        });

        test('should format NaN to empty string', () => {
            const value = NaN;
            const formattedValue = formatUSD(value);
            expect(formattedValue).toBe('');
        });
    });

    describe('round', () => {
        test('should round number to specified precision', () => {
            const value = 1234.56789;
            const precision = 2;
            const roundedValue = round(value, precision);
            expect(roundedValue).toBe(1234.57);
        });

        test('should round number to zero precision', () => {
            const value = 1234.56789;
            const precision = 0;
            const roundedValue = round(value, precision);
            expect(roundedValue).toBe(1235);
        });
    });
});
