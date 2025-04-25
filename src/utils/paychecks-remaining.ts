import type { PaychecksRemainingInput } from '@/domain/paycheck/paychecks-remaining-input';
import {
    EPOCH_DATE,
    WEEKS_PER_YEAR,
    firstDayOfNextYearFromDate,
    weeksBewteenDates,
} from '@/utils/date';

function isPaychecksRemainingInputsReady(input: PaychecksRemainingInput): boolean {
    const isKnownPaycheckDateValid = input.knownPaycheckDate.getTime() !== EPOCH_DATE.getTime();

    return Boolean(input.paychecksPerYear) && isKnownPaycheckDateValid;
}

function calculatePaychecksRemaining(input: PaychecksRemainingInput): number {
    const firstDayOfNextYearFromPaycheckDate = firstDayOfNextYearFromDate(input.knownPaycheckDate);

    const weeksBetweenPaycheckDateAndFirstOfNextYear = Math.ceil(
        weeksBewteenDates(input.knownPaycheckDate, firstDayOfNextYearFromPaycheckDate),
    );

    const paychecksPerWeek = input.paychecksPerYear / WEEKS_PER_YEAR;

    const paychecksRemaining = Math.floor(
        weeksBetweenPaycheckDateAndFirstOfNextYear * paychecksPerWeek,
    );

    return paychecksRemaining;
}

export { isPaychecksRemainingInputsReady, calculatePaychecksRemaining };
