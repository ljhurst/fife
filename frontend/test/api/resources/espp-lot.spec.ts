import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { API_HOST } from '@/api/constants';
import { create, remove, get } from '@/api/resources/espp-lot';
import type { ESPPPurchaseRaw } from '@/domain/espp/espp-purchase-raw';

describe('espp-lot', () => {
    const mockUserId = 'user-123';
    const mockLotId = 'lot-456';

    const mockESPPLot: ESPPPurchaseRaw = {
        id: mockLotId,
        grantDate: '2023-01-01',
        purchaseDate: '2023-06-30',
        offerStartPrice: '150.00',
        offerEndPrice: '160.00',
        purchasePrice: '136.00',
        shares: '10',
    };

    const mockCreatedLot = {
        id: mockLotId,
        userId: mockUserId,
        grantDate: '2023-01-01',
        purchaseDate: '2023-06-30',
        offerStartPrice: 150.0,
        offerEndPrice: 160.0,
        purchasePrice: 136.0,
        shares: 10,
        createdAt: '2023-07-01T00:00:00Z',
    };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    describe('create', () => {
        it('should create an ESPP lot successfully', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(mockCreatedLot),
            });

            const result = await create(mockUserId, mockESPPLot);

            expect(global.fetch).toHaveBeenCalledWith(`${API_HOST}/espp/lot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: mockUserId,
                    grantDate: mockESPPLot.grantDate,
                    purchaseDate: mockESPPLot.purchaseDate,
                    offerStartPrice: parseFloat(mockESPPLot.offerStartPrice),
                    offerEndPrice: parseFloat(mockESPPLot.offerEndPrice),
                    purchasePrice: parseFloat(mockESPPLot.purchasePrice),
                    shares: parseFloat(mockESPPLot.shares),
                }),
            });

            expect(result).toEqual(mockCreatedLot);
        });

        it('should throw error on create failure', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                statusText: 'Bad Request',
            });

            await expect(create(mockUserId, mockESPPLot)).rejects.toThrow(
                'Error creating ESPP lot: Bad Request',
            );
        });
    });

    describe('remove', () => {
        it('should delete an ESPP lot successfully', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
            });

            await remove(mockUserId, mockLotId);

            expect(global.fetch).toHaveBeenCalledWith(`${API_HOST}/espp/lot/${mockLotId}`, {
                method: 'DELETE',
            });
        });

        it('should throw error on delete failure', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                statusText: 'Not Found',
            });

            await expect(remove(mockUserId, mockLotId)).rejects.toThrow(
                'Error deleting ESPP lot: Not Found',
            );
        });
    });

    describe('get', () => {
        it('should fetch an ESPP lot successfully', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(mockCreatedLot),
            });

            const result = await get(mockLotId);

            expect(global.fetch).toHaveBeenCalledWith(`${API_HOST}/espp/lot/${mockLotId}`);
            expect(result).toEqual(mockCreatedLot);
        });

        it('should throw error when lot is not found', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            });

            await expect(get(mockLotId)).rejects.toThrow(`ESPP lot not found: ${mockLotId}`);
        });

        it('should throw error on API failure', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
            });

            await expect(get(mockLotId)).rejects.toThrow(
                'Error fetching ESPP lot: Internal Server Error',
            );
        });
    });
});
