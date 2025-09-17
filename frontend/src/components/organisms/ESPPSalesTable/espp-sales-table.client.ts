import Alpine from 'alpinejs';

import type { XData } from '@/domain/components/x-data';

type ESPPSalesTableXData = XData<{}, {}>;

function esppSalesTableXData(): ESPPSalesTableXData {
    return {
        data: {},
        methods: {},
    };
}

Alpine.data('esppSalesTableXData', esppSalesTableXData);
