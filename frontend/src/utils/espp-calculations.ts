import { ESPPDispositionName } from '@/domain/espp/espp-disposition-name';
import { type ESPPPurchase, type ESPPSale } from '@/domain/espp/espp-purchase-parsed';
import { type ESPPPurchaseRaw } from '@/domain/espp/espp-purchase-raw';
import { ESPPTaxOutcome } from '@/domain/espp/espp-tax-outcome';
import { INFINITE_DATE, addYears, latestDate } from '@/utils/date';

const ESPP_DISCOUNT = 0.15;
const ORDINARY_INCOME_TAX_RATE = 0.24;
const LONG_TERM_CAPITAL_GAINS_TAX_RATE = 0.15;

interface ESPPPurchaseGains {
    discountAmount: number;
    market?: number;
    total?: number;
}

interface ESPPSaleGains {
    discountAmount: number;
    market: number;
    total: number;
}

interface ESPPTaxes {
    ordinaryIncome: number;
    stcg: number;
    ltcg: number;
    total: number;
}

interface ESPPDisposition {
    name: ESPPDispositionName;
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
    gains: ESPPPurchaseGains;
    dispositions?: ESPPDispositions;
}

interface ESPPSaleTaxes extends ESPPSale {
    purchase: ESPPPurchaseTaxes;
    gains: ESPPSaleGains;
    disposition: ESPPDisposition;
}

interface ESPPPurchasesAndSalesTaxes {
    purchases: ESPPPurchaseTaxes[];
    sales: ESPPSaleTaxes[];
}

function loadESPPPurchasesTaxes(esppPurchasesRaw: ESPPPurchaseRaw[]): ESPPPurchasesAndSalesTaxes {
    const esppPurchases = _loadESPPPurchases(esppPurchasesRaw);

    const purchases = esppPurchases.map(_createESPPPurchaseTaxes);

    return {
        purchases,
        sales: purchases.map(_createESPPSaleTaxes).flat(),
    };
}

function updateMarketDependentValues(
    purchases: ESPPPurchaseTaxes[],
    marketPrice: number,
): ESPPPurchaseTaxes[] {
    return [...purchases].map((purchase) => {
        purchase.gains.market = _calculateMarketGain(
            purchase.offerEndPrice,
            marketPrice,
            purchase.shares,
        );
        purchase.gains.total = purchase.gains.discountAmount + purchase.gains.market;

        const disqualifyingDispositionSTCG = _createDisqualifyingDispositionSTCG(
            purchase,
            purchase.gains,
            marketPrice,
        );
        const disqualifyingDispositionLTCG = _createDisqualifyingDispositionLTCG(
            purchase,
            purchase.gains,
            marketPrice,
        );
        const qualifyingDisposition = _createQualifyingDisposition(
            purchase,
            marketPrice,
            purchase.shares,
        );

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
        delete purchase.gains.market;
        delete purchase.gains.total;
        delete purchase.dispositions;

        return purchase;
    });
}

export { clearMarketDependentValues, loadESPPPurchasesTaxes, updateMarketDependentValues };
export type {
    ESPPDisposition,
    ESPPDispositions,
    ESPPPurchaseGains,
    ESPPPurchaseTaxes,
    ESPPSaleGains,
    ESPPSaleTaxes,
    ESPPTaxes,
};

function _loadESPPPurchases(esppPurchasesRaw: ESPPPurchaseRaw[]): ESPPPurchase[] {
    return esppPurchasesRaw.map((purchase) => ({
        id: purchase.id,
        grantDate: new Date(purchase.grantDate),
        purchaseDate: new Date(purchase.purchaseDate),
        offerStartPrice: Number(purchase.offerStartPrice),
        offerEndPrice: Number(purchase.offerEndPrice),
        purchasePrice: Number(purchase.purchasePrice),
        shares: Number(purchase.shares),
        sales: [],
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
        gains: {
            discountAmount,
        },
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
    gains: ESPPPurchaseGains | ESPPSaleGains,
    marketPrice: number,
): ESPPDisposition {
    const taxes = _calculateDisqualifyingDispositionSTCGTaxes(gains);
    const outcome = _calculateDisqualifyingDispositionSTCGOutcome(purchase, marketPrice);
    const endDate = _calculateLongTermGainsDate(purchase.purchaseDate);

    return {
        name: ESPPDispositionName.DISQUALIFYING_STCG,
        taxes: taxes,
        outcome: outcome,
        endDate: endDate,
    };
}

function _calculateDisqualifyingDispositionSTCGTaxes(
    gains: ESPPPurchaseGains | ESPPSaleGains,
): ESPPTaxes {
    const marketGain = _guardMarketGain(gains.market);

    const discountTaxes = gains.discountAmount * ORDINARY_INCOME_TAX_RATE;
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
    gains: ESPPPurchaseGains | ESPPSaleGains,
    marketPrice: number,
): ESPPDisposition {
    const taxes = _calculateDisqualifyingDispositionLTCGTaxes(gains);
    const outcome = _calculateDisqualifyingDispositionLTCGOutcome(purchase, marketPrice);
    const endDate = _calculateQualifyingDispositionDate(purchase.grantDate, purchase.purchaseDate);

    return {
        name: ESPPDispositionName.DISQUALIFYING_LTCG,
        taxes: taxes,
        outcome: outcome,
        endDate: endDate,
    };
}

function _calculateDisqualifyingDispositionLTCGTaxes(
    gains: ESPPPurchaseGains | ESPPSaleGains,
): ESPPTaxes {
    const marketGain = _guardMarketGain(gains.market);

    let marketGainTaxes = 0;

    const discountTaxes = gains.discountAmount * ORDINARY_INCOME_TAX_RATE;

    if (marketGain >= 0) {
        marketGainTaxes = marketGain * LONG_TERM_CAPITAL_GAINS_TAX_RATE;
    } else {
        marketGainTaxes = marketGain * ORDINARY_INCOME_TAX_RATE;
    }

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
    shares: number,
): ESPPDisposition {
    const taxes = _calculateQualifyingDispositionTaxes(
        purchase.offerStartPrice,
        purchase.purchasePrice,
        marketPrice,
        shares,
    );
    const outcome = _calculateQualifyingDispositionOutcome(purchase, marketPrice);
    const endDate = INFINITE_DATE;

    return {
        name: ESPPDispositionName.QUALIFYING,
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

function _createESPPSaleTaxes(purchase: ESPPPurchaseTaxes): ESPPSaleTaxes[] {
    return purchase.sales.map((sale) => {
        const saleFraction = sale.shares / purchase.shares;

        const discountAmount = purchase.gains.discountAmount * saleFraction;
        const marketGain = (sale.price - purchase.offerEndPrice) * sale.shares;
        const totalGain = discountAmount + marketGain;

        const gains = {
            discountAmount,
            market: marketGain,
            total: totalGain,
        };

        const disposition = _calcSaleDisposition(purchase, sale, gains);

        return {
            ...sale,
            purchase,
            gains,
            disposition,
        };
    });
}

function _calcSaleDisposition(
    purchase: ESPPPurchaseTaxes,
    sale: ESPPSale,
    gains: ESPPSaleGains,
): ESPPDisposition {
    if (sale.date < _calculateLongTermGainsDate(purchase.purchaseDate)) {
        return _createDisqualifyingDispositionSTCG(purchase, gains, sale.price);
    }

    if (
        sale.date < _calculateQualifyingDispositionDate(purchase.grantDate, purchase.purchaseDate)
    ) {
        return _createDisqualifyingDispositionLTCG(purchase, gains, sale.price);
    }

    return _createQualifyingDisposition(purchase, sale.price, sale.shares);
}
