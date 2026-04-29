import type { PaychecksRemainingInput } from '@/domain/paycheck/paychecks-remaining-input';
import {
    EPOCH_DATE,
    WEEKS_PER_YEAR,
    addDays,
    firstDayOfNextYearFromDate,
    weeksBewteenDates,
} from '@/utils/date';

function isPaychecksRemainingInputsReady(input: PaychecksRemainingInput): boolean {
    const isNextPaycheckDateValid = input.nextPaycheckDate.getTime() !== EPOCH_DATE.getTime();

    return Boolean(input.paychecksPerYear) && isNextPaycheckDateValid;
}

function calculatePaychecksRemaining(input: PaychecksRemainingInput): number {
    const firstDayOfNextYearFromPaycheckDate = firstDayOfNextYearFromDate(input.nextPaycheckDate);
    const firstDayOfNextYearFromPaycheckPlusOneDate = addDays(
        firstDayOfNextYearFromPaycheckDate,
        1,
    );

    const weeksBetweenPaycheckDateAndFirstOfNextYear = Math.ceil(
        weeksBewteenDates(input.nextPaycheckDate, firstDayOfNextYearFromPaycheckPlusOneDate),
    );

    const paychecksPerWeek = input.paychecksPerYear / WEEKS_PER_YEAR;

    const paychecksRemaining = Math.floor(
        weeksBetweenPaycheckDateAndFirstOfNextYear * paychecksPerWeek,
    );

    return paychecksRemaining;
}

export { isPaychecksRemainingInputsReady, calculatePaychecksRemaining };
