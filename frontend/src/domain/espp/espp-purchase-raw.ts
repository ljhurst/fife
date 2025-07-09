interface ESPPPurchaseRaw {
    grantDate: string;
    purchaseDate: string;
    offerStartPrice: string;
    offerEndPrice: string;
    purchasePrice: string;
    shares: string;
}

const ESPP_PURCHASE_REQUIRED_FIELDS = [
    'grantDate',
    'purchaseDate',
    'offerStartPrice',
    'offerEndPrice',
    'purchasePrice',
    'shares',
] as const satisfies ReadonlyArray<keyof ESPPPurchaseRaw>;

function createESPPPurchaseRaw(): ESPPPurchaseRaw {
    return {
        grantDate: '',
        purchaseDate: '',
        offerStartPrice: '',
        offerEndPrice: '',
        purchasePrice: '',
        shares: '',
    };
}

function isESPPPurchaseRawValid(purchase: ESPPPurchaseRaw): boolean {
    return ESPP_PURCHASE_REQUIRED_FIELDS.every(
        (field) => purchase[field] && purchase[field].trim() !== '',
    );
}

export { ESPP_PURCHASE_REQUIRED_FIELDS, createESPPPurchaseRaw, isESPPPurchaseRawValid };
export type { ESPPPurchaseRaw };
