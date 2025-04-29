import Alpine from 'alpinejs';

import type { XData } from '@/domain/components/x-data';
import { signOutRedirect } from '@/utils/auth';

type LogoutXData = XData<
    {},
    {
        logout(this: LogoutXData): Promise<void>;
    }
>;

function logoutXData(): LogoutXData {
    return {
        data: {},
        methods: {
            async logout(this: LogoutXData): Promise<void> {
                await signOutRedirect();
            },
        },
    };
}

Alpine.data('logoutXData', logoutXData);
