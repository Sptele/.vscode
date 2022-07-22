"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = void 0;
const vscode = require("vscode");
const cache_1 = require("./cache");
function quickPickCustom(items) {
    return new Promise((resolve, _reject) => {
        const quickPick = vscode.window.createQuickPick();
        quickPick.title = 'Enter keywords for snippet search (e.g. "read file")';
        quickPick.items = items;
        quickPick.onDidChangeValue(() => {
            quickPick.activeItems = [];
        });
        quickPick.onDidAccept(() => {
            let search = "";
            if (quickPick.activeItems.length) {
                search = quickPick.activeItems[0]["label"];
            }
            else {
                search = quickPick.value;
            }
            quickPick.hide();
            resolve(search);
        });
        quickPick.show();
    });
}
function query(language) {
    return __awaiter(this, void 0, void 0, function* () {
        let suggestions = cache_1.cache.state.get(`snippet_suggestions_${language}`, []);
        let suggestionsQuickItems = [];
        for (let key in suggestions) {
            let tempQuickItem = {
                label: suggestions[key],
                description: ""
            };
            suggestionsQuickItems.push(tempQuickItem);
        }
        let input = yield quickPickCustom(suggestionsQuickItems);
        suggestions.push(input);
        cache_1.cache.state.update(`snippet_suggestions_${language}`, suggestions.sort());
        return input;
    });
}
exports.query = query;
//# sourceMappingURL=query.js.map