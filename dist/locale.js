"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Locale = void 0;
var tslib_1 = require("tslib");
var flat_1 = tslib_1.__importDefault(require("flat"));
var deepmerge_1 = tslib_1.__importDefault(require("deepmerge"));
var json_to_ts_1 = tslib_1.__importDefault(require("json-to-ts"));
var Locale = /** @class */ (function () {
    function Locale(language, translations) {
        this.delimiter = '.';
        this.language = language;
        this._translations = translations;
    }
    Locale.prototype.getTranslations = function (useFlat) {
        if (useFlat === void 0) { useFlat = false; }
        if (useFlat) {
            return flat_1.default(this._translations, {
                delimiter: this.delimiter,
            });
        }
        return this._translations;
    };
    Locale.prototype.addPrefixToKeys = function (prefix) {
        var _this = this;
        var newTranslations = {};
        Object.keys(this._translations).forEach(function (key) {
            newTranslations["" + prefix + key] = _this._translations[key];
        });
        this._translations = newTranslations;
        return this._translations;
    };
    Locale.prototype.addTranslations = function (newTranslations) {
        this._translations = deepmerge_1.default(this._translations, newTranslations);
        return this._translations;
    };
    Locale.prototype.getTypes = function () {
        var result = '';
        var types = json_to_ts_1.default(this._translations).map(function (t) { return "export " + t + "\n\n"; });
        result += types.join('');
        return result;
    };
    Locale.prototype.getTranslationsCount = function () {
        return Object.keys(this.getTranslations(true)).length;
    };
    return Locale;
}());
exports.Locale = Locale;
//# sourceMappingURL=locale.js.map