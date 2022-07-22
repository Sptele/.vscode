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
exports.upload = void 0;
const vscode = require("vscode");
const child_process = require("child_process");
const util_1 = require("util");
const cli_parsing_1 = require("./cli-parsing");
const install_1 = require("../one-click/install");
const path_1 = require("../one-click/path");
/**
 * Call the PROS upload CLI command.
 *
 * @param slot The slot number to place the executable in
 */
const setVariables = () => __awaiter(void 0, void 0, void 0, function* () {
    // Set PROS_TOOLCHAIN if one-click installed
    if (!(install_1.TOOLCHAIN === "LOCAL")) {
        process.env.PROS_TOOLCHAIN = install_1.TOOLCHAIN;
    }
    // Set pros executable path
    process.env.PATH += install_1.PATH_SEP + install_1.CLI_EXEC_PATH;
    // Set language variable
    process.env.LC_ALL = "en_US.utf-8";
});
const runUpload = () => __awaiter(void 0, void 0, void 0, function* () {
    yield vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Uploading Project",
        cancellable: false,
    }, (progress, token) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            // Command to run to upload project to brain
            var command = `pros u --project "${(_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath}" --machine-output ${process.env["VSCODE FLAGS"]}`;
            console.log(command);
            const { stdout, stderr } = yield util_1.promisify(child_process.exec)(command, {
                encoding: "utf8",
                maxBuffer: 1024 * 1024 * 50,
                env: Object.assign(Object.assign({}, process.env), { PATH: path_1.getChildProcessPath() }),
            });
            vscode.window.showInformationMessage("Project Uploaded!");
        }
        catch (error) {
            // Parse and display error message if one occured
            throw new Error(cli_parsing_1.parseErrorMessage(error.stdout));
        }
    }));
});
const upload = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Set environmental variables
        // Run upload command
        yield runUpload();
    }
    catch (err) {
        yield vscode.window.showErrorMessage(err.message);
    }
});
exports.upload = upload;
//# sourceMappingURL=upload.js.map