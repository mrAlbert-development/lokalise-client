"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LokaliseClient = void 0;
var tslib_1 = require("tslib");
var node_api_1 = require("@lokalise/node-api");
var files_1 = require("./api/files");
var utils_1 = require("./utils");
/* tslint:disable:no-var-requires */
// datocms api uses require and does not support imports
var SiteClient = require('datocms-client').SiteClient;
var LokaliseClient = /** @class */ (function () {
    function LokaliseClient(config) {
        this.locales = [];
        this.lokaliseApi = new node_api_1.LokaliseApi({
            apiKey: config.token,
        });
        this.config = config;
    }
    LokaliseClient.prototype.pushTranslationsToDatoCMS = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var error_1;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.datoApiToken) {
                            utils_1.logMessage('Missing DatoCMS API token in configuration', 'error');
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.all(this.config.projects.map(function (projectConfig) { return _this.pushProjectTranslationsToDato(projectConfig); }))];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        utils_1.logMessage(error_1, 'error');
                        console.error(error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    LokaliseClient.prototype.pushProjectTranslationsToDato = function (_a) {
        var id = _a.id;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var maxGetKeysLimitAllowed, keys, e_1;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        maxGetKeysLimitAllowed = 5000;
                        return [4 /*yield*/, this.lokaliseApi.keys.list({
                                project_id: id,
                                filter_tags: 'dato',
                                limit: maxGetKeysLimitAllowed,
                            })];
                    case 1:
                        keys = _b.sent();
                        utils_1.logMessage("Loaded " + keys.length + " keys", 'success');
                        return [4 /*yield*/, this.fetchTranslationsForAllProjects()];
                    case 2:
                        _b.sent();
                        keys.forEach(function (key) {
                            try {
                                key.parsed_custom_attributes = JSON.parse(key.custom_attributes);
                            }
                            catch (e) {
                                utils_1.logMessage("Unable to parse custom attributes for key " + key.key_name.web, 'error');
                            }
                        });
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, Promise.all(keys
                                .filter(function (key) { return key.parsed_custom_attributes; })
                                .map(function (key) { return _this.updateFieldInDato(key.key_name.web, key.parsed_custom_attributes.datoRecordId, key.parsed_custom_attributes.datoFieldName); }))];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _b.sent();
                        utils_1.logMessage('Unable to push translations to DatoCMS', 'error');
                        throw e_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    LokaliseClient.prototype.updateFieldInDato = function (key, recordId, fieldName) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var newRecordValue, isLocaleSupportedByDato, client, newFieldValue;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newRecordValue = {};
                        isLocaleSupportedByDato = function (locale) { return locale.datoCmsISOLocale; };
                        this.locales.filter(isLocaleSupportedByDato).forEach(function (locale) {
                            newRecordValue["" + locale.datoCmsISOLocale] = locale.getTranslation(key) || '';
                        });
                        client = new SiteClient(this.config.datoApiToken);
                        newFieldValue = {};
                        newFieldValue[fieldName] = newRecordValue;
                        return [4 /*yield*/, client.items.update(recordId.toString(), newFieldValue)];
                    case 1:
                        _a.sent();
                        utils_1.logMessage("Updated key " + key + " on record and field " + recordId + "." + fieldName, 'success');
                        return [2 /*return*/];
                }
            });
        });
    };
    LokaliseClient.prototype.fetchTranslations = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, clean, declaration, dist, prefix, useFlat, error_2;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.config, clean = _a.clean, declaration = _a.declaration, dist = _a.dist, prefix = _a.prefix, useFlat = _a.useFlat;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.fetchTranslationsForAllProjects()];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _b.sent();
                        utils_1.logMessage(error_2, 'error');
                        return [2 /*return*/];
                    case 4:
                        if (clean) {
                            utils_1.removeDirectory(dist);
                        }
                        this.locales.forEach(function (locale) {
                            utils_1.saveJsonToFile(dist + "/" + locale.language, (prefix || '') + "index.json", locale.getTranslations(useFlat));
                            utils_1.logMessage("Translations were saved " + locale.language + ". Translations count: " + locale.getTranslationsCount(), 'success');
                        });
                        if (declaration) {
                            utils_1.saveFile(declaration.dist + "/types", 'index.ts', this.locales[0].getTypes());
                            utils_1.logMessage("Declaration file was saved", 'success');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    LokaliseClient.prototype.fetchTranslationsForAllProjects = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var error_3;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all(this.config.projects.map(function (projectConfig) { return _this.fetchProject(projectConfig); }))];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        throw new Error('Fetching translations failed');
                    case 3:
                        if (this.locales.length === 0) {
                            throw new Error('Translations are empty');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    LokaliseClient.prototype.fetchProject = function (_a) {
        var prefix = _a.prefix, id = _a.id, shared = tslib_1.__rest(_a, ["prefix", "id"]);
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var delimiter, downloadResponse, locales, hasAlreadyFetchedProject, existedLanguages_1;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        delimiter = this.config.delimiter;
                        return [4 /*yield*/, this.lokaliseApi.files.download(id, tslib_1.__assign({ bundle_structure: '%LANG_ISO%', export_empty_as: 'empty', format: 'json', indentation: '2sp', original_filenames: false, placeholder_format: 'i18n', plural_format: 'i18next', replace_breaks: false }, shared))];
                    case 1:
                        downloadResponse = _b.sent();
                        return [4 /*yield*/, files_1.fetchLocales(downloadResponse.bundle_url)];
                    case 2:
                        locales = _b.sent();
                        hasAlreadyFetchedProject = this.locales.length > 0;
                        if (hasAlreadyFetchedProject) {
                            existedLanguages_1 = this.locales.map(function (locale) { return locale.language; });
                            if (existedLanguages_1.length !== locales.length) {
                                utils_1.logMessage("Projects have different languages", 'warning');
                            }
                            locales.forEach(function (locale) {
                                if (!existedLanguages_1.includes(locale.language)) {
                                    utils_1.logMessage("Projects have different languages " + locale.language, 'warning');
                                }
                            });
                        }
                        if (prefix) {
                            locales.forEach(function (locale) { return locale.addPrefixToKeys(prefix); });
                        }
                        if (delimiter) {
                            locales.forEach(function (locale) { return (locale.delimiter = delimiter); });
                        }
                        locales.forEach(function (locale) {
                            _this.addLocale(locale);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    LokaliseClient.prototype.addLocale = function (locale) {
        var oldLocale = this.getLocale(locale.language);
        if (oldLocale) {
            oldLocale.addTranslations(locale.getTranslations());
        }
        else {
            this.locales.push(locale);
        }
    };
    LokaliseClient.prototype.getLocale = function (language) {
        return this.locales.find(function (locale) { return locale.language === language; });
    };
    return LokaliseClient;
}());
exports.LokaliseClient = LokaliseClient;
//# sourceMappingURL=client.js.map