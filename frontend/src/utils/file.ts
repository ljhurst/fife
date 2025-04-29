async function read(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event): void => {
            const text = event.target?.result as string;
            resolve(text);
        };

        reader.onerror = (): void => {
            reject(new Error('Error reading file'));
        };

        reader.readAsText(file);
    });
}

export { read };
