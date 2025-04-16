import esppPurchases from '@/data/espp/purchases.json';
import { ESPPTaxOutcome } from '@/domain/espp/espp-tax-outcome';
import { INFINITE_DATE, addYears, latestDate } from '@/utils/date';

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

interface ESPPDisposition {
    taxes: number;
    outcome: ESPPTaxOutcome;
    endDate: Date;
}

interface ESPPDispositions {
    disqualifyingSTCG: ESPPDisposition;
    disqualifyingLTCG: ESPPDisposition;
    qualifying: ESPPDisposition;
}

interface ESPPPurchaseTaxes extends ESPPPurchase {
    purchaseMarketPrice: number;
    discountAmount: number;
    gain?: number;
    dispositions?: ESPPDispositions;
}

function loadESPPPurchasesTaxes(): ESPPPurchaseTaxes[] {
    const esppPurchases = _loadESPPPurchases();

    return esppPurchases.map(_createESPPPurchaseTaxes);
}

function updateMarketDependentValues(purchases: ESPPPurchaseTaxes[], marketPrice: number): void {
    purchases.forEach((purchase) => {
        purchase.gain = _calculateGain(purchase.offerEndPrice, marketPrice, purchase.shares);

        const disqualifyingDispositionSTCG = _createDisqualifyingDispositionSTCG(
            purchase,
            marketPrice,
        );
        const disqualifyingDispositionLTCG = _createDisqualifyingDispositionLTCG(
            purchase,
            marketPrice,
        );
        const qualifyingDisposition = _createQualifyingDisposition(purchase, marketPrice);

        const dispositions = {
            disqualifyingSTCG: disqualifyingDispositionSTCG,
            disqualifyingLTCG: disqualifyingDispositionLTCG,
            qualifying: qualifyingDisposition,
        };

        purchase.dispositions = dispositions;
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

    return {
        ...purchase,
        purchaseMarketPrice,
        discountAmount,
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

function _createDisqualifyingDispositionSTCG(
    purchase: ESPPPurchaseTaxes,
    marketPrice: number,
): ESPPDisposition {
    const taxes = _calculateDisqualifyingDispositionSTCGTaxes(purchase);
    const outcome = _calculateDisqualifyingDispositionSTCGOutcome(purchase, marketPrice);
    const endDate = _calculateLongTermGainsDate(purchase.purchaseDate);

    return {
        taxes: taxes,
        outcome: outcome,
        endDate: endDate,
    };
}

function _calculateDisqualifyingDispositionSTCGTaxes(purchase: ESPPPurchaseTaxes): number {
    const gain = _guardGain(purchase.gain);

    const discountTaxes = purchase.discountAmount * ORDINARY_INCOME_TAX_RATE;
    const gainTaxes = gain * ORDINARY_INCOME_TAX_RATE;

    return discountTaxes + gainTaxes;
}

function _calculateDisqualifyingDispositionSTCGOutcome(
    purchase: ESPPPurchaseTaxes,
    marketPrice: number,
): ESPPTaxOutcome {
    if (purchase.offerEndPrice > purchase.offerStartPrice) {
        if (marketPrice > purchase.offerEndPrice) {
            return ESPPTaxOutcome.GOOD;
        } else if (marketPrice < purchase.offerStartPrice) {
            return ESPPTaxOutcome.BEST;
        }

        return ESPPTaxOutcome.BETTER;
    } else if (purchase.offerEndPrice < purchase.offerStartPrice) {
        if (marketPrice > purchase.offerEndPrice) {
            if (marketPrice <= purchase.offerStartPrice * ESPP_DISCOUNT + purchase.purchasePrice) {
                return ESPPTaxOutcome.BETTER;
            }

            return ESPPTaxOutcome.GOOD;
        }
    }

    return ESPPTaxOutcome.BEST;
}

function _createDisqualifyingDispositionLTCG(
    purchase: ESPPPurchaseTaxes,
    marketPrice: number,
): ESPPDisposition {
    const taxes = _calculateDisqualifyingDispositionLTCGTaxes(purchase);
    const outcome = _calculateDisqualifyingDispositionLTCGOutcome(purchase, marketPrice);
    const endDate = _calculateQualifyingDispositionDate(purchase.grantDate, purchase.purchaseDate);

    return {
        taxes: taxes,
        outcome: outcome,
        endDate: endDate,
    };
}

function _calculateDisqualifyingDispositionLTCGTaxes(purchase: ESPPPurchaseTaxes): number {
    const gain = _guardGain(purchase.gain);

    let gainTaxes = 0;
    let discountAmount = purchase.discountAmount;

    if (gain < 0) {
        discountAmount = purchase.discountAmount + gain;
    } else {
        gainTaxes = gain * LONG_TERM_CAPITAL_GAINS_TAX_RATE;
    }

    const discountTaxes = discountAmount * ORDINARY_INCOME_TAX_RATE;

    return discountTaxes + gainTaxes;
}

function _calculateDisqualifyingDispositionLTCGOutcome(
    purchase: ESPPPurchaseTaxes,
    marketPrice: number,
): ESPPTaxOutcome {
    if (purchase.offerEndPrice > purchase.offerStartPrice) {
        if (marketPrice < purchase.offerStartPrice) {
            return ESPPTaxOutcome.BEST;
        }

        return ESPPTaxOutcome.BETTER;
    } else if (purchase.offerEndPrice < purchase.offerStartPrice) {
        return ESPPTaxOutcome.BEST;
    }

    return ESPPTaxOutcome.BEST;
}

function _createQualifyingDisposition(
    purchase: ESPPPurchaseTaxes,
    marketPrice: number,
): ESPPDisposition {
    const taxes = _calculateQualifyingDispositionTaxes(
        purchase.offerStartPrice,
        purchase.purchasePrice,
        marketPrice,
        purchase.shares,
    );
    const outcome = _calculateQualifyingDispositionOutcome(purchase, marketPrice);
    const endDate = INFINITE_DATE;

    return {
        taxes: taxes,
        outcome: outcome,
        endDate: endDate,
    };
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

function _calculateQualifyingDispositionOutcome(
    purchase: ESPPPurchaseTaxes,
    marketPrice: number,
): ESPPTaxOutcome {
    if (purchase.offerEndPrice < purchase.offerStartPrice && marketPrice > purchase.offerEndPrice) {
        return ESPPTaxOutcome.BETTER;
    }

    return ESPPTaxOutcome.BEST;
}

function _guardGain(gain: number | undefined): number {
    if (gain === undefined) {
        return NaN;
    }

    return gain;
}

function _calculateLongTermGainsDate(purchaseDate: Date): Date {
    return addYears(purchaseDate, 1);
}

function _calculateQualifyingDispositionDate(grantDate: Date, purchaseDate: Date): Date {
    const twoYearsAfterGrantDate = addYears(grantDate, 2);
    const oneYearAfterPurchaseDate = addYears(purchaseDate, 1);

    return latestDate(twoYearsAfterGrantDate, oneYearAfterPurchaseDate);
}
