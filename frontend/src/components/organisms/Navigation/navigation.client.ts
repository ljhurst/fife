import Alpine from 'alpinejs';

import type { CurrentUser } from '@/domain/auth/current-user';
import type { XData } from '@/domain/components/x-data';
import { getCurrentUser } from '@/utils/auth';

type NavigationXData = XData<
    { currentUser: CurrentUser | null; isActive: boolean },
    { init(): Promise<void>; toggleIsActive(): void }
>;

function navigationXData(): NavigationXData {
    return {
        data: {
            currentUser: null,
            isActive: false,
        },
        methods: {
            async init(this: NavigationXData): Promise<void> {
                this.data.currentUser = await getCurrentUser();
            },
            toggleIsActive(this: NavigationXData): void {
                this.data.isActive = !this.data.isActive;
            },
        },
    };
}

Alpine.data('navigationXData', navigationXData);
