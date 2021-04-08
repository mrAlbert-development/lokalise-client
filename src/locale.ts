import flatten from 'flat';
import merge from 'deepmerge';
import JsonToTS from 'json-to-ts';

export class Locale {
  public delimiter = '.';
  public readonly language: string;

  private _translations: Record<string, unknown>;

  public constructor(language: string, translations: Record<string, unknown>) {
    this.language = language;
    this._translations = translations;
  }

  public getTranslations(useFlat = false): Locale['_translations'] {
    if (useFlat) {
      return flatten(this._translations, {
        delimiter: this.delimiter,
      });
    }

    return this._translations;
  }

  public addPrefixToKeys(prefix: string): Locale['_translations'] {
    const newTranslations: Record<string, unknown> = {};

    Object.keys(this._translations).forEach(key => {
      newTranslations[`${prefix}${key}`] = this._translations[key];
    });

    this._translations = newTranslations;

    return this._translations;
  }

  public addTranslations(
    newTranslations: Record<string, unknown>,
  ): Locale['_translations'] {
    this._translations = merge(this._translations, newTranslations);

    return this._translations;
  }

  public getTypes(): string {
    let result = '';

    const types = JsonToTS(this._translations).map(t => `export ${t}\n\n`);

    result += types.join('');

    return result;
  }

  public getTranslationsCount(): number {
    return Object.keys(this.getTranslations(true)).length;
  }
}
