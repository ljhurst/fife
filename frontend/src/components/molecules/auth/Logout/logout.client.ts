import Alpine from 'alpinejs';

import type { XData } from '@/domain/components/x-data';
import { signOutRedirect } from '@/utils/auth';
import { clearCache } from '@/utils/cache';

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
                clearCache();

                await signOutRedirect();
            },
        },
    };
}

Alpine.data('logoutXData', logoutXData);
