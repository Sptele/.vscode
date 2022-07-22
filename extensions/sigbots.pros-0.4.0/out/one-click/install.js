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
exports.configurePaths = exports.cleanup = exports.updateCLI = exports.install = exports.uninstall = exports.removeDirAsync = exports.getOperatingSystem = exports.PATH_SEP = exports.CLI_EXEC_PATH = exports.TOOLCHAIN = void 0;
const vscode = require("vscode");
const path = require("path");
const os = require("os");
const download_1 = require("./download");
const installed_1 = require("./installed");
const fs = require("fs");
const util_1 = require("util");
const child_process = require("child_process");
const path_1 = require("./path");
const getOperatingSystem = () => {
    if (process.platform === "win32") {
        return "windows";
    }
    if (process.platform === "darwin") {
        return "macos";
    }
    return "linux";
};
exports.getOperatingSystem = getOperatingSystem;
function removeDirAsync(directory, begin) {
    return __awaiter(this, void 0, void 0, function* () {
        // get all files in directory
        if (begin) {
            vscode.window.showInformationMessage("Clearing directory");
        }
        const files = yield fs.promises.readdir(directory);
        if (files.length > 0) {
            // iterate through found files and directory
            for (const file of files) {
                if ((yield fs.promises.lstat(path.join(directory, file))).isDirectory()) {
                    // if the file is found to be a directory,
                    // recursively call this function to remove subdirectory
                    yield removeDirAsync(path.join(directory, file), false);
                }
                else {
                    //delete the file
                    yield fs.promises.unlink(path.join(directory, file));
                }
            }
        }
        // delete the directory now that it is empty.
        yield fs.promises.rmdir(directory, { recursive: true, maxRetries: 20 });
        return true;
    });
}
exports.removeDirAsync = removeDirAsync;
function uninstall(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const globalPath = context.globalStorageUri.fsPath;
        const title = "Are you sure you want to uninstall PROS?";
        const labelResponse = yield vscode.window.showInformationMessage(title, "Uninstall Now!", "No Thanks.");
        if (labelResponse === "Uninstall Now!") {
            yield vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Uninstalling PROS",
                cancellable: false,
            }, (progress, token) => __awaiter(this, void 0, void 0, function* () {
                yield removeDirAsync(globalPath, false);
            }));
            vscode.window.showInformationMessage("PROS Uninstalled!");
        }
    });
}
exports.uninstall = uninstall;
function getUrls(version) {
    return __awaiter(this, void 0, void 0, function* () {
        var downloadCli = `https://github.com/purduesigbots/pros-cli/releases/download/${version}/pros_cli-${version}-lin-64bit.zip`;
        var downloadToolchain = "https://developer.arm.com/-/media/Files/downloads/gnu-rm/10.3-2021.10/gcc-arm-none-eabi-10.3-2021.10-x86_64-linux.tar.bz2";
        if (exports.getOperatingSystem() === "windows") {
            // Set system, path seperator, and downloads to windows version
            downloadCli = `https://github.com/purduesigbots/pros-cli/releases/download/${version}/pros_cli-${version}-win-64bit.zip`;
            downloadToolchain =
                "https://artprodcus3.artifacts.visualstudio.com/A268c8aad-3bb0-47d2-9a57-cf06a843d2e8/3a3f509b-ad80-4d2a-8bba-174ad5fd1dde/_apis/artifact/cGlwZWxpbmVhcnRpZmFjdDovL3B1cmR1ZS1hY20tc2lnYm90cy9wcm9qZWN0SWQvM2EzZjUwOWItYWQ4MC00ZDJhLThiYmEtMTc0YWQ1ZmQxZGRlL2J1aWxkSWQvMjg4Ni9hcnRpZmFjdE5hbWUvdG9vbGNoYWluLTY0Yml00/content?format=file&subPath=%2Fpros-toolchain-w64-3.0.1-standalone.zip";
        }
        else if (exports.getOperatingSystem() === "macos") {
            // Set system, path seperator, and downloads to windows version
            downloadCli = `https://github.com/purduesigbots/pros-cli/releases/download/${version}/pros_cli-${version}-macos-64bit.zip`;
            downloadToolchain =
                "https://developer.arm.com/-/media/Files/downloads/gnu-rm/10.3-2021.10/gcc-arm-none-eabi-10.3-2021.10-mac.tar.bz2";
            os.cpus().some((cpu) => {
                if (cpu.model.includes("Apple M")) {
                    downloadCli = `https://github.com/purduesigbots/pros-cli/releases/download/${version}/pros_cli-${version}-macos-arm64bit.zip`;
                }
            });
        }
        return [downloadCli, downloadToolchain];
    });
}
function install(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const globalPath = context.globalStorageUri.fsPath;
        const system = exports.getOperatingSystem();
        var version = yield installed_1.getCliVersion("https://api.github.com/repos/purduesigbots/pros-cli/releases/latest");
        console.log("Latest Available CLI Version: " + version);
        // Get system type, path string separator, CLI download url, and toolchain download url.
        // Default variables are based on linux.
        let [downloadCli, downloadToolchain] = yield getUrls(version);
        // Set the installed file names
        var cliName = `pros-cli-${system}.zip`;
        // Title of prompt depending on user's installed CLI
        var title = yield installed_1.getInstallPromptTitle(path.join(`"${path.join(globalPath, "install", `pros-cli-${system}`)}"`, "pros"));
        // Name of toolchain download depending on system
        var toolchainName = `pros-toolchain-${system === "windows" ? `${system}.zip` : `${system}.tar.bz2`}`;
        // Does the user's CLI have an update or does the user need to install/update
        const cliVersion = title.includes("up to date") ? "UTD" : null;
        if (cliVersion === null) {
            // Ask user to install CLI if it is not installed.
            const labelResponse = yield vscode.window.showInformationMessage(title, "Install it now!", "No Thanks.");
            if (labelResponse === "Install it now!") {
                // Install CLI if user chooses to.
                //delete the directory
                try {
                    yield removeDirAsync(context.globalStorageUri.fsPath, false);
                }
                catch (err) {
                    console.log(err);
                }
                //add install and download directories
                const dirs = yield createDirs(context.globalStorageUri.fsPath);
                const promises = [
                    download_1.downloadextract(context, downloadCli, cliName),
                    download_1.downloadextract(context, downloadToolchain, toolchainName),
                ];
                yield Promise.all(promises);
                yield cleanup(context, system);
                vscode.workspace
                    .getConfiguration("pros")
                    .update("showInstallOnStartup", false);
            }
            else {
                vscode.workspace
                    .getConfiguration("pros")
                    .update("showInstallOnStartup", false);
            }
        }
        else {
            // User already has the CLI installed
            vscode.window.showInformationMessage(title);
            vscode.workspace
                .getConfiguration("pros")
                .update("showInstallOnStartup", false);
        }
    });
}
exports.install = install;
function updateCLI(context, force = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const globalPath = context.globalStorageUri.fsPath;
        const system = exports.getOperatingSystem();
        if (!force) {
            var title = yield installed_1.getInstallPromptTitle(path.join(globalPath, "install", `pros-cli-${system}`, "pros"));
            if (title.includes("up to date")) {
                vscode.window.showInformationMessage(title);
                return;
            }
            if (title.includes("not")) {
                yield install(context);
                return;
            }
            const labelResponse = yield vscode.window.showInformationMessage(title, "Update Now!", "No Thanks.");
            if (labelResponse === null || labelResponse === void 0 ? void 0 : labelResponse.toLowerCase().includes("no thanks")) {
                return;
            }
        }
        try {
            yield removeDirAsync(path.join(globalPath, "install", `pros-cli-${system}`), false);
        }
        catch (err) {
            console.log(err);
        }
        var version = yield installed_1.getCliVersion("https://api.github.com/repos/purduesigbots/pros-cli/releases/latest");
        let [downloadCli, downloadToolchain] = yield getUrls(version);
        // Set the installed file names
        var cliName = `pros-cli-${system}.zip`;
        // Title of prompt depending on user's installed CLI
        yield download_1.downloadextract(context, downloadCli, cliName);
        yield cleanup(context, system);
    });
}
exports.updateCLI = updateCLI;
function createDirs(storagePath) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create the download and install subdirectories
        const install = path.join(storagePath, "install");
        const download = path.join(storagePath, "download");
        for (const dir of [install, download]) {
            yield fs.promises.mkdir(dir, { recursive: true });
        }
        // Return the two created directories
        return { install: install, download: download };
    });
}
function cleanup(context, system = exports.getOperatingSystem()) {
    return __awaiter(this, void 0, void 0, function* () {
        const globalPath = context.globalStorageUri.fsPath;
        yield configurePaths(context);
        yield vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Verifying Installation",
            cancellable: true,
        }, (progress, token) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield download_1.chmod(globalPath, system);
                yield configurePaths(context);
                // Ensure that toolchain and cli are working
                const cliSuccess = yield verifyCli();
                const toolchainSuccess = yield verifyToolchain();
                if (cliSuccess && toolchainSuccess) {
                    vscode.window.showInformationMessage("CLI and Toolchain are working!");
                }
                else {
                    vscode.window.showErrorMessage(`${cliSuccess ? "" : "CLI"} ${!cliSuccess && !toolchainSuccess ? "" : "and"} ${toolchainSuccess ? "" : "Toolchain"} Installation Failed!`);
                    vscode.window.showInformationMessage(`Please try installing again! If this problem persists, consider trying an alternative install method: https://pros.cs.purdue.edu/v5/getting-started/${system}.html`);
                }
            }
            catch (err) {
                vscode.window.showInformationMessage("ERROR DURING VERIFICATION");
                console.log(err);
            }
        }));
    });
}
exports.cleanup = cleanup;
function configurePaths(context) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const [cliExecPath, toolchainPath] = path_1.getIntegratedTerminalPaths(context);
        // return if the path is already configured
        if (((_a = process.env["PATH"]) === null || _a === void 0 ? void 0 : _a.includes(cliExecPath)) &&
            ((_b = process.env["PROS_TOOLCHAIN"]) === null || _b === void 0 ? void 0 : _b.includes(toolchainPath))) {
            console.log("path already configured");
            return;
        }
        const addQuotes = !(exports.getOperatingSystem() === "macos" && !os.cpus()[0].model.includes("Apple M"));
        // Check if user has CLI installed through one-click or other means.
        let [version, isOneClickInstall] = yield installed_1.getCurrentVersion(path.join(`${addQuotes ? `"` : ""}${cliExecPath}${addQuotes ? `"` : ""}`, "pros"));
        process.env["VSCODE FLAGS"] =
            version >= 324 ? "--no-sentry --no-analytics" : "";
        console.log(`${isOneClickInstall} | ${version}`);
        if (!isOneClickInstall) {
            // Use system defaults if user does not have one-click CLI
            exports.CLI_EXEC_PATH = "";
            exports.TOOLCHAIN = "LOCAL";
            return;
        }
        exports.PATH_SEP = exports.getOperatingSystem() === "windows" ? ";" : ":";
        exports.TOOLCHAIN = toolchainPath;
        // Set CLI environmental variable file location
        exports.CLI_EXEC_PATH = cliExecPath;
        // Prepend CLI and TOOLCHAIN to path
        process.env["PATH"] = `${process.env["PATH"]}${exports.PATH_SEP}${cliExecPath}${exports.PATH_SEP}${path.join(toolchainPath, "bin")}`;
        // Make PROS_TOOCLHAIN variable
        process.env["PROS_TOOLCHAIN"] = `${exports.TOOLCHAIN}`;
        process.env.LC_ALL = "en_US.utf-8";
    });
}
exports.configurePaths = configurePaths;
function verifyCli() {
    return __awaiter(this, void 0, void 0, function* () {
        var command = `pros c ls-templates --machine-output ${process.env["VSCODE FLAGS"]}`;
        const { stdout, stderr } = yield util_1.promisify(child_process.exec)(command, {
            timeout: 30000,
            env: Object.assign(Object.assign({}, process.env), { PATH: path_1.getChildProcessPath() }),
        });
        if (stderr) {
            console.log(stderr);
        }
        console.log(stdout);
        return stdout.includes(`'kernel', 'version': '3.5.4'`);
    });
}
function verifyToolchain() {
    return __awaiter(this, void 0, void 0, function* () {
        let toolchainPath = path_1.getChildProcessProsToolchainPath();
        if (!toolchainPath) {
            return false;
        }
        var command = `"${path.join(toolchainPath, "bin", "arm-none-eabi-g++")}" --version`;
        const { stdout, stderr } = yield util_1.promisify(child_process.exec)(command, {
            timeout: 5000,
            env: Object.assign(Object.assign({}, process.env), { PATH: path_1.getChildProcessPath() }),
        });
        if (stderr) {
            console.log(stderr);
        }
        return stdout.startsWith(`arm-none-eabi-g++ (GNU Arm Embedded Toolchain`);
    });
}
//# sourceMappingURL=install.js.map