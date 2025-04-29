import type { UserSettings } from '@/domain/user/user-settings';

const API_HOST = 'https://vxzzln3s2i.execute-api.us-east-1.amazonaws.com/prod';

async function get(userId: string): Promise<UserSettings> {
    const response = await fetch(`${API_HOST}/user/${userId}`);

    if (!response.ok) {
        throw new Error(`Error fetching user: ${response.statusText}`);
    }

    const rawUser = await response.json();

    return {
        ...rawUser,
        createdAt: new Date(rawUser.createdAt),
        updatedAt: new Date(rawUser.updatedAt),
    };
}

export { get };
