function formatUSD(value: number): string {
    if (isNaN(value)) {
        return '';
    }

    const displayValue = Math.abs(value).toFixed(2);

    if (value > 0) {
        return `$${displayValue}`;
    }

    return `-$${displayValue}`;
}

function round(value: number, precision: number): number {
    const factor = Math.pow(10, precision);

    return Math.round(value * factor) / factor;
}

export { formatUSD, round };
