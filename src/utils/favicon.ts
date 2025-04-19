function generateEmojiFaviconURL(emoji: string): string {
    const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <text y=".9em" font-size="90">${emoji}</text>
        </svg>
    `;
    const encodedSVG = encodeURIComponent(svgContent).replace(/'/g, '%27').replace(/"/g, '%22');

    return `data:image/svg+xml,${encodedSVG}`;
}

export { generateEmojiFaviconURL };
