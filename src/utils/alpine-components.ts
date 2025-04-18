// eslint-disable-next-line @typescript-eslint/no-explicit-any
function register(name: string, component: any): void {
    if (typeof window !== 'undefined') {
        // @ts-expect-error TS2339
        window.Alpine.data(name, component);
    }
}

export { register };
