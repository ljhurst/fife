import { create, remove } from '@/api/resources/espp-lot';
import { esppLotList } from '@/api/resources/user';
import type { CurrentUser } from '@/domain/auth/current-user';
import type { XData } from '@/domain/components/x-data';
import {
    ESPP_PURCHASE_INPUT_REQUIRED_FIELDS,
    createESPPPurchaseInput,
    isESPPPurchaseInputValid,
    type ESPPPurchaseInput,
    type ESPPPurchaseRaw,
} from '@/domain/espp/espp-purchase-raw';
import { ESPPTaxOutcome } from '@/domain/espp/espp-tax-outcome';
import {
    convertEsppTaxesToUIState,
    convertEsppSaleTaxesToUIState,
    type ESPPPurchaseTaxesUI,
    type ESPPSaleTaxesUI,
} from '@/pages/work/_espp.utils';
import { register } from '@/utils/alpine-components';
import { isLastElement } from '@/utils/array';
import { getCurrentUser } from '@/utils/auth';
import { csvToJson } from '@/utils/data';
import {
    clearMarketDependentValues,
    loadESPPPurchasesTaxes,
    type ESPPPurchaseTaxes,
    type ESPPSaleTaxes,
    updateMarketDependentValues,
} from '@/utils/espp-calculations';
import { read } from '@/utils/file';
import { arrayToCommaSeparatedString } from '@/utils/string';

type PurchaseTableXData = XData<
    {
        user: CurrentUser | null;
        nkeMarketPrice: string;
        purchases: ESPPPurchaseTaxes[];
        displayPurchases: ESPPPurchaseTaxesUI[];
        displaySales: ESPPSaleTaxesUI[];
        outcomeClasses: Record<ESPPTaxOutcome, string>;
        isNewLotModalActive: boolean;
        newESPPLot: ESPPPurchaseInput;
        canSaveNewLot: boolean;
        isSavingNewLot: boolean;
        isLoadingESPPLots: boolean;
    },
    {
        isLastElement: typeof isLastElement;
        init: () => Promise<void>;
        setPurchases: (esppPurchaseTaxes: ESPPPurchaseTaxes[]) => void;
        setSales: (esppSalesTaxes: ESPPSaleTaxes[]) => void;
        showTaxConsiderations: () => boolean;
        onFileUpload: (event: CustomEvent) => void;
        onMarketPriceInput: () => void;
        displayRequiredFields: () => string;
        openNewLotModal: () => void;
        closeNewLotModal: () => void;
        onNewLotInput: () => void;
        saveNewLot: () => Promise<void>;
        toggleActions: (event: PointerEvent) => void;
        closeActions: () => void;
        toggleDetails: (event: PointerEvent) => void;
        deleteLot: (event: PointerEvent) => Promise<void>;
        findPurchaseId: (event: PointerEvent, selector: string) => string;
        findPurchaseById: (purchaseId: string) => ESPPPurchaseTaxesUI;
    }
>;

function purchaseTableXData(): PurchaseTableXData {
    return {
        data: {
            user: null,
            nkeMarketPrice: '',
            purchases: [],
            displayPurchases: [],
            displaySales: [],
            outcomeClasses: {
                [ESPPTaxOutcome.GOOD]: 'has-background-danger-dark',
                [ESPPTaxOutcome.BETTER]: 'has-background-warning-dark',
                [ESPPTaxOutcome.BEST]: 'has-background-success-dark',
            },
            isNewLotModalActive: false,
            newESPPLot: createESPPPurchaseInput(),
            canSaveNewLot: false,
            isSavingNewLot: false,
            isLoadingESPPLots: false,
        },
        methods: {
            isLastElement,
            async init(this: PurchaseTableXData): Promise<void> {
                this.data.user = await getCurrentUser();

                if (!this.data.user) {
                    console.log('No logged in user');
                    return;
                }

                try {
                    this.data.isLoadingESPPLots = true;
                    const userLots = await esppLotList(this.data.user.id);

                    const purchasesAndSalesWithTaxes = loadESPPPurchasesTaxes(userLots);
                    this.methods.setPurchases.bind(this)(purchasesAndSalesWithTaxes.purchases);
                    this.methods.setSales.bind(this)(purchasesAndSalesWithTaxes.sales);
                } catch (error) {
                    console.error('Error fetching ESPP lots:', error);
                } finally {
                    this.data.isLoadingESPPLots = false;
                }
            },
            setPurchases(this: PurchaseTableXData, esppPurchaseTaxes: ESPPPurchaseTaxes[]): void {
                this.data.purchases = esppPurchaseTaxes;
                this.data.displayPurchases = convertEsppTaxesToUIState(esppPurchaseTaxes);
            },
            setSales(this: PurchaseTableXData, esppSalesTaxes: ESPPSaleTaxes[]): void {
                this.data.displaySales = convertEsppSaleTaxesToUIState(esppSalesTaxes);
            },
            showTaxConsiderations(this: PurchaseTableXData): boolean {
                return !!this.data.user || this.data.purchases.length > 0;
            },
            async onFileUpload(this: PurchaseTableXData, event: CustomEvent): Promise<void> {
                if (!event.detail) {
                    return;
                }

                const csvString = await read(event.detail);
                const csvRecords = csvToJson(csvString);

                const esppPurchases = csvRecords.map((record, index) => ({
                    id: `upload-${index}`,
                    ...record,
                })) as ESPPPurchaseRaw[];

                const userLotsWithTaxes = loadESPPPurchasesTaxes(esppPurchases).purchases;
                this.methods.setPurchases.bind(this)(userLotsWithTaxes);
            },
            onMarketPriceInput(this: PurchaseTableXData): void {
                const marketPrice = parseFloat(this.data.nkeMarketPrice);
                console.log('Market Price:', marketPrice);

                if (isNaN(marketPrice)) {
                    const clearedPurchases = clearMarketDependentValues(this.data.purchases);
                    this.methods.setPurchases.bind(this)(clearedPurchases);
                    return;
                }

                const updatedPurchases = updateMarketDependentValues(
                    this.data.purchases,
                    marketPrice,
                );
                this.methods.setPurchases.bind(this)(updatedPurchases);

                console.log('Purchases:', this.data.purchases);
            },
            displayRequiredFields(): string {
                return arrayToCommaSeparatedString(ESPP_PURCHASE_INPUT_REQUIRED_FIELDS);
            },
            openNewLotModal(this: PurchaseTableXData): void {
                this.data.isNewLotModalActive = true;
            },
            closeNewLotModal(this: PurchaseTableXData): void {
                this.data.isNewLotModalActive = false;
                this.data.newESPPLot = createESPPPurchaseInput();
            },
            onNewLotInput(this: PurchaseTableXData): void {
                this.data.canSaveNewLot = isESPPPurchaseInputValid(this.data.newESPPLot);
            },
            async saveNewLot(this: PurchaseTableXData): Promise<void> {
                if (!this.data.user || !this.data.user.id) {
                    console.error('User ID is not available');
                    return;
                }

                try {
                    this.data.isSavingNewLot = true;

                    await create(this.data.user.id, this.data.newESPPLot);
                    const userLots = await esppLotList(this.data.user.id);

                    const userLotsWithTaxes = loadESPPPurchasesTaxes(userLots).purchases;
                    this.methods.setPurchases.bind(this)(userLotsWithTaxes);

                    this.methods.onMarketPriceInput.bind(this)();
                    this.methods.closeNewLotModal.bind(this)();
                } catch (error) {
                    console.error('Error creating new ESPP lot:', error);
                } finally {
                    this.data.isSavingNewLot = false;
                }
            },
            toggleActions(this: PurchaseTableXData, event: PointerEvent): void {
                const selectedPurchaseId = this.methods.findPurchaseId.bind(this)(
                    event,
                    'button[data-purchase-id]',
                );

                const selectedPurchase =
                    this.methods.findPurchaseById.bind(this)(selectedPurchaseId);

                this.data.displayPurchases.forEach((purchase) => {
                    if (purchase !== selectedPurchase) {
                        purchase.uiState.isActionsOpen = false;
                    }
                });

                selectedPurchase.uiState.isActionsOpen = !selectedPurchase.uiState.isActionsOpen;
            },
            closeActions(this: PurchaseTableXData): void {
                this.data.displayPurchases.forEach((purchase) => {
                    purchase.uiState.isActionsOpen = false;
                });
            },
            toggleDetails(this: PurchaseTableXData, event: PointerEvent): void {
                const selectedPurchaseId = this.methods.findPurchaseId.bind(this)(
                    event,
                    'a[data-purchase-id]',
                );

                const selectedPurchase =
                    this.methods.findPurchaseById.bind(this)(selectedPurchaseId);

                selectedPurchase.uiState.isDetailsOpen = !selectedPurchase.uiState.isDetailsOpen;
                selectedPurchase.uiState.isActionsOpen = false;
            },
            async deleteLot(this: PurchaseTableXData, event: PointerEvent): Promise<void> {
                if (!this.data.user || !this.data.user.id) {
                    console.error('User ID is not available');
                    return;
                }

                if (!confirm('Are you sure you want to delete this ESPP lot?')) {
                    return;
                }

                const selectedPurchaseId = this.methods.findPurchaseId.bind(this)(
                    event,
                    'a[data-purchase-id]',
                );
                const selectedPurchase =
                    this.methods.findPurchaseById.bind(this)(selectedPurchaseId);

                try {
                    selectedPurchase.uiState.isActionsOpen = false;
                    selectedPurchase.uiState.isDeleting = true;

                    await remove(this.data.user.id, selectedPurchaseId);

                    const remainingPurchases = this.data.purchases.filter(
                        (purchase) => purchase.id !== selectedPurchaseId,
                    );
                    this.methods.setPurchases.bind(this)(remainingPurchases);
                } catch (error) {
                    console.error('Error deleting ESPP lot:', error);
                } finally {
                    selectedPurchase.uiState.isDeleting = false;
                }
            },
            findPurchaseId(
                this: PurchaseTableXData,
                event: PointerEvent,
                selector: string,
            ): string {
                const eventTarget = event.target as HTMLElement;
                const button = eventTarget?.closest(selector) as HTMLElement | null;

                const selectedPurchaseId = button?.dataset.purchaseId;

                if (!selectedPurchaseId) {
                    throw new Error('Purchase ID not found in button data attribute');
                }

                return selectedPurchaseId;
            },
            findPurchaseById(this: PurchaseTableXData, purchaseId: string): ESPPPurchaseTaxesUI {
                const selectedPurchase = this.data.displayPurchases.find(
                    (purchase) => purchase.id === purchaseId,
                );

                if (!selectedPurchase) {
                    throw new Error(`Purchase with ID ${purchaseId} not found`);
                }

                return selectedPurchase;
            },
        },
    };
}

register('purchaseTableXData', purchaseTableXData);
