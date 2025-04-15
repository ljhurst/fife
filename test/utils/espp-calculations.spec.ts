import { describe, expect, test, vi } from 'vitest';

import { ESPPTaxOutcome } from '@/domain/espp/espp-tax-outcome';
import { loadESPPPurchasesTaxes, updateMarketDependentValues } from '@/utils/espp-calculations';
import type { ESPPPurchaseTaxes } from '@/utils/espp-calculations';

vi.mock('@/data/espp/purchases.json', () => {
    return {
      default: [
            {
                grantDate: new Date('2022-10-01'),
                purchaseDate: new Date('2023-03-31'),
                offerStartPrice: 83.12,
                offerEndPrice: 120.10,
                purchasePrice: 70.65,
                shares: 96.5303,
            },
            {
                grantDate: new Date('2024-10-01'),
                purchaseDate: new Date('2025-03-31'),
                offerStartPrice: 89.13,
                offerEndPrice: 63.48,
                purchasePrice: 53.96,
                shares: 149.85,
            },
        ],
    };
});

function guardPurchaseTaxTestObject(testPurchase: ESPPPurchaseTaxes | undefined): ESPPPurchaseTaxes {
    if (!testPurchase || !testPurchase.offerEndPrice) {
        throw new Error('Data needed for test is not available');
    }

    return testPurchase;
}

describe('espp-calculations', () => {
    describe('updateMarketDependentValues', () => {
        test('should calculate cases where offering start price is less than offering end price and market price is flat', async () => {
            const purchasesTaxes = loadESPPPurchasesTaxes();
            const testPurchase = guardPurchaseTaxTestObject(purchasesTaxes[0]);

            const marketPrice = testPurchase.offerEndPrice;

            updateMarketDependentValues(purchasesTaxes, marketPrice);

            if (!testPurchase.dispositions) {
                throw new Error('Dispositions should not be undefined');
            }

            expect(testPurchase.purchaseMarketPrice).toBe(testPurchase.offerStartPrice);
            expect(testPurchase.discountAmount).toBeCloseTo(4773.42, 2);
            expect(testPurchase.gain).toBe(0);
            expect(testPurchase.dispositions.disqualifyingSTCG.taxes).toBeCloseTo(1145.62, 2);
            expect(testPurchase.dispositions.disqualifyingSTCG.outcome).toBe(ESPPTaxOutcome.BETTER);
            expect(testPurchase.dispositions.disqualifyingLTCG.taxes).toBeCloseTo(1145.62, 2);
            expect(testPurchase.dispositions.disqualifyingLTCG.outcome).toBe(ESPPTaxOutcome.BETTER);
            expect(testPurchase.dispositions.qualifying.taxes).toBeCloseTo(824.33, 2);
            expect(testPurchase.dispositions.qualifying.outcome).toBe(ESPPTaxOutcome.BEST);
        });

        test('should calculate cases where offering start price is less than offering end price and market price is up', async () => {
            const purchasesTaxes = loadESPPPurchasesTaxes();
            const testPurchase = guardPurchaseTaxTestObject(purchasesTaxes[0]);

            const marketPrice = testPurchase.offerEndPrice + 5;

            updateMarketDependentValues(purchasesTaxes, marketPrice);

            if (!testPurchase.dispositions) {
                throw new Error('Dispositions should not be undefined');
            }

            expect(testPurchase.purchaseMarketPrice).toBe(testPurchase.offerStartPrice);
            expect(testPurchase.discountAmount).toBeCloseTo(4773.42, 2);
            expect(testPurchase.gain).toBeCloseTo(482.65, 2);
            expect(testPurchase.dispositions.disqualifyingSTCG.taxes).toBeCloseTo(1261.46, 2);
            expect(testPurchase.dispositions.disqualifyingSTCG.outcome).toBe(ESPPTaxOutcome.GOOD);
            expect(testPurchase.dispositions.disqualifyingLTCG.taxes).toBeCloseTo(1218.02, 2);
            expect(testPurchase.dispositions.disqualifyingLTCG.outcome).toBe(ESPPTaxOutcome.BETTER);
            expect(testPurchase.dispositions.qualifying.taxes).toBeCloseTo(896.73, 2);
            expect(testPurchase.dispositions.qualifying.outcome).toBe(ESPPTaxOutcome.BEST);
        });

        test('should calculate cases where offering start price is less than offering end price and market price is down', async () => {
            const purchasesTaxes = loadESPPPurchasesTaxes();
            const testPurchase = guardPurchaseTaxTestObject(purchasesTaxes[0]);

            const marketPrice = testPurchase.offerEndPrice - 10;

            updateMarketDependentValues(purchasesTaxes, marketPrice);

            if (!testPurchase.dispositions) {
                throw new Error('Dispositions should not be undefined');
            }

            expect(testPurchase.purchaseMarketPrice).toBe(testPurchase.offerStartPrice);
            expect(testPurchase.discountAmount).toBeCloseTo(4773.42, 2);
            expect(testPurchase.gain).toBeCloseTo(-965.30, 2);
            expect(testPurchase.dispositions.disqualifyingSTCG.taxes).toBeCloseTo(913.95, 2);
            expect(testPurchase.dispositions.disqualifyingSTCG.outcome).toBe(ESPPTaxOutcome.BETTER);
            expect(testPurchase.dispositions.disqualifyingLTCG.taxes).toBeCloseTo(913.95, 2);
            expect(testPurchase.dispositions.disqualifyingLTCG.outcome).toBe(ESPPTaxOutcome.BETTER);
            expect(testPurchase.dispositions.qualifying.taxes).toBeCloseTo(679.54, 2);
            expect(testPurchase.dispositions.qualifying.outcome).toBe(ESPPTaxOutcome.BEST);
        });

        test('should calculate cases where offering start price is greater than offering end price and market price is flat', async () => {
            const purchasesTaxes = loadESPPPurchasesTaxes();
            const testPurchase = guardPurchaseTaxTestObject(purchasesTaxes[1]);

            const marketPrice = testPurchase.offerEndPrice;

            updateMarketDependentValues(purchasesTaxes, marketPrice);

            if (!testPurchase.dispositions) {
                throw new Error('Dispositions should not be undefined');
            }

            expect(testPurchase.purchaseMarketPrice).toBe(marketPrice);
            expect(testPurchase.discountAmount).toBeCloseTo(1426.57, 2);
            expect(testPurchase.gain).toBe(0);
            expect(testPurchase.dispositions.disqualifyingSTCG.taxes).toBeCloseTo(342.38, 2);
            expect(testPurchase.dispositions.disqualifyingSTCG.outcome).toBe(ESPPTaxOutcome.BEST);
            expect(testPurchase.dispositions.disqualifyingLTCG.taxes).toBeCloseTo(342.38, 2);
            expect(testPurchase.dispositions.disqualifyingLTCG.outcome).toBe(ESPPTaxOutcome.BEST);
            expect(testPurchase.dispositions.qualifying.taxes).toBeCloseTo(342.38, 2);
            expect(testPurchase.dispositions.qualifying.outcome).toBe(ESPPTaxOutcome.BEST);
        });

        test('should calculate cases where offering start price is greater than offering end price and market price is up', () => {
            const purchasesTaxes = loadESPPPurchasesTaxes();
            const testPurchase = guardPurchaseTaxTestObject(purchasesTaxes[1]);

            const marketPrice = 70.00;

            updateMarketDependentValues(purchasesTaxes, marketPrice);

            if (!testPurchase.dispositions) {
                throw new Error('Dispositions should not be undefined');
            }

            expect(testPurchase.purchaseMarketPrice).toBe(testPurchase.offerEndPrice);
            expect(testPurchase.discountAmount).toBeCloseTo(1426.57, 2);
            expect(testPurchase.gain).toBeCloseTo(977.02, 2);
            expect(testPurchase.dispositions.disqualifyingSTCG.taxes).toBeCloseTo(576.86, 2);
            expect(testPurchase.dispositions.disqualifyingSTCG.outcome).toBe(ESPPTaxOutcome.GOOD);
            expect(testPurchase.dispositions.disqualifyingLTCG.taxes).toBeCloseTo(488.93, 2);
            expect(testPurchase.dispositions.disqualifyingLTCG.outcome).toBe(ESPPTaxOutcome.BEST);
            expect(testPurchase.dispositions.qualifying.taxes).toBeCloseTo(540.85, 2);
            expect(testPurchase.dispositions.qualifying.outcome).toBe(ESPPTaxOutcome.BETTER);
        });

        test('should calculate cases where offering start price is greater than offering end price and market price is down', () => {
            const purchasesTaxes = loadESPPPurchasesTaxes();
            const testPurchase = guardPurchaseTaxTestObject(purchasesTaxes[1]);

            const marketPrice = testPurchase.offerEndPrice - 5;

            updateMarketDependentValues(purchasesTaxes, marketPrice);

            if (!testPurchase.dispositions) {
                throw new Error('Dispositions should not be undefined');
            }

            expect(testPurchase.purchaseMarketPrice).toBe(testPurchase.offerEndPrice);
            expect(testPurchase.discountAmount).toBeCloseTo(1426.57, 2);
            expect(testPurchase.gain).toBeCloseTo(-749.25, 2);
            expect(testPurchase.dispositions.disqualifyingSTCG.taxes).toBeCloseTo(162.56, 2);
            expect(testPurchase.dispositions.disqualifyingSTCG.outcome).toBe(ESPPTaxOutcome.BEST);
            expect(testPurchase.dispositions.disqualifyingLTCG.taxes).toBeCloseTo(162.56, 2);
            expect(testPurchase.dispositions.disqualifyingLTCG.outcome).toBe(ESPPTaxOutcome.BEST);
            expect(testPurchase.dispositions.qualifying.taxes).toBeCloseTo(162.56, 2);
            expect(testPurchase.dispositions.qualifying.outcome).toBe(ESPPTaxOutcome.BEST);
        });
    });
});
