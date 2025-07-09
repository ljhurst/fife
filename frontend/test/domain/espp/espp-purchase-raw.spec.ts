import { describe, it, expect } from 'vitest';

import {
    ESPP_PURCHASE_REQUIRED_FIELDS,
    createESPPPurchaseRaw,
    isESPPPurchaseRawValid,
    type ESPPPurchaseRaw,
} from '@/domain/espp/espp-purchase-raw';

describe('espp-purchase-raw', () => {
    describe('createESPPPurchaseRaw', () => {
        it('should create an empty ESPPPurchaseRaw object', () => {
            const result = createESPPPurchaseRaw();

            expect(result).toEqual({
                grantDate: '',
                purchaseDate: '',
                offerStartPrice: '',
                offerEndPrice: '',
                purchasePrice: '',
                shares: '',
            });
        });
    });

    describe('isESPPPurchaseRawValid', () => {
        it('should return false for an empty purchase object', () => {
            const emptyPurchase = createESPPPurchaseRaw();

            expect(isESPPPurchaseRawValid(emptyPurchase)).toBe(false);
        });

        it('should return false if any required field is empty', () => {
            const validPurchase: ESPPPurchaseRaw = {
                grantDate: '2023-01-01',
                purchaseDate: '2023-06-30',
                offerStartPrice: '150.00',
                offerEndPrice: '160.00',
                purchasePrice: '136.00',
                shares: '10',
            };

            // Test each field individually
            for (const field of ESPP_PURCHASE_REQUIRED_FIELDS) {
                const invalidPurchase = { ...validPurchase };
                invalidPurchase[field] = '';

                expect(isESPPPurchaseRawValid(invalidPurchase)).toBe(false);
            }
        });

        it('should return false if any required field contains only whitespace', () => {
            const validPurchase: ESPPPurchaseRaw = {
                grantDate: '2023-01-01',
                purchaseDate: '2023-06-30',
                offerStartPrice: '150.00',
                offerEndPrice: '160.00',
                purchasePrice: '136.00',
                shares: '10',
            };

            // Test each field individually
            for (const field of ESPP_PURCHASE_REQUIRED_FIELDS) {
                const invalidPurchase = { ...validPurchase };
                invalidPurchase[field] = '   ';

                expect(isESPPPurchaseRawValid(invalidPurchase)).toBe(false);
            }
        });

        it('should return true if all required fields are non-empty', () => {
            const validPurchase: ESPPPurchaseRaw = {
                grantDate: '2023-01-01',
                purchaseDate: '2023-06-30',
                offerStartPrice: '150.00',
                offerEndPrice: '160.00',
                purchasePrice: '136.00',
                shares: '10',
            };

            expect(isESPPPurchaseRawValid(validPurchase)).toBe(true);
        });
    });

    describe('ESPP_PURCHASE_REQUIRED_FIELDS', () => {
        it('should contain all the required fields', () => {
            expect(ESPP_PURCHASE_REQUIRED_FIELDS).toEqual([
                'grantDate',
                'purchaseDate',
                'offerStartPrice',
                'offerEndPrice',
                'purchasePrice',
                'shares',
            ]);
        });
    });
});
