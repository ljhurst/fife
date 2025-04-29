import type { Maximize401kInput } from '@/domain/401k/maximize-401k-input';
import type { XData } from '@/domain/components/x-data';
import {
    isMaximize401kInputsReady,
    calculate401kContributionPercent,
} from '@/utils/401k-calculations';
import { register } from '@/utils/alpine-components';

type Maximize401kXData = XData<
    {
        annualSalary: string | null;
        annualContributionLimit: string | null;
        contributionsSoFar: string | null;
        paychecksPerYear: number | null;
        paychecksRemaining: string | null;
        ceilContributionPercent: number | null;
    },
    {
        showMaximize401k: () => boolean;
        on401kDetailsInput: () => void;
    }
>;

function maximize401kXData(): Maximize401kXData {
    return {
        data: {
            annualSalary: null,
            annualContributionLimit: null,
            contributionsSoFar: null,
            paychecksPerYear: null,
            paychecksRemaining: null,
            ceilContributionPercent: null,
        },
        methods: {
            showMaximize401k(this: Maximize401kXData): boolean {
                const input = parseInputs(this.data);

                return isMaximize401kInputsReady(input);
            },
            on401kDetailsInput(this: Maximize401kXData): void {
                console.log('Annual Salary:', this.data.annualSalary);
                console.log('Annual Contribution Limit:', this.data.annualContributionLimit);
                console.log('Contributions So Far:', this.data.contributionsSoFar);
                console.log('Paychecks Remaining:', this.data.paychecksRemaining);

                const input = parseInputs(this.data);

                if (!isMaximize401kInputsReady(input)) {
                    this.data.ceilContributionPercent = null;
                    return;
                }

                const contributionPercent = calculate401kContributionPercent(input);
                this.data.ceilContributionPercent = Math.ceil(contributionPercent);
            },
        },
    };
}

register('maximize401kXData', maximize401kXData);

function parseInputs(inputs: Record<string, string | number | null>): Maximize401kInput {
    return {
        annualSalary: parseFloat(inputs.annualSalary as string),
        annualContributionLimit: parseInt(inputs.annualContributionLimit as string),
        contributionsSoFar: parseFloat(inputs.contributionsSoFar as string),
        paychecksPerYear: parseInt(inputs.paychecksPerYear as string),
        paychecksRemaining: parseInt(inputs.paychecksRemaining as string),
    };
}
