interface FinanceSettings {
    annualSalary: number;
    paychecksPerYear: number;
}

interface Settings {
    finance: FinanceSettings;
}

interface ChangeableSettings {
    settings: Settings;
}

interface BaseUserSettings extends ChangeableSettings {
    userId: string;
}

interface UserSettings extends BaseUserSettings {
    createdAt: Date;
    updatedAt: Date;
}

interface RawUserSettings extends BaseUserSettings {
    createdAt: string;
    updatedAt: string;
}

export type { BaseUserSettings, Settings, UserSettings, RawUserSettings };
