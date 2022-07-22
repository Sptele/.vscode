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
exports.build = void 0;
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
const runBuild = () => __awaiter(void 0, void 0, void 0, function* () {
    yield vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Building Project",
        cancellable: false,
    }, (progress, token) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            // Command to run to build project
            var command = `pros make --project "${(_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath}" --machine-output ${process.env["VSCODE FLAGS"]}`;
            console.log(command);
            console.log(process.env["PATH"]);
            const { stdout, stderr } = yield util_1.promisify(child_process.exec)(command, {
                env: Object.assign(Object.assign({}, process.env), { PATH: path_1.getChildProcessPath(), PROS_TOOLCHAIN: path_1.getChildProcessProsToolchainPath() }),
            });
            vscode.window.showInformationMessage("Project Built!");
        }
        catch (error) {
            const rtn = yield vscode.window.showErrorMessage(cli_parsing_1.parseMakeOutput(error.stdout), "View Output!", "No Thanks!");
            if (rtn === "View Output!") {
                extension_1.output.show();
            }
        }
    }));
});
const build = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield runBuild();
    }
    catch (err) {
        yield vscode.window.showErrorMessage(err.message);
    }
});
exports.build = build;
//# sourceMappingURL=build.js.map