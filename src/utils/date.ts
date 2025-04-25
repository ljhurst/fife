const EPOCH_DATE = new Date(0);
const INFINITE_DATE = new Date(8640000000000000);

const WEEKS_PER_YEAR = 52;
const MILLISECONDS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

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

function firstDayOfNextYearFromDate(date: Date): Date {
    return new Date(date.getFullYear() + 1, 0, 1);
}

function weeksBewteenDates(date1: Date, date2: Date): number {
    const diff = Math.abs(date1.getTime() - date2.getTime());

    return diff / MILLISECONDS_PER_WEEK;
}

export {
    EPOCH_DATE,
    INFINITE_DATE,
    WEEKS_PER_YEAR,
    addYears,
    latestDate,
    formatDateYYYYMMDD,
    firstDayOfNextYearFromDate,
    weeksBewteenDates,
};
