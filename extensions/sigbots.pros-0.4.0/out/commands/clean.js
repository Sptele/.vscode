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
exports.clean = void 0;
const vscode = require("vscode");
const child_process = require("child_process");
const util_1 = require("util");
const cli_parsing_1 = require("./cli-parsing");
const path_1 = require("../one-click/path");
/**
 * Call the PROS build CLI command.
 *
 * @param slot The slot number to place the executable in
 */
const runClean = () => __awaiter(void 0, void 0, void 0, function* () {
    yield vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Cleaning Project",
        cancellable: false,
    }, (progress, token) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            // Command to run to clean project
            var command = `pros make clean --project "${(_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath}" --machine-output ${process.env["VSCODE FLAGS"]}`;
            console.log(command);
            const { stdout, stderr } = yield util_1.promisify(child_process.exec)(command, {
                timeout: 30000,
                env: Object.assign(Object.assign({}, process.env), { PATH: path_1.getChildProcessPath() }),
            });
            vscode.window.showInformationMessage("Project Cleaned!");
        }
        catch (error) {
            throw new Error(cli_parsing_1.parseErrorMessage(error.stdout));
        }
    }));
});
const clean = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield runClean();
    }
    catch (err) {
        yield vscode.window.showErrorMessage(err.message);
    }
});
exports.clean = clean;
//# sourceMappingURL=clean.js.map