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
exports.upgradeProject = void 0;
const vscode = require("vscode");
const child_process = require("child_process");
const util_1 = require("util");
const semver_1 = require("semver");
const cli_parsing_1 = require("./cli-parsing");
const path_1 = require("../one-click/path");
/**
 * Queries the PROS project data for the target device.
 *
 * @returns The project's target device and the associated library versions.
 */
const fetchTarget = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Command to run to fetch the current project that needs to be updated
    var command = `pros c info-project --project "${(_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.fsPath}" --machine-output ${process.env["VSCODE FLAGS"]}`;
    // console.log(command);
    const { stdout, stderr } = yield util_1.promisify(child_process.exec)(command, {
        env: Object.assign(Object.assign({}, process.env), { PATH: path_1.getChildProcessPath() }),
    });
    // Get okapi and kernel version of current project
    for (let e of stdout.split(/\r?\n/)) {
        if (e.startsWith(cli_parsing_1.PREFIX)) {
            let jdata = JSON.parse(e.substr(cli_parsing_1.PREFIX.length));
            if (jdata.type === "finalize") {
                const target = jdata.data.project.target;
                const curKernel = jdata.data.project.templates.find((t) => t.name === "kernel").version;
                const curOkapi = jdata.data.project.templates.find((t) => t.name === "okapilib").version;
                return { target, curKernel, curOkapi };
            }
        }
    }
    return { target: "", curKernel: "", curOkapi: "" };
});
/**
 * Queries the server for the latest available library versions.
 *
 * @param target The target device for this project
 * @returns The kernel and okapi (if applicable) library versions
 */
const fetchServerVersions = (target) => __awaiter(void 0, void 0, void 0, function* () {
    // Command to run to fetch latest okapi and kernel versions
    var command = `pros c q --target ${target} --machine-output ${process.env["VSCODE FLAGS"]}`;
    // console.log(command);
    const { stdout, stderr } = yield util_1.promisify(child_process.exec)(command, {
        env: Object.assign(Object.assign({}, process.env), { PATH: path_1.getChildProcessPath() }),
    });
    let newKernel = "0.0.0";
    let newOkapi = "0.0.0";
    // Set current okapi and kernel versions
    for (let e of stdout.split(/\r?\n/)) {
        if (e.startsWith(cli_parsing_1.PREFIX)) {
            let jdata = JSON.parse(e.substr(cli_parsing_1.PREFIX.length));
            if (jdata.type === "finalize") {
                for (let ver of jdata.data) {
                    if (ver.name === "kernel" && semver_1.gt(ver.version, newKernel)) {
                        newKernel = ver.version;
                    }
                    else if (ver.name === "okapilib" && semver_1.gt(ver.version, newOkapi)) {
                        newOkapi = ver.version;
                    }
                }
            }
        }
    }
    return { newKernel, newOkapi };
});
/**
 * Actually performs the upgrade to the latest library versions for the project.
 */
const runUpgrade = () => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    // Command to run to upgrade project to a newer version
    var command = `pros c u --project "${(_b = vscode.workspace.workspaceFolders) === null || _b === void 0 ? void 0 : _b[0].uri.fsPath}" --machine-output ${process.env["VSCODE FLAGS"]}`;
    console.log(command);
    const { stdout, stderr } = yield util_1.promisify(child_process.exec)(command, {
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 50,
        env: Object.assign(Object.assign({}, process.env), { PATH: path_1.getChildProcessPath() }),
    });
    const errorMessage = cli_parsing_1.parseErrorMessage(stdout);
    if (errorMessage) {
        throw new Error(errorMessage);
    }
});
/**
 * Confirms with the user that the project should be updated to the specified library versions.
 *
 * @param kernel The new kernel version
 * @param okapi The new Okapilib version
 */
const userApproval = (kernel, okapi) => __awaiter(void 0, void 0, void 0, function* () {
    // Ask for user confirmation before upgrading kernal and/or okapi version
    let title;
    if (kernel && okapi) {
        title = `Upgrade to kernel ${kernel} and Okapilib ${okapi}?`;
    }
    else if (kernel) {
        title = `Upgrade to Okapilib ${okapi}?`;
    }
    else {
        title = `Upgrade to kernel ${kernel}?`;
    }
    yield vscode.window.showQuickPick([{ label: "yes", description: "recommended" }, { label: "no" }], {
        placeHolder: "yes",
        canPickMany: false,
        title: title,
    });
});
const upgradeProject = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { target, curKernel, curOkapi } = yield fetchTarget();
        const { newKernel, newOkapi } = yield fetchServerVersions(target);
        if (curKernel === newKernel && curOkapi === newOkapi) {
            yield vscode.window.showInformationMessage("Project is up to date!");
            return;
        }
        // check to see if the update is okay?
        yield userApproval(newKernel === curKernel ? undefined : newKernel, newOkapi === curOkapi ? undefined : newOkapi);
        yield runUpgrade();
        yield vscode.window.showInformationMessage("Project updated!");
    }
    catch (err) {
        yield vscode.window.showErrorMessage(err.message);
    }
});
exports.upgradeProject = upgradeProject;
//# sourceMappingURL=upgrade-project.js.map