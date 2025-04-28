import { UserManager } from 'oidc-client-ts';

import { ROUTES } from '@/constants';
import type { CurrentUser } from '@/domain/auth/current-user';
import { getRuntimeConfig } from '@/utils/runtime';

const AUTHORITY = 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_DOgM3Opvr';
const COGNITO_DOMAIN = 'https://us-east-1dogm3opvr.auth.us-east-1.amazoncognito.com';
const CLIENT_ID = '13f9h1bnc01ep9mjlo3dmqubln';
const AFTER_LOGIN_URL = `${getRuntimeConfig().baseUrl}/${ROUTES.AUTH_AFTER_LOGIN}`;
const AFTER_LOGOUT_URL = `${getRuntimeConfig().baseUrl}/`;

const COGNITO_AUTH_CONFIG = {
    authority: AUTHORITY,
    client_id: CLIENT_ID,
    redirect_uri: AFTER_LOGIN_URL,
    response_type: 'code',
    scope: 'openid',
};

const USER_MANAGER = new UserManager({
    ...COGNITO_AUTH_CONFIG,
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

    if (!user.profile.given_name) {
        throw new Error('No given name found in user profile');
    }

    return {
        givenName: user.profile.given_name,
    };
}

async function isAuthenticated(): Promise<boolean> {
    const currentUser = await getCurrentUser();

    return currentUser !== null;
}

async function signOutRedirect(): Promise<void> {
    const userManager = getUserManager();

    await userManager.removeUser();

    const clientIdParam = `client_id=${CLIENT_ID}`;
    const logoutUriParam = `logout_uri=${encodeURIComponent(AFTER_LOGOUT_URL)}`;

    window.location.href = `${COGNITO_DOMAIN}/logout?${clientIdParam}&${logoutUriParam}`;
}

export { getUserManager, getCurrentUser, isAuthenticated, signOutRedirect };
