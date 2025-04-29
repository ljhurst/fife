import type { Maximize401kInput } from '@/domain/401k/maximize-401k-input';

function isMaximize401kInputsReady(input: Maximize401kInput): boolean {
    for (const key in input) {
        if (Number.isNaN(input[key as keyof Maximize401kInput])) {
            return false;
        }
    }

    return true;
}

function calculate401kContributionPercent(input: Maximize401kInput): number {
    const {
        annualSalary,
        annualContributionLimit,
        contributionsSoFar,
        paychecksPerYear,
        paychecksRemaining,
    } = input;

    const remainingContribution = annualContributionLimit - contributionsSoFar;
    const contributionPerPaycheck = remainingContribution / paychecksRemaining;

    const biweeklySalary = annualSalary / paychecksPerYear;

    const contributionDecimal = contributionPerPaycheck / biweeklySalary;

    return contributionDecimal * 100;
}

export { isMaximize401kInputsReady, calculate401kContributionPercent };
