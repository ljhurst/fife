import type { Maximize401kInput } from '@/domain/401k/maximize-401k-input';

interface Maximize401kBreakdown {
    remainingContribution: number;
    contributionPerPaycheck: number;
    salaryPerPaycheck: number;
    rawPercentage: number;
    ceiledPercentage: number;
    totalWithCeiledPercent: number;
}

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

function calculate401kBreakdown(input: Maximize401kInput): Maximize401kBreakdown {
    const {
        annualSalary,
        annualContributionLimit,
        contributionsSoFar,
        paychecksPerYear,
        paychecksRemaining,
    } = input;

    const remainingContribution = annualContributionLimit - contributionsSoFar;
    const contributionPerPaycheck = remainingContribution / paychecksRemaining;
    const salaryPerPaycheck = annualSalary / paychecksPerYear;
    const rawPercentage = (contributionPerPaycheck / salaryPerPaycheck) * 100;
    const ceiledPercentage = Math.ceil(rawPercentage);
    const totalWithCeiledPercent =
        contributionsSoFar + (ceiledPercentage / 100) * salaryPerPaycheck * paychecksRemaining;

    return {
        remainingContribution,
        contributionPerPaycheck,
        salaryPerPaycheck,
        rawPercentage,
        ceiledPercentage,
        totalWithCeiledPercent,
    };
}

export { isMaximize401kInputsReady, calculate401kContributionPercent, calculate401kBreakdown };
export type { Maximize401kBreakdown };
