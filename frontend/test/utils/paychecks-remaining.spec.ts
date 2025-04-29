import { describe, expect, test } from 'vitest';

import {
    isPaychecksRemainingInputsReady,
    calculatePaychecksRemaining,
} from '@/utils/paychecks-remaining';

describe('paychecks-remaining', () => {
    describe('isPaychecksRemainingInputsReady', () => {
        test('should return true if inputs are ready', () => {
            const input = {
                paychecksPerYear: 26,
                knownPaycheckDate: new Date('2023-03-31T00:00:00Z'),
            };
            expect(isPaychecksRemainingInputsReady(input)).toBe(true);
        });

        test('should return false if paychecksPerYear is not provided', () => {
            const input = {
                paychecksPerYear: NaN,
                knownPaycheckDate: new Date('2023-03-31T00:00:00Z'),
            };
            expect(isPaychecksRemainingInputsReady(input)).toBe(false);
        });

        test('should return false if knownPaycheckDate is not provided', () => {
            const input = {
                paychecksPerYear: 26,
                knownPaycheckDate: new Date('1970-01-01T00:00:00Z'),
            };
            expect(isPaychecksRemainingInputsReady(input)).toBe(false);
        });
    });

    describe('calculatePaychecksRemaining', () => {
        test('should calculate paychecks remaining correctly', () => {
            const input = {
                paychecksPerYear: 26,
                knownPaycheckDate: new Date('2025-04-18T00:00:00Z'),
            };
            const expected = 18;
            expect(calculatePaychecksRemaining(input)).toBe(expected);
        });

        test('should handle edge cases correctly', () => {
            const input = {
                paychecksPerYear: 26,
                knownPaycheckDate: new Date('2025-04-17T00:00:00Z'),
            };
            const expected = 19;
            expect(calculatePaychecksRemaining(input)).toBe(expected);
        });
    });
});
