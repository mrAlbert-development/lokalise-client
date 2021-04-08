import { DownloadFileParams } from '@lokalise/node-api';
interface Config {
    dist: string;
    projects: ReadonlyArray<ProjectConfig>;
    token: string;
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
    private readonly api;
    private readonly config;
    private locales;
    constructor(config: Config);
    fetchTranslations(): Promise<void>;
    private fetchProject;
    private addLocale;
    private getLocale;
}
export {};
