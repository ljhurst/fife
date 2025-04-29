import { get } from '@/api/resources/user';
import type { XData } from '@/domain/components/x-data';
import type { PaychecksRemainingInput } from '@/domain/paycheck/paychecks-remaining-input';
import { register } from '@/utils/alpine-components';
import { getCurrentUser } from '@/utils/auth';
import {
    isPaychecksRemainingInputsReady,
    calculatePaychecksRemaining,
} from '@/utils/paychecks-remaining';

type PaychecksRemainingXData = XData<
    {
        paychecksPerYear: string | null;
        knownPaycheckDate: string | null;
        paychecksRemaining: number | null;
    },
    {
        init: () => Promise<void>;
        showPaychecksRemaining: () => boolean;
        onPaychecksRemainingInput: () => void;
    }
>;

function paychecksRemainingXData(): PaychecksRemainingXData {
    return {
        data: {
            paychecksPerYear: null,
            knownPaycheckDate: null,
            paychecksRemaining: null,
        },
        methods: {
            async init(this: PaychecksRemainingXData): Promise<void> {
                const user = await getCurrentUser();

                if (!user) {
                    console.log('User not found');
                    return;
                }

                const userSettings = await get(user.id);

                this.data.paychecksPerYear =
                    userSettings.settings.finance.paychecksPerYear.toString();
            },
            showPaychecksRemaining(this: PaychecksRemainingXData): boolean {
                const input = parsePaycheckRemainingInputs(this.data);

                return isPaychecksRemainingInputsReady(input);
            },
            onPaychecksRemainingInput(this: PaychecksRemainingXData): void {
                const inputs = parsePaycheckRemainingInputs(this.data);
                console.log('Inputs:', inputs);

                if (!isPaychecksRemainingInputsReady(inputs)) {
                    this.data.paychecksRemaining = null;
                    return;
                }

                this.data.paychecksRemaining = calculatePaychecksRemaining(inputs);
            },
        },
    };
}

register('paychecksRemainingXData', paychecksRemainingXData);

function parsePaycheckRemainingInputs(
    data: Record<string, string | number | null>,
): PaychecksRemainingInput {
    return {
        paychecksPerYear: parseInt(data.paychecksPerYear as string),
        knownPaycheckDate: new Date(data.knownPaycheckDate as string),
    };
}
