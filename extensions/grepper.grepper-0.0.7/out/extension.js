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
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const provider_1 = require("./provider");
const grepperwebview_1 = require("./grepperwebview");
const greppersideview_1 = require("./greppersideview");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "grepper-vscode" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    //register with grepper 
    //let disposable = vscode.commands.registerCommand('grepper-vscode.grepper',() => grepper.search(context));
    context.subscriptions.push(vscode.commands.registerCommand('grepper-vscode.addGrepperAnswer', () => {
        //grepper.addAnswer(context))
        const editor = vscode.window.activeTextEditor;
        let answer_text = editor === null || editor === void 0 ? void 0 : editor.document.getText(editor.selection);
        grepperwebview_1.default.createOrShow(context.extensionUri, context, "", answer_text);
    }));
    context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider("answers", new provider_1.default()));
    context.subscriptions.push(vscode.commands.registerCommand('grepper-vscode.grepper', () => __awaiter(this, void 0, void 0, function* () {
        //await grepper.check_auth(context);
        const search_term = yield vscode.window.showInputBox({
            placeHolder: 'Enter Search Term:' //,
        });
        if (search_term === undefined) {
            return;
        }
        grepperwebview_1.default.createOrShow(context.extensionUri, context, search_term, "");
    })));
    vscode.window.registerWebviewPanelSerializer(grepperwebview_1.default.viewType, {
        deserializeWebviewPanel(webviewPanel, state) {
            return __awaiter(this, void 0, void 0, function* () {
                // Reset the webview options so we use latest uri for `localResourceRoots`.
                webviewPanel.webview.options = grepperwebview_1.default.getWebviewOptions(context.extensionUri);
                grepperwebview_1.default.revive(webviewPanel, context.extensionUri);
            });
        }
    });
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(greppersideview_1.default.viewType, new greppersideview_1.default(context.extensionUri, context)));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map