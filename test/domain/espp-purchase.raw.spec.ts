import { describe, test, expect } from 'vitest';

import { ESPP_PURCHASE_REQUIRED_FIELDS } from '@/domain/espp/espp-purchase-raw';
import type { ESPPPurchaseRaw } from '@/domain/espp/espp-purchase-raw';

describe('espp-purchase-raw', () => {
    describe('ESPP_PURCHASE_REQUIRED_FIELDS', () => {
        test('should create a valid ESPPPurchaseRaw', () => {
            const testObject = ESPP_PURCHASE_REQUIRED_FIELDS.reduce((obj, field) => {
                return { ...obj, [field]: '' };
            }, {}) as ESPPPurchaseRaw;

            expect(testObject).toBeDefined();
        });
    });
});
