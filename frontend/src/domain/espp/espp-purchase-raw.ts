interface ESPPPurchaseInput {
    grantDate: string;
    purchaseDate: string;
    offerStartPrice: string;
    offerEndPrice: string;
    purchasePrice: string;
    shares: string;
}

interface ESPPPurchaseRaw extends ESPPPurchaseInput {
    id: string;
}

const ESPP_PURCHASE_INPUT_REQUIRED_FIELDS = [
    'grantDate',
    'purchaseDate',
    'offerStartPrice',
    'offerEndPrice',
    'purchasePrice',
    'shares',
] as const satisfies ReadonlyArray<keyof ESPPPurchaseInput>;

function createESPPPurchaseInput(): ESPPPurchaseInput {
    return {
        grantDate: '',
        purchaseDate: '',
        offerStartPrice: '',
        offerEndPrice: '',
        purchasePrice: '',
        shares: '',
    };
}

function isESPPPurchaseInputValid(purchase: ESPPPurchaseInput): boolean {
    return ESPP_PURCHASE_INPUT_REQUIRED_FIELDS.every(
        (field) => purchase[field] && purchase[field].trim() !== '',
    );
}

export { ESPP_PURCHASE_INPUT_REQUIRED_FIELDS, createESPPPurchaseInput, isESPPPurchaseInputValid };
export type { ESPPPurchaseInput, ESPPPurchaseRaw };
