import type { ESPPPurchaseRaw } from '@/domain/espp/espp-purchase-raw';
import { ESPPTaxOutcome } from '@/domain/espp/espp-tax-outcome';
import { INFINITE_DATE, addYears, latestDate } from '@/utils/date';

const ESPP_DISCOUNT = 0.15;
const ORDINARY_INCOME_TAX_RATE = 0.24;
const LONG_TERM_CAPITAL_GAINS_TAX_RATE = 0.15;

interface ESPPPurchase {
    id: string;
    grantDate: Date;
    purchaseDate: Date;
    offerStartPrice: number;
    offerEndPrice: number;
    purchasePrice: number;
    shares: number;
}

interface ESPPTaxes {
    ordinaryIncome: number;
    stcg: number;
    ltcg: number;
    total: number;
}

interface ESPPDisposition {
    taxes: ESPPTaxes;
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
    marketGain?: number;
    totalGain?: number;
    dispositions?: ESPPDispositions;
}

function loadESPPPurchasesTaxes(esppPurchasesRaw: ESPPPurchaseRaw[]): ESPPPurchaseTaxes[] {
    const esppPurchases = _loadESPPPurchases(esppPurchasesRaw);

    return esppPurchases.map(_createESPPPurchaseTaxes);
}

function updateMarketDependentValues(
    purchases: ESPPPurchaseTaxes[],
    marketPrice: number,
): ESPPPurchaseTaxes[] {
    return [...purchases].map((purchase) => {
        purchase.marketGain = _calculateMarketGain(
            purchase.offerEndPrice,
            marketPrice,
            purchase.shares,
        );
        purchase.totalGain = purchase.discountAmount + purchase.marketGain;

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

        return purchase;
    });
}

function clearMarketDependentValues(purchases: ESPPPurchaseTaxes[]): ESPPPurchaseTaxes[] {
    return [...purchases].map((purchase) => {
        delete purchase.marketGain;
        delete purchase.totalGain;
        delete purchase.dispositions;

        return purchase;
    });
}

export { clearMarketDependentValues, loadESPPPurchasesTaxes, updateMarketDependentValues };
export type { ESPPDisposition, ESPPDispositions, ESPPPurchaseTaxes, ESPPTaxes };

function _loadESPPPurchases(esppPurchasesRaw: ESPPPurchaseRaw[]): ESPPPurchase[] {
    return esppPurchasesRaw.map((purchase) => ({
        id: purchase.id,
        grantDate: new Date(purchase.grantDate),
        purchaseDate: new Date(purchase.purchaseDate),
        offerStartPrice: Number(purchase.offerStartPrice),
        offerEndPrice: Number(purchase.offerEndPrice),
        purchasePrice: Number(purchase.purchasePrice),
        shares: Number(purchase.shares),
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

function _calculateMarketGain(offerEndPrice: number, marketPrice: number, shares: number): number {
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

function _calculateDisqualifyingDispositionSTCGTaxes(purchase: ESPPPurchaseTaxes): ESPPTaxes {
    const marketGain = _guardMarketGain(purchase.marketGain);

    const discountTaxes = purchase.discountAmount * ORDINARY_INCOME_TAX_RATE;
    const marketGainTaxes = marketGain * ORDINARY_INCOME_TAX_RATE;

    const total = discountTaxes + marketGainTaxes;

    return {
        ordinaryIncome: discountTaxes,
        stcg: marketGainTaxes,
        ltcg: 0,
        total: total,
    };
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

function _calculateDisqualifyingDispositionLTCGTaxes(purchase: ESPPPurchaseTaxes): ESPPTaxes {
    const marketGain = _guardMarketGain(purchase.marketGain);

    let marketGainTaxes = 0;
    let discountAmount = purchase.discountAmount;

    if (marketGain < 0) {
        discountAmount = purchase.discountAmount + marketGain;
    } else {
        marketGainTaxes = marketGain * LONG_TERM_CAPITAL_GAINS_TAX_RATE;
    }

    const discountTaxes = discountAmount * ORDINARY_INCOME_TAX_RATE;

    const total = discountTaxes + marketGainTaxes;

    return {
        ordinaryIncome: discountTaxes,
        stcg: 0,
        ltcg: marketGainTaxes,
        total: total,
    };
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
): ESPPTaxes {
    const qualifyingGain = (marketPrice - purchasePrice) * shares;
    const qualifyingDiscount = offerStartPrice * ESPP_DISCOUNT * shares;

    const smaller = Math.min(qualifyingDiscount, qualifyingGain);

    const ordinaryIncomeTaxes = smaller * ORDINARY_INCOME_TAX_RATE;
    const longTermCapitalGainsTaxes = (qualifyingGain - smaller) * LONG_TERM_CAPITAL_GAINS_TAX_RATE;

    const total = ordinaryIncomeTaxes + longTermCapitalGainsTaxes;

    return {
        ordinaryIncome: ordinaryIncomeTaxes,
        stcg: 0,
        ltcg: longTermCapitalGainsTaxes,
        total: total,
    };
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

function _guardMarketGain(marketGain: number | undefined): number {
    if (marketGain === undefined) {
        return NaN;
    }

    return marketGain;
}

function _calculateLongTermGainsDate(purchaseDate: Date): Date {
    return addYears(purchaseDate, 1);
}

function _calculateQualifyingDispositionDate(grantDate: Date, purchaseDate: Date): Date {
    const twoYearsAfterGrantDate = addYears(grantDate, 2);
    const oneYearAfterPurchaseDate = addYears(purchaseDate, 1);

    return latestDate(twoYearsAfterGrantDate, oneYearAfterPurchaseDate);
}
