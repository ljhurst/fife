import Alpine from 'alpinejs';

import type { XData } from '@/domain/components/x-data';
import { getUserManager } from '@/utils/auth';

type SignInXData = XData<
    {},
    {
        signIn(this: SignInXData): Promise<void>;
    }
>;

function signInXData(): SignInXData {
    return {
        data: {},
        methods: {
            async signIn(this: SignInXData): Promise<void> {
                const userManager = getUserManager();

                await userManager.signinRedirect();
            },
        },
    };
}

Alpine.data('signInXData', signInXData);
