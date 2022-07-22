"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChildProcessProsToolchainPath = exports.getChildProcessPath = exports.getIntegratedTerminalPaths = void 0;
const path = require("path");
const os = require("os");
const install_1 = require("./install");
// Returns the path to the PROS CLI and PROS toolchain.
// These paths should only be used in the integrated terminal, for some unknown
// reason the spaces in the paths need to be escaped differently when running
// outside the integrated terminal.
const getIntegratedTerminalPaths = (context) => {
    const globalPath = context.globalStorageUri.fsPath;
    const system = install_1.getOperatingSystem();
    // path to cli
    let cliExecPath = `${path.join(globalPath, "install", `pros-cli-${system}`)}`;
    // path to toolchain
    let toolchainPath = path.join(globalPath, "install", `pros-toolchain-${system === "windows" ? path.join("windows", "usr") : system}`);
    if (system === "macos" && !os.cpus()[0].model.includes("Apple M")) {
        // Escape spaces in paths on Intel Mac
        cliExecPath = cliExecPath.replace(/(\s+)/g, "\\$1");
        toolchainPath = toolchainPath.replace(/(\s+)/g, "\\$1");
    }
    return [cliExecPath, toolchainPath];
};
exports.getIntegratedTerminalPaths = getIntegratedTerminalPaths;
// Returns the path to the PROS CLI.
// This path should only be used in `child_process.exec` calls, not the
// integrated terminal.
const getChildProcessPath = () => {
    let path = process.env["PATH"];
    if (install_1.getOperatingSystem() === "macos") {
        path = `"${path === null || path === void 0 ? void 0 : path.replace(/\\/g, "")}"`;
    }
    return path;
};
exports.getChildProcessPath = getChildProcessPath;
// Returns the path to the PROS Toolchain.
// This path should only be used in `child_process.exec` calls, not the
// integrated terminal.
const getChildProcessProsToolchainPath = () => {
    let toolchainPath = process.env["PROS_TOOLCHAIN"];
    if (install_1.getOperatingSystem() === "macos") {
        toolchainPath = `${toolchainPath === null || toolchainPath === void 0 ? void 0 : toolchainPath.replace(/\\/g, "")}`;
    }
    return toolchainPath;
};
exports.getChildProcessProsToolchainPath = getChildProcessProsToolchainPath;
//# sourceMappingURL=path.js.map