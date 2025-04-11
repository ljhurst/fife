import esppPurchases from '@/data/espp/purchases.json';
import { addYears, latestDate } from '@/utils/date';
import { round } from '@/utils/number';

const ESPP_DISCOUNT = 0.15;

interface ESPPPurchase {
    grantDate: Date;
    purchaseDate: Date;
    shares: number;
    purchasePrice: number;
}

interface ESPPPurchaseTaxes extends ESPPPurchase {
    purchaseMarketPrice: number;
    discountAmount: number;
    longTermGainsDate: Date;
    qualifyingDispositionDate: Date;
}

function loadESPPPurchasesTaxes(): ESPPPurchaseTaxes[] {
    const esppPurchases = _loadESPPPurchases();

    return esppPurchases.map(_createESPPPurchaseTaxes);
}

export { loadESPPPurchasesTaxes };
export type { ESPPPurchaseTaxes };

function _loadESPPPurchases(): ESPPPurchase[] {
    return esppPurchases.map((purchase) => ({
        ...purchase,
        grantDate: new Date(purchase.grantDate),
        purchaseDate: new Date(purchase.purchaseDate),
    }));
}

function _createESPPPurchaseTaxes(purchase: ESPPPurchase): ESPPPurchaseTaxes {
    const purchaseMarketPrice = _calcPurchaseMarketPrice(purchase.purchasePrice);
    const discountAmount = _calcDiscountAmount(
        purchaseMarketPrice,
        purchase.purchasePrice,
        purchase.shares,
    );
    const longTermGainsDate = _calcLongTermGainsDate(purchase.purchaseDate);
    const qualifyingDispositionDate = _calcQualifyingDispositionDate(
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

function _calcPurchaseMarketPrice(purchasePrice: number): number {
    const purchaseMarketPrice = purchasePrice / (1 - ESPP_DISCOUNT);
    return round(purchaseMarketPrice, 2);
}

function _calcDiscountAmount(marketPrice: number, purchasePrice: number, shares: number): number {
    const discountPerShare = marketPrice - purchasePrice;
    const discountAmount = discountPerShare * shares;

    return round(discountAmount, 2);
}

function _calcLongTermGainsDate(purchaseDate: Date): Date {
    return addYears(purchaseDate, 1);
}

function _calcQualifyingDispositionDate(grantDate: Date, purchaseDate: Date): Date {
    const twoYearsAfterGrantDate = addYears(grantDate, 2);
    const oneYearAfterPurchaseDate = addYears(purchaseDate, 1);

    return latestDate(twoYearsAfterGrantDate, oneYearAfterPurchaseDate);
}
