"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveJsonToFile = saveJsonToFile;
exports.saveFile = saveFile;
exports.removeDirectory = removeDirectory;
exports.logMessage = logMessage;
var tslib_1 = require("tslib");
var fs_1 = tslib_1.__importDefault(require("fs"));
var path_1 = tslib_1.__importDefault(require("path"));
var shelljs_1 = tslib_1.__importDefault(require("shelljs"));
function saveJsonToFile(dir, fileName, json) {
    saveFile(dir, fileName, JSON.stringify(json, undefined, 2));
}
function saveFile(dir, fileName, content) {
    if (!fs_1.default.existsSync(dir)) {
        shelljs_1.default.mkdir('-p', dir);
    }
    fs_1.default.writeFileSync(path_1.default.resolve(process.cwd(), dir, fileName), content);
}
function removeDirectory(dir) {
    fs_1.default.rmSync(dir, { recursive: true });
}
function logMessage(message, level) {
    var prefix = '[lokalise-client]';
    if (level === 'success') {
        console.debug("\u001B[32m ".concat(prefix, " Success! ").concat(message, " \u001B[0m"));
    }
    if (level === 'error') {
        console.error("\u001B[31m ".concat(prefix, " Error! ").concat(message, " \u001B[0m"));
    }
    if (level === 'warning') {
        console.warn("\u001B[33m ".concat(prefix, " Warning! ").concat(message, " \u001B[0m"));
    }
}
//# sourceMappingURL=index.js.map