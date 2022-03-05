export declare class Locale {
    delimiter: string;
    lokaliseDelimiter: string;
    readonly language: string;
    private _translations;
    constructor(language: string, translations: Record<string, unknown>);
    getTranslations(useFlat?: boolean): Locale['_translations'];
    getTranslation(lokaliseKey: string): string | undefined;
    addPrefixToKeys(prefix: string): Locale['_translations'];
    addTranslations(newTranslations: Record<string, unknown>): Locale['_translations'];
    getTypes(): string;
    getTranslationsCount(): number;
    get datoCmsISOLocale(): string;
}
