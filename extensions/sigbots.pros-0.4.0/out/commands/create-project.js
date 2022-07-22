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
exports.createNewProject = void 0;
const vscode = require("vscode");
const child_process = require("child_process");
const util_1 = require("util");
const path = require("path");
const fs = require("fs");
const cli_parsing_1 = require("./cli-parsing");
const path_1 = require("../one-click/path");
/**
 * Query the user for the directory where the project will be created.
 *
 * @returns The path to the directory where the new project will go.
 */
const selectDirectory = () => __awaiter(void 0, void 0, void 0, function* () {
    const directoryOptions = {
        canSelectMany: false,
        title: "Select a directory where the PROS Project will be created",
        openLabel: "Create Project Here",
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
/**
 * Query the user for the target device for the project.
 *
 * @returns The selected target name
 */
const selectTarget = () => __awaiter(void 0, void 0, void 0, function* () {
    const targetOptions = {
        placeHolder: "v5",
        title: "Select the target device",
    };
    const target = yield vscode.window.showQuickPick(["v5", "cortex"], targetOptions);
    if (target === undefined) {
        throw new Error();
    }
    return target;
});
/**
 * Query the user for a name for the new project.
 *
 * @returns The project's name
 */
const selectProjectName = () => __awaiter(void 0, void 0, void 0, function* () {
    const projectNameOptions = {
        prompt: "Project Name",
        placeHolder: "my-pros-project",
    };
    let projectName = yield vscode.window.showInputBox(projectNameOptions);
    if (!projectName) {
        projectName = "my-pros-project";
    }
    return projectName;
});
/**
 * Query the user for the PROS kernel version to use.
 *
 * @param target The project's target device
 * @returns A version string or "latest"
 */
const selectKernelVersion = (target) => __awaiter(void 0, void 0, void 0, function* () {
    // Command to run to fetch all kernel versions
    var command = `pros c ls-templates --target ${target} --machine-output ${process.env["VSCODE FLAGS"]}`;
    console.log(command);
    const { stdout, stderr } = yield util_1.promisify(child_process.exec)(command, {
        env: Object.assign(Object.assign({}, process.env), { PATH: path_1.getChildProcessPath() }),
    });
    let versions = [
        { label: "latest", description: "Recommended" },
    ];
    // List all kernel versions as dropdown for users to select desired version.
    for (let e of stdout.split(/\r?\n/)) {
        if (e.startsWith(cli_parsing_1.PREFIX)) {
            let jdata = JSON.parse(e.substr(cli_parsing_1.PREFIX.length));
            if (jdata.type === "finalize") {
                for (let ver of jdata.data) {
                    if (ver.name === "kernel") {
                        versions.push({ label: ver.version });
                    }
                }
            }
        }
    }
    const kernelOptions = {
        placeHolder: "latest",
        title: "Select the project version",
    };
    const version = yield vscode.window.showQuickPick(versions, kernelOptions);
    if (version === undefined) {
        throw new Error();
    }
    return version.label;
});
/**
 * Calls the project creation CLI function.
 *
 * @param uri The path where the project directory will be created
 * @param projectName The name of the new project
 * @param target The target device for the new project
 * @param version The kernel version for the new project
 * @returns The path to the newly created project
 */
const runCreateProject = (uri, projectName, target, version) => __awaiter(void 0, void 0, void 0, function* () {
    // create the project directory
    const projectPath = path.join(uri, projectName);
    yield fs.promises.mkdir(projectPath, { recursive: true });
    yield vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Downloading libraries",
        cancellable: false,
    }, (progress, token) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Command to run to make a new project with
            // user specified name, version, and location
            var command = `pros c n "${projectPath}" ${target} ${version} --machine-output --build-cache ${process.env["VSCODE FLAGS"]}`;
            console.log(command);
            const { stdout, stderr } = yield util_1.promisify(child_process.exec)(command, {
                encoding: "utf8",
                maxBuffer: 1024 * 1024 * 50,
                timeout: 30000,
                env: Object.assign(Object.assign({}, process.env), { PATH: path_1.getChildProcessPath() }),
            }
            // Not sure what the maxBuffer should be, but 1024*1024*5 was too small sometimes
            );
            if (stderr) {
                let err = cli_parsing_1.parseErrorMessage(stderr);
                if (!(err === "NOERROR")) {
                    throw new Error(err);
                }
            }
            vscode.window.showInformationMessage("Project created!");
        }
        catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }));
    return projectPath;
});
const createNewProject = () => __awaiter(void 0, void 0, void 0, function* () {
    let uri, target, projectName, version;
    try {
        uri = yield selectDirectory();
        target = yield selectTarget();
        projectName = yield selectProjectName();
        version = yield selectKernelVersion(target);
    }
    catch (err) {
        // don't do anything here, this just means that the user exited
        return;
    }
    try {
        const projectPath = yield runCreateProject(uri, projectName, target, version);
        yield vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(projectPath));
    }
    catch (err) {
        yield vscode.window.showErrorMessage(err.message);
    }
});
exports.createNewProject = createNewProject;
//# sourceMappingURL=create-project.js.map