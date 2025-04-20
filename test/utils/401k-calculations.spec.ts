import { describe, test, expect } from 'vitest';

import {
    isMaximize401kInputsReady,
    calculate401kContributionPercent,
} from '@/utils/401k-calculations';

describe('401k-calculations', () => {
    describe('isMaximize401kInputsReady', () => {
        test('should return true when all inputs are valid', () => {
            const input = {
                annualSalary: 60000,
                annualContributionLimit: 19500,
                contributionsSoFar: 5000,
                paychecksPerYear: 26,
                paychecksRemaining: 10,
            };

            expect(isMaximize401kInputsReady(input)).toBe(true);
        });

        test('should return false when any input is invalid', () => {
            const input = {
                annualSalary: 60000,
                annualContributionLimit: 19500,
                contributionsSoFar: 5000,
                paychecksPerYear: 26,
                paychecksRemaining: NaN,
            };

            expect(isMaximize401kInputsReady(input)).toBe(false);
        });
    });

    describe('calculate401kContributionPercent', () => {
        test(
            'should calculate the correct contribution percent' +
                'when there are contributions remaining',
            () => {
                const input = {
                    annualSalary: 60000,
                    annualContributionLimit: 19500,
                    contributionsSoFar: 5000,
                    paychecksPerYear: 26,
                    paychecksRemaining: 10,
                };

                expect(calculate401kContributionPercent(input)).toBeCloseTo(62.83, 2);
            },
        );
    });
});
