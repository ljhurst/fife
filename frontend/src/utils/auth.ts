import { UserManager } from 'oidc-client-ts';

import { ROUTES } from '@/constants';
import type { CurrentUser } from '@/domain/auth/current-user';
import { getRuntimeConfig } from '@/utils/runtime';

const AUTHORITY = 'https://zzspanxrc7v4tvou4acvdq36oi0yjdrz.lambda-url.us-east-1.on.aws/';
const CLIENT_ID = 'fife';
const FIFE_RESOURCE_INDICATOR = 'https://fi37z0j9pg.execute-api.us-east-1.amazonaws.com/prod';
const AFTER_LOGIN_URL = `${getRuntimeConfig().baseUrl}/${ROUTES.AUTH_AFTER_LOGIN}`;
const AFTER_LOGOUT_URL = `${getRuntimeConfig().baseUrl}/`;

const LASSO_AUTH_CONFIG = {
    authority: AUTHORITY,
    client_id: CLIENT_ID,
    redirect_uri: AFTER_LOGIN_URL,
    post_logout_redirect_uri: AFTER_LOGOUT_URL,
    response_type: 'code',
    scope: 'openid profile',
    extraQueryParams: { resource: FIFE_RESOURCE_INDICATOR },
    extraTokenParams: { resource: FIFE_RESOURCE_INDICATOR },
};

const USER_MANAGER = new UserManager({
    ...LASSO_AUTH_CONFIG,
});

function getUserManager(): UserManager {
    return USER_MANAGER;
}

async function getCurrentUser(): Promise<CurrentUser | null> {
    const userManager = getUserManager();
    const user = await userManager.getUser();

    if (!user) {
        return null;
    }

    if (!user.profile.sub || !user.profile.given_name) {
        throw new Error('Missing required user attributes');
    }

    return {
        id: user.profile.sub,
        givenName: user.profile.given_name,
    };
}

async function isAuthenticated(): Promise<boolean> {
    const currentUser = await getCurrentUser();

    return currentUser !== null;
}

async function signOutRedirect(): Promise<void> {
    const userManager = getUserManager();

    const user = await userManager.getUser();

    await userManager.removeUser();

    await userManager.signoutRedirect({
        ...(user?.id_token ? { id_token_hint: user.id_token } : {}),
        post_logout_redirect_uri: AFTER_LOGOUT_URL,
    });
}

async function authHeader(): Promise<Record<string, string>> {
    const userManager = getUserManager();
    const user = await userManager.getUser();

    if (!user) {
        return {};
    }

    return { Authorization: `Bearer ${user.access_token}` };
}

export { getUserManager, getCurrentUser, isAuthenticated, signOutRedirect, authHeader };
