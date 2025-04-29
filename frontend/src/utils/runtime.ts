interface RuntimeConfig {
    baseUrl: string;
}

function getRuntimeConfig(): RuntimeConfig {
    const isDev = isDevelopmentEnv();

    const baseUrl = getBaseUrl(isDev);

    return {
        baseUrl: baseUrl,
    };
}

export { getRuntimeConfig };

function isDevelopmentEnv(): boolean {
    return window.location.hostname === 'localhost';
}

function getBaseUrl(isDev: boolean): string {
    if (isDev) {
        return 'http://localhost:4321';
    }

    return 'https://d3de9r2gorcf05.cloudfront.net';
}
