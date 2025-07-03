import type { Settings, RawUserSettings, UserSettings } from '@/domain/user/user-settings';
import { getCachedItem, setCachedItem } from '@/utils/cache';

const API_HOST = 'https://vxzzln3s2i.execute-api.us-east-1.amazonaws.com/prod';

const CACHE_BASE = 'api-resource-user';

async function get(userId: string): Promise<UserSettings> {
    const cacheKey = getCacheKey(userId);
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

    const cacheKey = getCacheKey(userId);
    setCachedItem(cacheKey, rawUser);

    return parseRawUser(rawUser);
}

export { get, update };

function getCacheKey(userId: string): string {
    return `${CACHE_BASE}-${userId}`;
}

function parseRawUser(rawUser: RawUserSettings): UserSettings {
    return {
        ...rawUser,
        createdAt: new Date(rawUser.createdAt),
        updatedAt: new Date(rawUser.updatedAt),
    };
}
