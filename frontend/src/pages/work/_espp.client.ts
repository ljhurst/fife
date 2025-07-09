import { create } from '@/api/resources/espp-lot';
import { esppLotList } from '@/api/resources/user';
import type { CurrentUser } from '@/domain/auth/current-user';
import type { XData } from '@/domain/components/x-data';
import {
    ESPP_PURCHASE_REQUIRED_FIELDS,
    createESPPPurchaseRaw,
    isESPPPurchaseRawValid,
    type ESPPPurchaseRaw,
} from '@/domain/espp/espp-purchase-raw';
import { ESPPTaxOutcome } from '@/domain/espp/espp-tax-outcome';
import { register } from '@/utils/alpine-components';
import { sortArrayOfObjectsByKey } from '@/utils/array';
import { getCurrentUser } from '@/utils/auth';
import { csvToJson } from '@/utils/data';
import { formatDateYYYYMMDD } from '@/utils/date';
import {
    clearMarketDependentValues,
    loadESPPPurchasesTaxes,
    type ESPPPurchaseTaxes,
    updateMarketDependentValues,
} from '@/utils/espp-calculations';
import { read } from '@/utils/file';
import { formatUSD } from '@/utils/number';
import { arrayToCommaSeparatedString } from '@/utils/string';

type PurchaseTableXData = XData<
    {
        user: CurrentUser | null;
        nkeMarketPrice: string;
        purchases: ESPPPurchaseTaxes[];
        outcomeClasses: Record<ESPPTaxOutcome, string>;
        isNewLotModalActive: boolean;
        newESPPLot: ESPPPurchaseRaw;
        canSaveNewLot: boolean;
        isSavingNewLot: boolean;
    },
    {
        formatUSD: typeof formatUSD;
        formatDateYYYYMMDD: typeof formatDateYYYYMMDD;
        sortArrayOfObjectsByKey: typeof sortArrayOfObjectsByKey;
        init: () => Promise<void>;
        showTaxConsiderations: () => boolean;
        onFileUpload: (event: CustomEvent) => void;
        onMarketPriceInput: () => void;
        displayRequiredFields: () => string;
        openNewLotModal: () => void;
        closeNewLotModal: () => void;
        onNewLotInput: () => void;
        saveNewLot: () => Promise<void>;
    }
>;

function purchaseTableXData(): PurchaseTableXData {
    return {
        data: {
            user: null,
            nkeMarketPrice: '',
            purchases: [],
            outcomeClasses: {
                [ESPPTaxOutcome.GOOD]: 'has-background-danger-dark',
                [ESPPTaxOutcome.BETTER]: 'has-background-warning-dark',
                [ESPPTaxOutcome.BEST]: 'has-background-success-dark',
            },
            isNewLotModalActive: false,
            //newESPPLot: createESPPPurchaseRaw(),
            newESPPLot: {
                grantDate: '2023-04-01',
                purchaseDate: '2023-09-30',
                offerStartPrice: '122.64',
                offerEndPrice: '95.62',
                purchasePrice: '81.28',
                shares: '114.8999',
            },
            canSaveNewLot: false,
            isSavingNewLot: false,
        },
        methods: {
            formatUSD,
            formatDateYYYYMMDD,
            sortArrayOfObjectsByKey,
            async init(this: PurchaseTableXData): Promise<void> {
                this.data.user = await getCurrentUser();

                if (!this.data.user) {
                    console.log('No logged in user');
                    return;
                }

                const userLots = await esppLotList(this.data.user.id);

                this.data.purchases = loadESPPPurchasesTaxes(userLots);
            },
            showTaxConsiderations(this: PurchaseTableXData): boolean {
                return this.data.purchases.length > 0;
            },
            async onFileUpload(this: PurchaseTableXData, event: CustomEvent): Promise<void> {
                if (!event.detail) {
                    return;
                }

                const csvString = await read(event.detail);
                const esppPurchases = csvToJson(csvString) as ESPPPurchaseRaw[];

                this.data.purchases = loadESPPPurchasesTaxes(esppPurchases);
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
            openNewLotModal(this: PurchaseTableXData): void {
                this.data.isNewLotModalActive = true;
            },
            closeNewLotModal(this: PurchaseTableXData): void {
                this.data.isNewLotModalActive = false;
                this.data.newESPPLot = createESPPPurchaseRaw();
            },
            onNewLotInput(this: PurchaseTableXData): void {
                console.log(isESPPPurchaseRawValid(this.data.newESPPLot));
                this.data.canSaveNewLot = isESPPPurchaseRawValid(this.data.newESPPLot);
            },
            async saveNewLot(this: PurchaseTableXData): Promise<void> {
                if (!this.data.user || !this.data.user.id) {
                    console.error('User ID is not available');
                    return;
                }

                this.data.isSavingNewLot = true;

                try {
                    const createdLot = await create(this.data.user.id, this.data.newESPPLot);

                    const newPurchase = loadESPPPurchasesTaxes([createdLot])[0];
                    if (!newPurchase) {
                        console.error('Failed to calculate taxes for the new purchase');
                        return;
                    }
                    this.data.purchases.push(newPurchase);

                    this.methods.onMarketPriceInput.bind(this)();
                    this.methods.closeNewLotModal.bind(this)();
                } catch (error) {
                    console.error('Error creating new ESPP lot:', error);
                    this.data.isSavingNewLot = false;
                    return;
                }
            },
        },
    };
}

register('purchaseTableXData', purchaseTableXData);
