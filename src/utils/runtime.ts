interface RuntimeConfig {
    baseUrl: string;
}

function getRuntimeConfig(): RuntimeConfig {
    const isDev = isDevelopmentMode();

    const baseUrl = getBaseUrl(isDev);

    return {
        baseUrl: baseUrl,
    };
}

export { getRuntimeConfig };

function getBaseUrl(isDev: boolean): string {
    if (isDev) {
        return 'http://localhost:4321';
    }

    return 'https://d3de9r2gorcf05.cloudfront.net';
}

function isDevelopmentMode(): boolean {
    if (
        typeof import.meta !== 'undefined' &&
        import.meta &&
        'env' in import.meta &&
        'DEV' in import.meta.env
    ) {
        return Boolean(import.meta.env.DEV);
    }

    if (typeof process !== 'undefined' && process.env && 'NODE_ENV' in process.env) {
        return process.env.NODE_ENV === 'development';
    }

    return false;
}
