import { describe, expect, test } from 'vitest';

import { formatDateYYYYMMDD, latestDate } from '@/utils/date';

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
});
