import { describe, expect, test } from 'vitest';

import {
    formatDateYYYYMMDD,
    latestDate,
    firstDayOfNextYearFromDate,
    weeksBewteenDates,
} from '@/utils/date';

describe('date', () => {
    describe('formatDateYYYYMMDD', () => {
        test('should format date to YYYY-MM-DD', () => {
            const date = new Date('2023-03-31T00:00:00Z');
            const formattedDate = formatDateYYYYMMDD(date);
            expect(formattedDate).toBe('2023-03-31');
        });
    });

    describe('latestDate', () => {
        test('should return the latest date', () => {
            const date1 = new Date('2023-03-31T00:00:00Z');
            const date2 = new Date('2024-03-31T00:00:00Z');
            const latest = latestDate(date1, date2);
            expect(latest).toEqual(date2);
        });
    });

    describe('firstDayOfNextYearFromDate', () => {
        test('should return the first day of the next year', () => {
            const date = new Date('2023-03-31T00:00:00Z');
            const nextYearFirstDay = new Date('2024-01-01T08:00:00Z');
            expect(firstDayOfNextYearFromDate(date)).toEqual(nextYearFirstDay);
        });
    });

    describe('weeksBewteenDates', () => {
        test('should return the number of weeks between two dates', () => {
            const date1 = new Date('2023-03-31T00:00:00Z');
            const date2 = new Date('2024-03-31T00:00:00Z');
            const weeks = weeksBewteenDates(date1, date2);
            expect(weeks).toBeCloseTo(52.3, 0.1);
        });
    });
});
