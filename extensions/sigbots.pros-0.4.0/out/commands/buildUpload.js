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
exports.buildUpload = void 0;
const vscode = require("vscode");
const child_process = require("child_process");
const util_1 = require("util");
const cli_parsing_1 = require("./cli-parsing");
const extension_1 = require("../extension");
const path_1 = require("../one-click/path");
/**
 * Call the PROS build CLI command.
 *
 * @param slot The slot number to place the executable in
 */
const runBuildUpload = () => __awaiter(void 0, void 0, void 0, function* () {
    yield vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Building and Uploading Project",
        cancellable: false,
    }, (progress, token) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            // Command to run to build and upload project
            var command = `pros mu --project "${(_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath}" --machine-output ${process.env["VSCODE FLAGS"]}`;
            console.log(command);
            const { stdout, stderr } = yield util_1.promisify(child_process.exec)(command, {
                env: Object.assign(Object.assign({}, process.env), { PATH: path_1.getChildProcessPath() }),
            });
            yield vscode.window.showInformationMessage("Project Built!");
        }
        catch (error) {
            if (!error.stdout.includes("No v5 ports")) {
                const rtn = yield vscode.window.showErrorMessage(cli_parsing_1.parseMakeOutput(error.stdout), "View Output!", "No Thanks!");
                if (rtn === "View Output!") {
                    extension_1.output.show();
                }
            }
            else {
                vscode.window.showErrorMessage(cli_parsing_1.parseMakeOutput(error.stdout));
            }
        }
    }));
});
const buildUpload = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield runBuildUpload();
    }
    catch (err) {
        yield vscode.window.showErrorMessage(err.message);
    }
});
exports.buildUpload = buildUpload;
//# sourceMappingURL=buildUpload.js.map