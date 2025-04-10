function addYears(date: Date, years: number): Date {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + years);

    return newDate;
}

function formatDateYYYYMMDD(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function latestDate(date1: Date, date2: Date): Date {
    return date1 > date2 ? date1 : date2;
}

export { addYears, latestDate, formatDateYYYYMMDD };
