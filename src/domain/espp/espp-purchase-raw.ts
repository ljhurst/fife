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

export { ESPP_PURCHASE_REQUIRED_FIELDS };
export type { ESPPPurchaseRaw };
