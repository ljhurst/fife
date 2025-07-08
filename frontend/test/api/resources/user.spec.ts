import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { API_HOST } from '@/api/constants';
import { esppLotList, get, update } from '@/api/resources/user';
import type { RawUserSettings, Settings } from '@/domain/user/user-settings';

describe('user', () => {
    const mockUserId = 'user-123';
    const mockRawUserSettings: RawUserSettings = {
        userId: mockUserId,
        settings: {
            finance: {
                annualSalary: 100000,
                paychecksPerYear: 24,
            },
        },
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-02T00:00:00Z',
    };

    const mockParsedUserSettings = {
        ...mockRawUserSettings,
        createdAt: new Date(mockRawUserSettings.createdAt),
        updatedAt: new Date(mockRawUserSettings.updatedAt),
    };

    const mockFetchResponse = {
        ok: true,
        status: 200,
        json: async (): Promise<RawUserSettings> => mockRawUserSettings,
    };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    describe('get', () => {
        it('should fetch user from API when not in cache', async () => {
            global.fetch = vi.fn().mockResolvedValue(mockFetchResponse);

            const result = await get(mockUserId);

            expect(global.fetch).toHaveBeenCalledWith(`${API_HOST}/user/${mockUserId}`);

            expect(result).toEqual(mockParsedUserSettings);

            await get(mockUserId);

            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('should throw error when user is not found', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            });

            await expect(get(mockUserId)).rejects.toThrow(`User not found: ${mockUserId}`);
        });

        it('should throw error on API failure', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
            });

            await expect(get(mockUserId)).rejects.toThrow(
                'Error fetching user: Internal Server Error',
            );
        });
    });

    describe('update', () => {
        const mockSettings: Settings = {
            finance: {
                annualSalary: 120000,
                paychecksPerYear: 26,
            },
        };

        it('should update user settings successfully', async () => {
            const updatedRawUserSettings = {
                ...mockRawUserSettings,
                settings: mockSettings,
                updatedAt: '2023-01-03T00:00:00Z',
            };

            const updatedParsedUserSettings = {
                ...updatedRawUserSettings,
                createdAt: new Date(updatedRawUserSettings.createdAt),
                updatedAt: new Date(updatedRawUserSettings.updatedAt),
            };

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(updatedRawUserSettings),
            });

            const result = await update(mockUserId, mockSettings);

            expect(result).toEqual(updatedParsedUserSettings);

            const cachedResult = await get(mockUserId);

            expect(cachedResult).toEqual(updatedParsedUserSettings);
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('should throw error on update failure', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                statusText: 'Bad Request',
            });

            await expect(update(mockUserId, mockSettings)).rejects.toThrow(
                'Error updating user: Bad Request',
            );
        });
    });

    describe('esppLotList', () => {
        const mockESPPLots = [
            {
                grantDate: '2023-01-01',
                purchaseDate: '2023-06-30',
                offerStartPrice: 150.0,
                offerEndPrice: 160.0,
                purchasePrice: 136.0,
                shares: 10,
            },
            {
                grantDate: '2023-07-01',
                purchaseDate: '2023-12-31',
                offerStartPrice: 160.0,
                offerEndPrice: 170.0,
                purchasePrice: 144.5,
                shares: 12,
            },
        ];

        it('should fetch ESPP lots from API when not in cache', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(mockESPPLots),
            });

            const result = await esppLotList(mockUserId);

            expect(global.fetch).toHaveBeenCalledWith(`${API_HOST}/user/${mockUserId}/espp-lot`);
            expect(result).toEqual(mockESPPLots);

            const cachedResult = await esppLotList(mockUserId);

            expect(cachedResult).toEqual(mockESPPLots);
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('should handle API errors gracefully', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
            });

            await expect(esppLotList(mockUserId)).rejects.toThrow();
        });
    });
});
