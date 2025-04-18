import type { XData } from '@/domain/components/x-data';
import { ESPP_PURCHASE_REQUIRED_FIELDS } from '@/domain/espp/espp-purchase-raw';
import { ESPPTaxOutcome } from '@/domain/espp/espp-tax-outcome';
import { register } from '@/utils/alpine-components';
import { csvToJson } from '@/utils/data';
import { formatDateYYYYMMDD } from '@/utils/date';
import {
    loadESPPPurchasesTaxes,
    updateMarketDependentValues,
    clearMarketDependentValues,
} from '@/utils/espp-calculations';
import type { ESPPPurchaseRaw, ESPPPurchaseTaxes } from '@/utils/espp-calculations';
import { read } from '@/utils/file';
import { formatUSD } from '@/utils/number';
import { arrayToCommaSeparatedString } from '@/utils/string';

type PurchaseTableXData = XData<
    {
        nkeMarketPrice: string;
        purchases: ESPPPurchaseTaxes[];
        outcomeClasses: Record<ESPPTaxOutcome, string>;
    },
    {
        formatUSD: typeof formatUSD;
        formatDateYYYYMMDD: typeof formatDateYYYYMMDD;
        showTaxConsiderations: () => boolean;
        onFileUpload: (event: CustomEvent) => void;
        onMarketPriceInput: () => void;
        displayRequiredFields: () => string;
    }
>;

function purchaseTableXData(): PurchaseTableXData {
    return {
        data: {
            nkeMarketPrice: '',
            purchases: [],
            outcomeClasses: {
                [ESPPTaxOutcome.GOOD]: 'has-background-danger-dark',
                [ESPPTaxOutcome.BETTER]: 'has-background-warning-dark',
                [ESPPTaxOutcome.BEST]: 'has-background-success-dark',
            },
        },
        methods: {
            formatUSD,
            formatDateYYYYMMDD,
            showTaxConsiderations(this: PurchaseTableXData): boolean {
                return this.data.purchases.length > 0;
            },
            async onFileUpload(this: PurchaseTableXData, event: CustomEvent): Promise<void> {
                if (!event.detail) {
                    return;
                }

                const csvString = await read(event.detail);
                const esspPurchases = csvToJson(csvString) as ESPPPurchaseRaw[];

                this.data.purchases = loadESPPPurchasesTaxes(esspPurchases);
            },
            onMarketPriceInput(this: PurchaseTableXData): void {
                const marketPrice = parseFloat(this.data.nkeMarketPrice);
                console.log('Market Price:', marketPrice);

                if (isNaN(marketPrice)) {
                    clearMarketDependentValues(this.data.purchases);
                    return;
                }

                updateMarketDependentValues(this.data.purchases, marketPrice);

                console.log('Purchases:', this.data.purchases);
            },
            displayRequiredFields(): string {
                return arrayToCommaSeparatedString(ESPP_PURCHASE_REQUIRED_FIELDS);
            },
        },
    };
}

register('purchaseTableXData', purchaseTableXData);
