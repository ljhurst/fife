interface FinanceSettings {
    annualSalary: number;
    paychecksPerYear: number;
}

interface Settings {
    finance: FinanceSettings;
}

interface UserSettings {
    userId: string;
    settings: Settings;
    createdAt: Date;
    updatedAt: Date;
}

export type { UserSettings };
