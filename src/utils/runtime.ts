interface RuntimeConfig {
    baseUrl: string;
}

function getRuntimeConfig(): RuntimeConfig {
    const isDev = import.meta.env.DEV;

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
