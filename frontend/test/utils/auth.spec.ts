import { beforeEach, describe, test, expect, vi } from 'vitest';

import * as auth from '@/utils/auth';

describe('auth', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('getCurrentUser', () => {
        test('should return null if no user is found', async () => {
            const user = await auth.getCurrentUser();

            expect(user).toBeNull();
        });

        test('should throw error if no given name found in user profile', async () => {
            const userManager = auth.getUserManager();
            userManager.getUser = vi.fn().mockResolvedValue({
                profile: {
                    given_name: undefined,
                },
            });

            vi.spyOn(auth, 'getUserManager').mockResolvedValue(userManager);

            try {
                await auth.getCurrentUser();
                expect(true).toBe(false);
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        test('should return user with given name if found', async () => {
            const userManager = auth.getUserManager();
            userManager.getUser = vi.fn().mockResolvedValue({
                profile: {
                    sub: '123',
                    given_name: 'John',
                },
            });

            vi.spyOn(auth, 'getUserManager').mockResolvedValue(userManager);

            const user = await auth.getCurrentUser();

            expect(user).toEqual({ id: '123', givenName: 'John' });
        });
    });

    describe('isAuthenticated', () => {
        test('should return true if user is authenticated', async () => {
            const result = await auth.isAuthenticated();

            expect(result).toBe(false);
        });

        test('should return true if user is authenticated', async () => {
            const userManager = auth.getUserManager();
            userManager.getUser = vi.fn().mockResolvedValue({
                profile: {
                    sub: '123',
                    given_name: 'John',
                },
            });

            vi.spyOn(auth, 'getUserManager').mockResolvedValue(userManager);

            const result = await auth.isAuthenticated();

            expect(result).toBe(true);
        });
    });

    describe('signOutRedirect', () => {
        test('should clear user and redirect via RP-initiated logout', async () => {
            const userManager = auth.getUserManager();
            userManager.getUser = vi.fn().mockResolvedValue({ id_token: 'id-token-123' });
            userManager.removeUser = vi.fn().mockResolvedValue(undefined);
            userManager.signoutRedirect = vi.fn().mockResolvedValue(undefined);

            vi.spyOn(auth, 'getUserManager').mockResolvedValue(userManager);

            await auth.signOutRedirect();

            expect(userManager.removeUser).toHaveBeenCalled();
            expect(userManager.signoutRedirect).toHaveBeenCalledWith(
                expect.objectContaining({ id_token_hint: 'id-token-123' }),
            );
        });
    });
});
