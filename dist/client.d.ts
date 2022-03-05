import { DownloadFileParams } from '@lokalise/node-api';
interface Config {
    dist: string;
    projects: ReadonlyArray<ProjectConfig>;
    token: string;
    datoApiToken: string;
    clean?: boolean;
    declaration?: DeclarationConfig;
    delimiter?: string;
    prefix?: string;
    useFlat?: boolean;
}
interface ProjectConfig extends Omit<DownloadFileParams, 'format'> {
    id: string;
    prefix?: string;
}
interface DeclarationConfig {
    dist: string;
    transformKey?(path: string[]): string;
}
export declare class LokaliseClient {
    private readonly lokaliseApi;
    private readonly config;
    private locales;
    constructor(config: Config);
    pushTranslationsToDatoCMS(): Promise<void>;
    private pushProjectTranslationsToDato;
    private updateFieldInDato;
    fetchTranslations(): Promise<void>;
    private fetchTranslationsForAllProjects;
    private fetchProject;
    private addLocale;
    private getLocale;
}
export {};
