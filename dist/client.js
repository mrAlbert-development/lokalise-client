"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LokaliseClient = void 0;
var tslib_1 = require("tslib");
var node_api_1 = require("@lokalise/node-api");
var files_1 = require("./api/files");
var utils_1 = require("./utils");
var LokaliseClient = /** @class */ (function () {
    function LokaliseClient(config) {
        this.locales = [];
        this.api = new node_api_1.LokaliseApi({
            apiKey: config.token,
        });
        this.config = config;
    }
    LokaliseClient.prototype.fetchTranslations = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, clean, declaration, dist, prefix, useFlat, error_1;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.config, clean = _a.clean, declaration = _a.declaration, dist = _a.dist, prefix = _a.prefix, useFlat = _a.useFlat;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.all(this.config.projects.map(function (projectConfig) {
                                return _this.fetchProject(projectConfig);
                            }))];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        utils_1.logMessage('Fetching translations was failed', 'error');
                        console.error(error_1);
                        return [2 /*return*/];
                    case 4:
                        if (this.locales.length === 0) {
                            utils_1.logMessage('Translations are empty', 'error');
                            return [2 /*return*/];
                        }
                        if (clean) {
                            utils_1.removeDirectory(dist);
                        }
                        this.locales.forEach(function (locale) {
                            utils_1.saveJsonToFile(dist, "" + (prefix || '') + locale.language + ".json", locale.getTranslations(useFlat));
                            utils_1.logMessage("Translations were saved " + locale.language + ". Translations count: " + locale.getTranslationsCount(), 'success');
                        });
                        if (declaration) {
                            utils_1.saveFile(declaration.dist, 'types.ts', this.locales[0].getTypes());
                            utils_1.logMessage("Declaration file was saved", 'success');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    LokaliseClient.prototype.fetchProject = function (_a) {
        var prefix = _a.prefix, id = _a.id, shared = tslib_1.__rest(_a, ["prefix", "id"]);
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var delimiter, response, locales, hasAlreadyFetchedProject, existedLanguages_1;
            var _this = this;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        delimiter = this.config.delimiter;
                        return [4 /*yield*/, this.api.files.download(id, tslib_1.__assign({ bundle_structure: '%LANG_ISO%', export_empty_as: 'empty', format: 'json', indentation: '2sp', original_filenames: false, placeholder_format: 'i18n', plural_format: 'i18next', replace_breaks: false }, shared))];
                    case 1:
                        response = _b.sent();
                        return [4 /*yield*/, files_1.fetchLocales(response.bundle_url)];
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