import esppPurchases from '@/data/espp/purchases.json';
import { addYears, latestDate } from '@/utils/date';

const ESPP_DISCOUNT = 0.15;
const ORDINARY_INCOME_TAX_RATE = 0.24;
const LONG_TERM_CAPITAL_GAINS_TAX_RATE = 0.15;

interface ESPPPurchase {
    grantDate: Date;
    purchaseDate: Date;
    offerStartPrice: number;
    offerEndPrice: number;
    purchasePrice: number;
    shares: number;
}

interface ESPPPurchaseTaxes extends ESPPPurchase {
    purchaseMarketPrice: number;
    discountAmount: number;
    longTermGainsDate: Date;
    qualifyingDispositionDate: Date;
    gain?: number;
    disqualifyingDispositionSTCGTaxes?: number;
    disqualifyingDispositionLTGCTaxes?: number;
    qualifyingDispositionTaxes?: number;
}

function loadESPPPurchasesTaxes(): ESPPPurchaseTaxes[] {
    const esppPurchases = _loadESPPPurchases();

    return esppPurchases.map(_createESPPPurchaseTaxes);
}

function updateMarketDependentValues(purchases: ESPPPurchaseTaxes[], marketPrice: number): void {
    purchases.forEach((purchase) => {
        purchase.gain = _calculateGain(purchase.offerEndPrice, marketPrice, purchase.shares);
        purchase.disqualifyingDispositionSTCGTaxes = _calculateDisqualifyingDispositionSTCGTaxes(
            purchase.discountAmount,
            purchase.gain,
        );
        purchase.disqualifyingDispositionLTGCTaxes = _calculateDisqualifyingDispositionLTGCTaxes(
            purchase.discountAmount,
            purchase.gain,
        );
        purchase.qualifyingDispositionTaxes = _calculateQualifyingDispositionTaxes(
            purchase.offerStartPrice,
            purchase.purchasePrice,
            marketPrice,
            purchase.shares,
        );
    });
}

export { loadESPPPurchasesTaxes, updateMarketDependentValues };
export type { ESPPPurchaseTaxes };

function _loadESPPPurchases(): ESPPPurchase[] {
    return esppPurchases.map((purchase) => ({
        ...purchase,
        grantDate: new Date(purchase.grantDate),
        purchaseDate: new Date(purchase.purchaseDate),
    }));
}

function _createESPPPurchaseTaxes(purchase: ESPPPurchase): ESPPPurchaseTaxes {
    const purchaseMarketPrice = _calculatePurchaseMarketPrice(
        purchase.offerStartPrice,
        purchase.offerEndPrice,
    );
    const discountAmount = _calculateDiscountAmount(
        purchase.offerEndPrice,
        purchase.purchasePrice,
        purchase.shares,
    );
    const longTermGainsDate = _calculateLongTermGainsDate(purchase.purchaseDate);
    const qualifyingDispositionDate = _calculateQualifyingDispositionDate(
        purchase.grantDate,
        purchase.purchaseDate,
    );

    return {
        ...purchase,
        purchaseMarketPrice,
        discountAmount,
        longTermGainsDate,
        qualifyingDispositionDate,
    };
}

function _calculatePurchaseMarketPrice(offerStartPrice: number, offerEndPrice: number): number {
    return Math.min(offerStartPrice, offerEndPrice);
}

function _calculateDiscountAmount(
    purchaseMarketPrice: number,
    purchasePrice: number,
    shares: number,
): number {
    const discountPerShare = purchaseMarketPrice - purchasePrice;

    return discountPerShare * shares;
}

function _calculateGain(offerEndPrice: number, marketPrice: number, shares: number): number {
    return (marketPrice - offerEndPrice) * shares;
}

function _calculateDisqualifyingDispositionSTCGTaxes(discountAmount: number, gain: number): number {
    const discountTaxes = discountAmount * ORDINARY_INCOME_TAX_RATE;
    const gainTaxes = gain * ORDINARY_INCOME_TAX_RATE;

    return discountTaxes + gainTaxes;
}

function _calculateDisqualifyingDispositionLTGCTaxes(discountAmount: number, gain: number): number {
    let gainTaxes = 0;

    if (gain < 0) {
        discountAmount = discountAmount + gain;
    } else {
        gainTaxes = gain * LONG_TERM_CAPITAL_GAINS_TAX_RATE;
    }

    const discountTaxes = discountAmount * ORDINARY_INCOME_TAX_RATE;

    return discountTaxes + gainTaxes;
}

function _calculateQualifyingDispositionTaxes(
    offerStartPrice: number,
    purchasePrice: number,
    marketPrice: number,
    shares: number,
): number {
    const qualifyingGain = (marketPrice - purchasePrice) * shares;
    const qualifyingDiscount = offerStartPrice * ESPP_DISCOUNT * shares;

    const smaller = Math.min(qualifyingDiscount, qualifyingGain);

    const ordinaryIncomeTaxes = smaller * ORDINARY_INCOME_TAX_RATE;
    const longTermCapitalGainsTaxes = (qualifyingGain - smaller) * LONG_TERM_CAPITAL_GAINS_TAX_RATE;

    return ordinaryIncomeTaxes + longTermCapitalGainsTaxes;
}

function _calculateLongTermGainsDate(purchaseDate: Date): Date {
    return addYears(purchaseDate, 1);
}

function _calculateQualifyingDispositionDate(grantDate: Date, purchaseDate: Date): Date {
    const twoYearsAfterGrantDate = addYears(grantDate, 2);
    const oneYearAfterPurchaseDate = addYears(purchaseDate, 1);

    return latestDate(twoYearsAfterGrantDate, oneYearAfterPurchaseDate);
}
