import { API_HOST, CACHE_BASE_USER, CACHE_BASE_USER_ESPP_LOT } from '@/api/constants';
import type { Settings, RawUserSettings, UserSettings } from '@/domain/user/user-settings';
import { getCachedItem, setCachedItem, getCacheKey } from '@/utils/cache';
import type { ESPPPurchaseRaw } from '@/utils/espp-calculations';

async function get(userId: string): Promise<UserSettings> {
    const cacheKey = getCacheKey([CACHE_BASE_USER, userId]);
    const cachedUser = getCachedItem(cacheKey) as RawUserSettings | null;

    if (cachedUser) {
        return parseRawUser(cachedUser);
    }

    const response = await fetch(`${API_HOST}/user/${userId}`);

    if (response.status === 404) {
        throw new Error(`User not found: ${userId}`);
    } else if (!response.ok) {
        throw new Error(`Error fetching user: ${response.statusText}`);
    }

    const rawUser = await response.json();

    setCachedItem(cacheKey, rawUser);

    return parseRawUser(rawUser);
}

async function update(userId: string, userSettings: Settings): Promise<UserSettings> {
    const response = await fetch(`${API_HOST}/user/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userSettings),
    });

    if (!response.ok) {
        throw new Error(`Error updating user: ${response.statusText}`);
    }

    const rawUser = await response.json();

    const cacheKey = getCacheKey([CACHE_BASE_USER, userId]);
    setCachedItem(cacheKey, rawUser);

    return parseRawUser(rawUser);
}

async function esppLotList(userId: string): Promise<ESPPPurchaseRaw[]> {
    const cacheKey = getCacheKey([CACHE_BASE_USER_ESPP_LOT, userId]);
    const cachedLots = getCachedItem(cacheKey) as ESPPPurchaseRaw[] | null;

    if (cachedLots) {
        return cachedLots;
    }

    const response = await fetch(`${API_HOST}/user/${userId}/espp-lot`);

    if (!response.ok) {
        throw new Error(`Error fetching ESPP lots: ${response.statusText}`);
    }

    const rawLots = await response.json();

    setCachedItem(cacheKey, rawLots);

    return rawLots;
}

export { get, update, esppLotList };

function parseRawUser(rawUser: RawUserSettings): UserSettings {
    return {
        ...rawUser,
        createdAt: new Date(rawUser.createdAt),
        updatedAt: new Date(rawUser.updatedAt),
    };
}
