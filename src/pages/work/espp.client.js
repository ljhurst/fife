import Alpine from 'alpinejs';

import { formatDateYYYYMMDD } from '@/utils/date.ts';
import { loadESPPPurchasesTaxes, updateMarketDependentValues } from '@/utils/espp-calculations.ts';
import { formatUSD } from '@/utils/number.ts';

function purchaseTableXData() {
    return {
        data: {
            nkeMarketPrice: '',
            purchases: loadESPPPurchasesTaxes(),
        },
        methods: {
            formatUSD,
            formatDateYYYYMMDD,
            onMarketPriceInput() {
                const marketPrice = parseFloat(this.data.nkeMarketPrice);
                console.log('Market Price:', marketPrice);

                if (isNaN(marketPrice)) {
                    return;
                }

                updateMarketDependentValues(this.data.purchases, marketPrice);

                console.log('Purchases:', this.data.purchases);
            },
        },
    };
}

Alpine.data('purchaseTableXData', purchaseTableXData);
