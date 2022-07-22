"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const config = require("./config");
const picker = require("./picker");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // This line of code will only be executed once when your extension is activated
    config.debug(config.name + " is active.");
    config.toast(config.name + " is active.");
    picker.activate(config.read());
    // Apply settings as soon as changed.
    let dispose = vscode.workspace.onDidChangeConfiguration(() => {
        picker.deactivate();
        picker.activate(config.read());
    });
    context.subscriptions.push(dispose);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    picker.deactivate();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map