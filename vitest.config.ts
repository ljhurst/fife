/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
    test: {
        coverage: {
            provider: 'v8',
            reporter: ['html'],
            all: true,
            include: ['src/**/*.{ts,js}'],
            exclude: ['node_modules', 'dist', 'tests'],
        },
    },
});
