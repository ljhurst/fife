import { get } from '@/api/resources/user';
import type { Maximize401kInput } from '@/domain/401k/maximize-401k-input';
import type { XData } from '@/domain/components/x-data';
import {
    isMaximize401kInputsReady,
    calculate401kContributionPercent,
    calculate401kBreakdown,
    type Maximize401kBreakdown,
} from '@/utils/401k-calculations';
import { register } from '@/utils/alpine-components';
import { getCurrentUser } from '@/utils/auth';
import { formatUSD } from '@/utils/number';

interface BreakdownItem {
    label: string;
    value: string;
}

type Maximize401kXData = XData<
    {
        annualSalary: string | null;
        annualContributionLimit: string | null;
        contributionsSoFar: string | null;
        paychecksPerYear: number | null;
        paychecksRemaining: string | null;
        ceilContributionPercent: number | null;
        isDetailsOpen: boolean;
        breakdownDetails: Maximize401kBreakdown | null;
        breakdownItems: BreakdownItem[];
        breakdownTotal: string;
    },
    {
        init: () => Promise<void>;
        showMaximize401k: () => boolean;
        on401kDetailsInput: () => void;
        toggleDetails: () => void;
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
            isDetailsOpen: false,
            breakdownDetails: null,
            breakdownItems: [],
            breakdownTotal: '',
        },
        methods: {
            async init(this: Maximize401kXData): Promise<void> {
                const user = await getCurrentUser();

                if (!user) {
                    console.log('User not found');
                    return;
                }

                const userSettings = await get(user.id);

                this.data.annualSalary = userSettings.settings.finance.annualSalary.toString();
                this.data.paychecksPerYear = userSettings.settings.finance.paychecksPerYear;
            },
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
                    this.data.breakdownDetails = null;
                    this.data.breakdownItems = [];
                    this.data.breakdownTotal = '';
                    return;
                }

                const contributionPercent = calculate401kContributionPercent(input);
                this.data.ceilContributionPercent = Math.ceil(contributionPercent);

                const breakdown = calculate401kBreakdown(input);
                this.data.breakdownDetails = breakdown;
                this.data.breakdownItems = [
                    {
                        label: 'Remaining Contribution',
                        value: formatUSD(breakdown.remainingContribution),
                    },
                    {
                        label: 'Salary Per Paycheck',
                        value: formatUSD(breakdown.salaryPerPaycheck),
                    },
                    {
                        label: 'Contribution Per Paycheck',
                        value: formatUSD(breakdown.contributionPerPaycheck),
                    },
                    {
                        label: 'Raw Percentage',
                        value: breakdown.rawPercentage.toFixed(2) + '%',
                    },
                ];
                this.data.breakdownTotal = formatUSD(breakdown.totalWithCeiledPercent);
            },
            toggleDetails(this: Maximize401kXData): void {
                this.data.isDetailsOpen = !this.data.isDetailsOpen;
            },
        },
    };
}

register('maximize401kXData', maximize401kXData);

function parseInputs(
    inputs: Pick<
        Maximize401kXData['data'],
        | 'annualSalary'
        | 'annualContributionLimit'
        | 'contributionsSoFar'
        | 'paychecksPerYear'
        | 'paychecksRemaining'
    >,
): Maximize401kInput {
    return {
        annualSalary: parseFloat(inputs.annualSalary as string),
        annualContributionLimit: parseInt(inputs.annualContributionLimit as string),
        contributionsSoFar: parseFloat(inputs.contributionsSoFar as string),
        paychecksPerYear: inputs.paychecksPerYear as number,
        paychecksRemaining: parseInt(inputs.paychecksRemaining as string),
    };
}
