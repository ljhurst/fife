import Alpine from 'alpinejs';

import type { XData } from '@/domain/components/x-data';

type NavigationXData = XData<{ isActive: boolean }, { toggleIsActive(): void }>;

function navigationXData(): NavigationXData {
    return {
        data: {
            isActive: false,
        },
        methods: {
            toggleIsActive(this: NavigationXData): void {
                this.data.isActive = !this.data.isActive;
            },
        },
    };
}

Alpine.data('navigationXData', navigationXData);
