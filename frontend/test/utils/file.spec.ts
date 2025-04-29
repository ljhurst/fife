import { describe, expect, test } from 'vitest';

import { read } from '@/utils/file';

describe('file', () => {
    describe('read', () => {
        test('should read a file', async () => {
            const fileContent = 'Hello, World!';
            const mockFile = new File([fileContent], 'filename.txt', { type: 'text/plain' });

            const content = await read(mockFile);

            expect(content).toBeDefined();
            expect(content).toEqual(fileContent);
        });
    });
});
