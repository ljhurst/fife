import { API_HOST, CACHE_BASE_USER_ESPP_LOT } from '@/api/constants';
import { type ESPPPurchaseInput, type ESPPPurchaseRaw } from '@/domain/espp/espp-purchase-raw';
import { deleteCachedItem, getCacheKey } from '@/utils/cache';

async function create(userId: string, lot: ESPPPurchaseInput): Promise<ESPPPurchaseRaw> {
    const response = await fetch(`${API_HOST}/espp/lot`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId,
            grantDate: lot.grantDate,
            purchaseDate: lot.purchaseDate,
            offerStartPrice: parseFloat(lot.offerStartPrice),
            offerEndPrice: parseFloat(lot.offerEndPrice),
            purchasePrice: parseFloat(lot.purchasePrice),
            shares: parseFloat(lot.shares),
        }),
    });

    if (!response.ok) {
        throw new Error(`Error creating ESPP lot: ${response.statusText}`);
    }

    const createdLot = await response.json();

    const userLotsKey = getCacheKey([CACHE_BASE_USER_ESPP_LOT, userId]);
    deleteCachedItem(userLotsKey);

    return createdLot;
}

async function remove(userId: string, lotId: string): Promise<void> {
    const response = await fetch(`${API_HOST}/espp/lot/${lotId}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`Error deleting ESPP lot: ${response.statusText}`);
    }

    const userLotsKey = getCacheKey([CACHE_BASE_USER_ESPP_LOT, userId]);
    deleteCachedItem(userLotsKey);
}

async function get(lotId: string): Promise<ESPPPurchaseRaw> {
    const response = await fetch(`${API_HOST}/espp/lot/${lotId}`);

    if (response.status === 404) {
        throw new Error(`ESPP lot not found: ${lotId}`);
    } else if (!response.ok) {
        throw new Error(`Error fetching ESPP lot: ${response.statusText}`);
    }

    return await response.json();
}

export { create, remove, get };
