import Alpine from 'alpinejs';

import type { XData } from '@/domain/components/x-data';

type FileUploadXData = XData<
    { file: File | null },
    { selectedFileName(): string; onFileInputChange: (event: Event) => void }
>;

function fileUploadXData(): FileUploadXData {
    return {
        data: {
            file: null,
        },
        methods: {
            selectedFileName(this: FileUploadXData): string {
                if (this.data.file) {
                    return this.data.file.name;
                }

                return 'No file selected';
            },
            onFileInputChange(this: FileUploadXData, event: Event): void {
                const target = event.target as HTMLInputElement;

                if (target.files && target.files[0] !== undefined) {
                    this.data.file = target.files[0];

                    // @ts-expect-error TS2339
                    this.$dispatch('upload', this.data.file);
                }
            },
        },
    };
}

Alpine.data('fileUploadXData', fileUploadXData);
