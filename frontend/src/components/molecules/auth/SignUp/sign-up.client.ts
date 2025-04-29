import Alpine from 'alpinejs';

import type { XData } from '@/domain/components/x-data';
import { getUserManager } from '@/utils/auth';

type SignUpXData = XData<
    {},
    {
        signUp(this: SignUpXData): Promise<void>;
    }
>;

function signUpXData(): SignUpXData {
    return {
        data: {},
        methods: {
            async signUp(this: SignUpXData): Promise<void> {
                const userManager = getUserManager();

                await userManager.signinRedirect();
            },
        },
    };
}

Alpine.data('signUpXData', signUpXData);
