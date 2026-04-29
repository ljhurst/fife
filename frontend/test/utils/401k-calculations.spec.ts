import { describe, test, expect } from 'vitest';

import {
    isMaximize401kInputsReady,
    calculate401kContributionPercent,
    calculate401kBreakdown,
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

    describe('calculate401kBreakdown', () => {
        test('should calculate all breakdown values correctly', () => {
            const input = {
                annualSalary: 60000,
                annualContributionLimit: 19500,
                contributionsSoFar: 5000,
                paychecksPerYear: 26,
                paychecksRemaining: 10,
            };

            const breakdown = calculate401kBreakdown(input);

            expect(breakdown.remainingContribution).toBe(14500);
            expect(breakdown.contributionPerPaycheck).toBe(1450);
            expect(breakdown.salaryPerPaycheck).toBeCloseTo(2307.69, 2);
            expect(breakdown.rawPercentage).toBeCloseTo(62.83, 2);
            expect(breakdown.ceiledPercentage).toBe(63);
            expect(breakdown.totalWithCeiledPercent).toBeCloseTo(19538.46, 2);
        });

        test('should handle edge case with no remaining paychecks', () => {
            const input = {
                annualSalary: 60000,
                annualContributionLimit: 19500,
                contributionsSoFar: 5000,
                paychecksPerYear: 26,
                paychecksRemaining: 1,
            };

            const breakdown = calculate401kBreakdown(input);

            expect(breakdown.remainingContribution).toBe(14500);
            expect(breakdown.contributionPerPaycheck).toBe(14500);
        });
    });
});
