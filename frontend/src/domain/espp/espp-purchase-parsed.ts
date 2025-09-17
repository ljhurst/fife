interface ESPPSale {
    id: string;
    date: Date;
    price: number;
    shares: number;
}

interface ESPPPurchase {
    id: string;
    grantDate: Date;
    purchaseDate: Date;
    offerStartPrice: number;
    offerEndPrice: number;
    purchasePrice: number;
    shares: number;
    sales: ESPPSale[];
}

export type { ESPPPurchase, ESPPSale };
