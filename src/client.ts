import { DownloadFileParams, LokaliseApi } from '@lokalise/node-api';

import { fetchLocales } from './api/files';
import { Locale } from './locale';
import { logMessage, removeDirectory, saveFile, saveJsonToFile } from './utils';
/* tslint:disable:no-var-requires */
// datocms api uses require and does not support imports
const { SiteClient } = require('datocms-client');

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

interface LokaliseKeyDefinition {
  custom_attributes: string;
  key_name: { web: string };
  parsed_custom_attributes: LokaliseKeyDatoCustomAttributes;
}

interface LokaliseKeyDatoCustomAttributes {
  datoRecordId: number;
  datoFieldName: string;
}

export class LokaliseClient {
  private readonly lokaliseApi: LokaliseApi;
  private readonly config: Config;
  private locales: Locale[] = [];

  public constructor(config: Config) {
    this.lokaliseApi = new LokaliseApi({
      apiKey: config.token,
    });

    this.config = config;
  }

  public async pushTranslationsToDatoCMS() {

    if (!this.config.datoApiToken) {
      logMessage('Missing DatoCMS API token in configuration', 'error');
      return;
    }

    try {
      await Promise.all(this.config.projects.map(projectConfig => this.pushProjectTranslationsToDato(projectConfig)));

    } catch (error) {
      logMessage(error as string, 'error');
      console.error(error);
    }
  }

  private async pushProjectTranslationsToDato({ id }: ProjectConfig) {
    
    const maxGetKeysLimitAllowed = 5000;
    const keys: LokaliseKeyDefinition[] = await this.lokaliseApi.keys.list({
      project_id: id,
      filter_tags: 'dato',
      limit: maxGetKeysLimitAllowed,
    });

    logMessage(`Loaded ${keys.length} keys`, 'success');

    await this.fetchTranslationsForAllProjects();
    
    keys.forEach(key => {
      try {
        key.parsed_custom_attributes = JSON.parse(key.custom_attributes);
      } catch (e) {
        logMessage(`Unable to parse custom attributes for key ${key.key_name.web}`, 'error');
      }
    });

    try {
      await Promise.all(keys
        .filter(key => key.parsed_custom_attributes)
        .map(key => this.updateFieldInDato(
          key.key_name.web, 
          key.parsed_custom_attributes.datoRecordId, 
          key.parsed_custom_attributes.datoFieldName)));      

    } catch (e) {
      logMessage('Unable to push translations to DatoCMS', 'error');
      throw e;
    }
  }

  private async updateFieldInDato(key: string, recordId: number, fieldName: string) {
    const newRecordValue: Record<string, string> = {};

    const isLocaleSupportedByDato = (locale: Locale) => locale.datoCmsISOLocale;
    this.locales.filter(isLocaleSupportedByDato).forEach(locale => {
      newRecordValue[`${locale.datoCmsISOLocale}`] = locale.getTranslation(key) || '';
    });

    const client = new SiteClient(this.config.datoApiToken);
    const newFieldValue:Record<string, any> = {}; 
    newFieldValue[fieldName] = newRecordValue;
    await client.items.update(recordId.toString(), newFieldValue);

    logMessage(`Updated key ${key} on record and field ${recordId}.${fieldName}`, 'success');
  }

  public async fetchTranslations() {

    const { clean, declaration, dist, prefix, useFlat } = this.config;

    try {
      await this.fetchTranslationsForAllProjects();
    } catch (error) {
      logMessage(error as string, 'error');
      return;
    }

    if (clean) {
      removeDirectory(dist);
    }

    this.locales.forEach(locale => {
      saveJsonToFile(
        `${dist}/${locale.language}`,
        `${prefix || ''}index.json`,
        locale.getTranslations(useFlat),
      );
      logMessage(
        `Translations were saved ${
          locale.language
        }. Translations count: ${locale.getTranslationsCount()}`,
        'success',
      );
    });

    if (declaration) {
      saveFile(
        `${declaration.dist}/types`,
        'index.ts',
        this.locales[0].getTypes(),
      );
      logMessage(`Declaration file was saved`, 'success');
    }
  }

  private async fetchTranslationsForAllProjects() {
    try {
      await Promise.all(this.config.projects.map(projectConfig => this.fetchProject(projectConfig)));

    } catch (error) {
      throw new Error('Fetching translations failed');
    }

    if (this.locales.length === 0) {
      throw new Error('Translations are empty')
    }
  }

  private async fetchProject({ prefix, id, ...shared }: ProjectConfig) {
    const { delimiter } = this.config;

    const downloadResponse: {
      bundle_url: string;
      project_id: string;
    } = await this.lokaliseApi.files.download(id, {
      bundle_structure: '%LANG_ISO%',
      export_empty_as: 'empty',
      format: 'json',
      indentation: '2sp',
      original_filenames: false,
      placeholder_format: 'i18n',
      plural_format: 'i18next',
      replace_breaks: false,
      ...shared,
    });

    const locales = await fetchLocales(downloadResponse.bundle_url);

    const hasAlreadyFetchedProject = this.locales.length > 0;

    if (hasAlreadyFetchedProject) {
      const existedLanguages = this.locales.map(locale => locale.language);

      if (existedLanguages.length !== locales.length) {
        logMessage(`Projects have different languages`, 'warning');
      }

      locales.forEach(locale => {
        if (!existedLanguages.includes(locale.language)) {
          logMessage(
            `Projects have different languages ${locale.language}`,
            'warning',
          );
        }
      });
    }

    if (prefix) {
      locales.forEach(locale => locale.addPrefixToKeys(prefix));
    }

    if (delimiter) {
      locales.forEach(locale => (locale.delimiter = delimiter));
    }

    locales.forEach(locale => {
      this.addLocale(locale);
    });
  }

  private addLocale(locale: Locale) {
    const oldLocale = this.getLocale(locale.language);

    if (oldLocale) {
      oldLocale.addTranslations(locale.getTranslations());
    } else {
      this.locales.push(locale);
    }
  }

  private getLocale(language: string): Locale | undefined {
    return this.locales.find(locale => locale.language === language);
  }
}
