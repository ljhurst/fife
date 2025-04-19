import { describe, expect, test } from 'vitest';

import { generateEmojiFaviconURL } from '@/utils/favicon';

describe('favicon', () => {
    describe('generateEmojiFaviconURL', () => {
        test('should generate a valid emoji favicon URL', () => {
            const emoji = '😀';
            const url = generateEmojiFaviconURL(emoji);

            expect(url).toContain('data:image/svg+xml');
            expect(url).toContain(encodeURIComponent(emoji));
        });
    });
});
