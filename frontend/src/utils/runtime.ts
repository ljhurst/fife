interface RuntimeConfig {
    baseUrl: string;
}

function getRuntimeConfig(): RuntimeConfig {
    return {
        baseUrl: window.location.origin,
    };
}

export { getRuntimeConfig };
