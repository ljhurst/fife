// eslint-disable-next-line @typescript-eslint/no-explicit-any
function register(name: string, component: any): void {
    // @ts-expect-error TS2339
    if (typeof window !== 'undefined' && window.Alpine) {
        // @ts-expect-error TS2339
        window.Alpine.data(name, component);
    }
}

export { register };
