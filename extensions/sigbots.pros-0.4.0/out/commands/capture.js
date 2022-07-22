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
exports.capture = void 0;
const vscode = require("vscode");
const child_process = require("child_process");
const path = require("path");
const util_1 = require("util");
const cli_parsing_1 = require("./cli-parsing");
const path_1 = require("../one-click/path");
const selectDirectory = () => __awaiter(void 0, void 0, void 0, function* () {
    const directoryOptions = {
        canSelectMany: false,
        title: "Select a directory where the screenshot will be saved",
        openLabel: "Save Screenshot Here",
        canSelectFolders: true,
        canSelectFiles: false,
    };
    const uri = yield vscode.window
        .showOpenDialog(directoryOptions)
        .then((uri) => {
        return uri ? uri[0].fsPath : undefined;
    });
    if (uri === undefined) {
        throw new Error();
    }
    return uri;
});
const selectFileName = () => __awaiter(void 0, void 0, void 0, function* () {
    let inputName;
    const projectNameOptions = {
        prompt: "File Name",
        placeHolder: "my-screenshot",
    };
    inputName = yield vscode.window.showInputBox(projectNameOptions);
    return (inputName ? inputName : projectNameOptions.placeHolder);
});
const runCapture = (output) => __awaiter(void 0, void 0, void 0, function* () {
    yield vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Capturing image",
        cancellable: false,
    }, (progress, token) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Command to run to clean project
            var command = `pros v5 capture ${output} --force ${process.env["VSCODE FLAGS"]} --machine-output`;
            console.log(command);
            const { stdout, stderr } = yield util_1.promisify(child_process.exec)(command, {
                timeout: 6000,
                maxBuffer: 1024 * 1024 * 10,
                env: Object.assign(Object.assign({}, process.env), { PATH: path_1.getChildProcessPath() }),
            });
            let result = cli_parsing_1.parseErrorMessage(stdout);
            if (!(result === "NOERROR")) {
                throw new Error(result);
            }
            vscode.window.showInformationMessage("Capture saved!");
        }
        catch (error) {
            throw new Error(error);
        }
    }));
});
const capture = () => __awaiter(void 0, void 0, void 0, function* () {
    let uri, fileName, output;
    try {
        uri = yield selectDirectory();
        fileName = yield selectFileName();
    }
    catch (error) {
        vscode.window.showErrorMessage("Error selecting output location");
        return;
    }
    output = path.join(uri, fileName);
    if (!output.endsWith(".png")) {
        output += ".png";
    }
    try {
        yield runCapture(output);
        yield vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(output));
    }
    catch (error) {
        vscode.window.showErrorMessage(error.message);
    }
});
exports.capture = capture;
//# sourceMappingURL=capture.js.map