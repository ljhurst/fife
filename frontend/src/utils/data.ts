function csvToJson(csvData: string): object[] {
    const rows = csvData.trim().split('\n');
    const headerString = rows.shift();

    if (!headerString) {
        return [];
    }

    const headers = csvRowToArray(headerString);

    return rows.map((row) => {
        const values = csvRowToArray(row);

        return headers.reduce(
            (acc, header, index) => {
                if (header === undefined || values[index] === undefined) {
                    return acc;
                }

                acc[header] = values[index];
                return acc;
            },
            {} as Record<string, string>,
        );
    });
}

export { csvToJson };

function csvRowToArray(row: string): string[] {
    const rawValues = row.split(',');

    return rawValues.map((value) => value.trim());
}
