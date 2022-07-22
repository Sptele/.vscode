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
exports.decodeRequest = exports.encodeRequest = void 0;
const vscode = require("vscode");
class AnswersProvider {
    /**
     *
     * @param {vscode.Uri} uri - a fake uri
     * @returns {string} - Code Snippet
     **/
    provideTextDocumentContent(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            let request = decodeRequest(uri);
            return request.docData;
        });
    }
}
exports.default = AnswersProvider;
function encodeRequest(query, language, docData) {
    const data = JSON.stringify({
        query: query,
        language: language,
        docData
    });
    return vscode.Uri.parse(`answers:[${language}] ${query} (1)?${data}`);
}
exports.encodeRequest = encodeRequest;
function decodeRequest(uri) {
    let obj = JSON.parse(uri.query);
    return obj;
}
exports.decodeRequest = decodeRequest;
//# sourceMappingURL=provider.js.map