"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logMessage = exports.removeDirectory = exports.saveFile = exports.saveJsonToFile = void 0;
var tslib_1 = require("tslib");
var fs_1 = tslib_1.__importDefault(require("fs"));
var path_1 = tslib_1.__importDefault(require("path"));
var shelljs_1 = tslib_1.__importDefault(require("shelljs"));
function saveJsonToFile(dir, fileName, json) {
    saveFile(dir, fileName, JSON.stringify(json, undefined, 2));
}
exports.saveJsonToFile = saveJsonToFile;
function saveFile(dir, fileName, content) {
    if (!fs_1.default.existsSync(dir)) {
        shelljs_1.default.mkdir('-p', dir);
    }
    fs_1.default.writeFileSync(path_1.default.resolve(process.cwd(), dir, fileName), content);
}
exports.saveFile = saveFile;
function removeDirectory(dir) {
    fs_1.default.rmdirSync(dir, { recursive: true });
}
exports.removeDirectory = removeDirectory;
function logMessage(message, level) {
    var prefix = '[lokalise-client]';
    if (level === 'success') {
        console.debug("\u001B[32m " + prefix + " Success! " + message + " \u001B[0m");
    }
    if (level === 'error') {
        console.error("\u001B[31m " + prefix + " Error! " + message + " \u001B[0m");
    }
    if (level === 'warning') {
        console.warn("\u001B[33m " + prefix + " Warning! " + message + " \u001B[0m");
    }
}
exports.logMessage = logMessage;
//# sourceMappingURL=index.js.map