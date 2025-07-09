import { describe, it, expect } from 'vitest';

import {
    ESPP_PURCHASE_INPUT_REQUIRED_FIELDS,
    createESPPPurchaseInput,
    isESPPPurchaseInputValid,
    type ESPPPurchaseInput,
} from '@/domain/espp/espp-purchase-raw';

describe('espp-purchase-raw', () => {
    describe('createESPPPurchaseInput', () => {
        it('should create an empty ESPPPurchaseInput object', () => {
            const result = createESPPPurchaseInput();

            expect(Object.keys(result)).toEqual(ESPP_PURCHASE_INPUT_REQUIRED_FIELDS);
        });
    });

    describe('isESPPPurchaseInputValid', () => {
        const validPurchase: ESPPPurchaseInput = {
            grantDate: '2023-01-01',
            purchaseDate: '2023-06-30',
            offerStartPrice: '150.00',
            offerEndPrice: '160.00',
            purchasePrice: '136.00',
            shares: '10',
        };

        it('should return false for an empty purchase object', () => {
            const emptyPurchase = createESPPPurchaseInput();

            expect(isESPPPurchaseInputValid(emptyPurchase)).toBe(false);
        });

        it('should return false if any required field is empty', () => {
            for (const field of ESPP_PURCHASE_INPUT_REQUIRED_FIELDS) {
                const invalidPurchase = { ...validPurchase };
                invalidPurchase[field] = '';

                expect(isESPPPurchaseInputValid(invalidPurchase)).toBe(false);
            }
        });

        it('should return false if any required field contains only whitespace', () => {
            for (const field of ESPP_PURCHASE_INPUT_REQUIRED_FIELDS) {
                const invalidPurchase = { ...validPurchase };
                invalidPurchase[field] = '   ';

                expect(isESPPPurchaseInputValid(invalidPurchase)).toBe(false);
            }
        });

        it('should return true if all required fields are non-empty', () => {
            expect(isESPPPurchaseInputValid(validPurchase)).toBe(true);
        });
    });
});
