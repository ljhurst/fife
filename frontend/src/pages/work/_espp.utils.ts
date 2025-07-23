import { ESPPTaxOutcome } from '@/domain/espp/espp-tax-outcome';
import { sortArrayOfObjectsByKey } from '@/utils/array';
import { formatDateYYYYMMDD } from '@/utils/date';
import {
    type ESPPDisposition,
    type ESPPDispositions,
    type ESPPPurchaseTaxes,
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
    taxes: ESPPTaxesUI;
    outcome: ESPPTaxOutcome;
}

interface ESPPDispositionsUI {
    disqualifyingSTCG: ESPPDispositionUI;
    disqualifyingLTCG: ESPPDispositionUI;
    qualifying: ESPPDispositionUI;
}

interface ESPPPurchaseUIState {
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
    uiState: ESPPPurchaseUIState;
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
            gains: convertGainsToUI(purchase),
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

export { convertEsppTaxesToUIState };
export type { ESPPPurchaseTaxesUI };

function convertGainsToUI(purchase: ESPPPurchaseTaxes): ESPPGainsUI {
    return {
        discountAmount: formatUSD(purchase.discountAmount),
        market: purchase.marketGain !== undefined ? formatUSD(purchase.marketGain) : undefined,
        total: purchase.totalGain !== undefined ? formatUSD(purchase.totalGain) : undefined,
        details: _convertGainsToDetailsUI(purchase),
    };
}

function _convertGainsToDetailsUI(purchase: ESPPPurchaseTaxes): ESPPDetailsUI[] {
    const details: ESPPDetailsUI[] = [];

    if (purchase.discountAmount) {
        details.push({
            label: 'Discount',
            amount: formatUSD(purchase.discountAmount),
        });
    }

    if (purchase.marketGain) {
        details.push({
            label: 'Market',
            amount: formatUSD(purchase.marketGain),
        });
    }

    return details;
}

function _convertDisposistionsToUI(disposistions: ESPPDispositions): ESPPDispositionsUI {
    return {
        disqualifyingSTCG: _convertDisposistionToUI(disposistions.disqualifyingSTCG),
        disqualifyingLTCG: _convertDisposistionToUI(disposistions.disqualifyingLTCG),
        qualifying: _convertDisposistionToUI(disposistions.qualifying),
    };
}

function _convertDisposistionToUI(disposistion: ESPPDisposition): ESPPDispositionUI {
    return {
        taxes: _convertTaxestoUI(disposistion.taxes),
        outcome: disposistion.outcome,
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
