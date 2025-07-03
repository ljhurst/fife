import { get, update } from '@/api/resources/user';
import type { XData } from '@/domain/components/x-data';
import type { Settings } from '@/domain/user/user-settings';
import { register } from '@/utils/alpine-components';
import { getCurrentUser } from '@/utils/auth';

type SettingsXData = XData<
    {
        annualSalary: string | null;
        paychecksPerYear: string | null;
        isSaving: boolean;
        saveError: string | null;
    },
    {
        init: () => Promise<void>;
        isSaveDisabled: () => boolean;
        saveSettings: () => Promise<void>;
    }
>;

function settingsXData(): SettingsXData {
    return {
        data: {
            annualSalary: null,
            paychecksPerYear: null,
            isSaving: false,
            saveError: null,
        },
        methods: {
            async init(this: SettingsXData): Promise<void> {
                const user = await getCurrentUser();

                if (!user) {
                    console.log('No current user found, skipping settings initialization');
                    return;
                }

                try {
                    const userSettings = await get(user.id);

                    this.data.annualSalary = userSettings.settings.finance.annualSalary.toString();
                    this.data.paychecksPerYear =
                        userSettings.settings.finance.paychecksPerYear.toString();
                } catch (error) {
                    console.log('Error fetching user settings:', error);
                }
            },
            isSaveDisabled(this: SettingsXData): boolean {
                return !this.data.annualSalary || !this.data.paychecksPerYear || this.data.isSaving;
            },
            async saveSettings(this: SettingsXData): Promise<void> {
                const user = await getCurrentUser();

                if (!user) {
                    console.error('No current user found, cannot save settings');
                    this.data.saveError = 'No user is currently logged in.';
                    return;
                }

                const newSettings: Settings = {
                    finance: {
                        annualSalary: parseFloat(this.data.annualSalary as string),
                        paychecksPerYear: parseInt(this.data.paychecksPerYear as string),
                    },
                };

                try {
                    this.data.isSaving = true;

                    await update(user.id, newSettings);
                } catch (error) {
                    console.error('Error saving settings:', error);
                    this.data.saveError = 'Failed to save settings. Please try again.';
                } finally {
                    this.data.isSaving = false;
                }
            },
        },
    };
}

register('settingsXData', settingsXData);
