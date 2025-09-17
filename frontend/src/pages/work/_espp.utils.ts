import { ESPPDispositionName } from '@/domain/espp/espp-disposition-name';
import { ESPPTaxOutcome } from '@/domain/espp/espp-tax-outcome';
import { sortArrayOfObjectsByKey } from '@/utils/array';
import { formatDateYYYYMMDD } from '@/utils/date';
import {
    type ESPPDisposition,
    type ESPPDispositions,
    type ESPPPurchaseGains,
    type ESPPPurchaseTaxes,
    type ESPPSaleGains,
    type ESPPSaleTaxes,
    type ESPPTaxes,
} from '@/utils/espp-calculations';
import { formatUSD, round } from '@/utils/number';

interface ESPPDetailsUI {
    label: string;
    amount: string;
}

interface ESPPGainsUI {
    discountAmount: string;
    market: string | undefined;
    total: string | undefined;
    details: ESPPDetailsUI[];
}

interface ESPPTaxesUI {
    ordinaryIncome: string;
    stcg: string;
    ltcg: string;
    total: string;
    details: ESPPDetailsUI[];
}

interface ESPPDispositionUI {
    name: ESPPDispositionName;
    taxes: ESPPTaxesUI;
    outcome: ESPPTaxOutcome;
}

interface ESPPDispositionsUI {
    disqualifyingSTCG: ESPPDispositionUI;
    disqualifyingLTCG: ESPPDispositionUI;
    qualifying: ESPPDispositionUI;
}

interface ESPPUIState {
    isDetailsOpen: boolean;
    isActionsOpen: boolean;
    isDeleting: boolean;
}

interface ESPPPurchaseTaxesUI {
    id: string;
    grantDate: string;
    purchaseDate: string;
    offerStartPrice: string;
    offerEndPrice: string;
    purchasePrice: string;
    shares: string;
    gains: ESPPGainsUI;
    dispositions: ESPPDispositionsUI | undefined;
    uiState: ESPPUIState;
}

interface ESPPSaleTaxesUI {
    id: string;
    date: string;
    price: string;
    shares: string;
    purchase: {
        purchaseDate: string;
        purchasePrice: string;
    };
    gains: ESPPGainsUI;
    disposition: ESPPDispositionUI;
    uiState: ESPPUIState;
}

function convertEsppTaxesToUIState(purchasesTaxes: ESPPPurchaseTaxes[]): ESPPPurchaseTaxesUI[] {
    const purchasesUIState = purchasesTaxes.map((purchase) => {
        return {
            id: purchase.id,
            grantDate: formatDateYYYYMMDD(purchase.grantDate),
            purchaseDate: formatDateYYYYMMDD(purchase.purchaseDate),
            offerStartPrice: formatUSD(purchase.offerStartPrice),
            offerEndPrice: formatUSD(purchase.offerEndPrice),
            purchasePrice: formatUSD(purchase.purchasePrice),
            shares: round(purchase.shares, 4).toString(),
            gains: _convertGainsToUI(purchase.gains),
            dispositions: purchase.dispositions
                ? _convertDisposistionsToUI(purchase.dispositions)
                : undefined,
            uiState: {
                isDetailsOpen: false,
                isActionsOpen: false,
                isDeleting: false,
            },
        };
    });

    return sortArrayOfObjectsByKey(purchasesUIState, 'grantDate');
}

function convertEsppSaleTaxesToUIState(salesTaxes: ESPPSaleTaxes[]): ESPPSaleTaxesUI[] {
    const salesUIState = salesTaxes.map((sale) => {
        return {
            id: sale.id,
            date: formatDateYYYYMMDD(sale.date),
            price: formatUSD(sale.price),
            shares: round(sale.shares, 4).toString(),
            purchase: {
                purchaseDate: formatDateYYYYMMDD(sale.purchase.purchaseDate),
                purchasePrice: formatUSD(sale.purchase.purchasePrice),
            },
            gains: _convertGainsToUI(sale.gains),
            disposition: _convertDisposistionToUI(sale.disposition),
            uiState: {
                isDetailsOpen: false,
                isActionsOpen: false,
                isDeleting: false,
            },
        };
    });

    return sortArrayOfObjectsByKey(salesUIState, 'date');
}

export { convertEsppTaxesToUIState, convertEsppSaleTaxesToUIState };
export type { ESPPPurchaseTaxesUI, ESPPSaleTaxesUI };

function _convertGainsToUI(gains: ESPPPurchaseGains | ESPPSaleGains): ESPPGainsUI {
    return {
        discountAmount: formatUSD(gains.discountAmount),
        market: gains.market !== undefined ? formatUSD(gains.market) : undefined,
        total: gains.total !== undefined ? formatUSD(gains.total) : undefined,
        details: _convertGainsToDetailsUI(gains),
    };
}

function _convertGainsToDetailsUI(gains: ESPPPurchaseGains | ESPPSaleGains): ESPPDetailsUI[] {
    const details: ESPPDetailsUI[] = [];

    if (gains.discountAmount) {
        details.push({
            label: 'Discount',
            amount: formatUSD(gains.discountAmount),
        });
    }

    if (gains.market) {
        details.push({
            label: 'Market',
            amount: formatUSD(gains.market),
        });
    }

    return details;
}

function _convertDisposistionsToUI(dispositions: ESPPDispositions): ESPPDispositionsUI {
    return {
        disqualifyingSTCG: _convertDisposistionToUI(dispositions.disqualifyingSTCG),
        disqualifyingLTCG: _convertDisposistionToUI(dispositions.disqualifyingLTCG),
        qualifying: _convertDisposistionToUI(dispositions.qualifying),
    };
}

function _convertDisposistionToUI(disposition: ESPPDisposition): ESPPDispositionUI {
    return {
        name: disposition.name,
        taxes: _convertTaxestoUI(disposition.taxes),
        outcome: disposition.outcome,
    };
}

function _convertTaxestoUI(taxes: ESPPTaxes): ESPPTaxesUI {
    return {
        ordinaryIncome: formatUSD(taxes.ordinaryIncome),
        stcg: formatUSD(taxes.stcg),
        ltcg: formatUSD(taxes.ltcg),
        total: formatUSD(taxes.total),
        details: _convertTaxestoDetailsUI(taxes),
    };
}

function _convertTaxestoDetailsUI(taxes: ESPPTaxes): ESPPDetailsUI[] {
    const details: ESPPDetailsUI[] = [];

    if (taxes.ordinaryIncome) {
        details.push({
            label: 'Ordinary Income',
            amount: formatUSD(taxes.ordinaryIncome),
        });
    }

    if (taxes.stcg) {
        details.push({
            label: 'STCG',
            amount: formatUSD(taxes.stcg),
        });
    }

    if (taxes.ltcg) {
        details.push({
            label: 'LTCG',
            amount: formatUSD(taxes.ltcg),
        });
    }

    return details;
}
