"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLocales = void 0;
var tslib_1 = require("tslib");
var decompress_1 = tslib_1.__importDefault(require("decompress"));
var https_1 = tslib_1.__importDefault(require("https"));
var locale_1 = require("../locale");
var utils_1 = require("../utils");
function fetchLocales(url) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var response, buffer, files;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getZipFile(url)];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, mapZipFileToBuffer(response)];
                case 2:
                    buffer = _a.sent();
                    return [4 /*yield*/, decompress_1.default(buffer)];
                case 3:
                    files = _a.sent();
                    return [2 /*return*/, files.reduce(function (acc, file) {
                            var locale = mapFileToLocale(file);
                            if (locale) {
                                acc.push(locale);
                            }
                            return acc;
                        }, [])];
            }
        });
    });
}
exports.fetchLocales = fetchLocales;
function getZipFile(url) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    https_1.default.get(url, function (res) {
                        resolve(res);
                    });
                })];
        });
    });
}
function mapZipFileToBuffer(incomingMessage) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    var data = [];
                    incomingMessage
                        .on('data', function (chunk) { return data.push(chunk); })
                        .on('end', function () {
                        resolve(Buffer.concat(data));
                    });
                })];
        });
    });
}
function mapFileToLocale(file) {
    if (file.type !== 'file') {
        return;
    }
    try {
        return new locale_1.Locale(file.path, JSON.parse(file.data.toString('utf8')));
    }
    catch (error) {
        utils_1.logMessage(file.path, 'error');
        utils_1.logMessage(error, 'error');
    }
}
//# sourceMappingURL=files.js.map