"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.read = exports.toast = exports.debug = exports.release = exports.id = exports.name = void 0;
const vscode = require("vscode");
exports.name = "Zeng's Color-picker";
exports.id = "zeng-color-picker";
exports.release = true;
function debug(message, ...optionalParams) {
    if (!exports.release) {
        console.log(message, ...optionalParams);
    }
}
exports.debug = debug;
function toast(message, ...items) {
    if (!exports.release) {
        vscode.window.showInformationMessage(message, ...items);
    }
}
exports.toast = toast;
function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('!', '(?=(^|\\b|$))');
}
function read() {
    const cfg = vscode.workspace.getConfiguration("zeng-color-picker");
    const insert = cfg.get("Picker.InsertAfterPick") || "";
    const detectors = cfg.get("Preview.MatchPatterns") || [];
    const langs = cfg.get("Filter.ApplyForTheseLanguages") || "";
    const files = cfg.get("Filter.ApplyForTheseFiles") || "";
    let detectRegexs = [];
    for (let i = 0; i < detectors.length; i++) {
        const d = escapeRegExp(detectors[i]);
        const re = new RegExp(d.replace(/[RGBAW]/g, "([0-9a-fA-F])"), 'g');
        detectRegexs[i] = re;
    }
    let insertRegexs = [];
    for (let i = 0; i < detectors.length; i++) {
        const d = escapeRegExp(detectors[i]);
        const re = new RegExp('^' + d.replace(/[RGBAW]/g, "([0-9a-fA-F])") + '$');
        insertRegexs[i] = re;
    }
    let langlist = [];
    for (const lang of langs.split(',')) {
        if (lang) {
            langlist.push(lang);
        }
    }
    let filelist = [];
    for (const file of files.split(' ')) {
        if (file) {
            filelist.push(file);
        }
    }
    return {
        insert: insert,
        detectors: detectors,
        detectRegexs: detectRegexs,
        insertRegexs: insertRegexs,
        langs: langlist,
        files: filelist,
    };
}
exports.read = read;
//# sourceMappingURL=config.js.map