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
exports.getInstallPromptTitle = exports.getCurrentVersion = exports.getCliVersion = void 0;
const child_process = require("child_process");
const util_1 = require("util");
const path_1 = require("./path");
var fetch = require("node-fetch");
function getCliVersion(url) {
    return __awaiter(this, void 0, void 0, function* () {
        // Fetch the url
        const response = yield fetch(url);
        if (!response.ok) {
            console.log(response.url, response.status, response.statusText);
            throw new Error(`Can't fetch release: ${response.statusText}`);
        }
        // Get the version number from the returned json
        var vString = (yield response.json()).tag_name;
        return vString;
    });
}
exports.getCliVersion = getCliVersion;
function getCurrentVersion(oneClickPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(oneClickPath);
            const { stdout, stderr } = yield util_1.promisify(child_process.exec)(`${oneClickPath} --version`, {
                env: Object.assign(Object.assign({}, process.env), { PATH: path_1.getChildProcessPath() }),
            });
            const versionint = +stdout
                .replace("pros, version ", "")
                .replace(/\./gi, "");
            return [versionint, true];
        }
        catch (_a) {
            try {
                const { stdout, stderr } = yield util_1.promisify(child_process.exec)(`pros --version`, {
                    env: Object.assign(Object.assign({}, process.env), { PATH: path_1.getChildProcessPath() }),
                });
                const versionint = +stdout
                    .replace("pros, version ", "")
                    .replace(/\./gi, "");
                return [versionint, false];
            }
            catch (err) {
                console.log(`Error fetching PROS CLI version: ${err}`);
                return [-1, false];
            }
        }
    });
}
exports.getCurrentVersion = getCurrentVersion;
function getInstallPromptTitle(oneClickPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const recent = +(yield getCliVersion("https://api.github.com/repos/purduesigbots/pros-cli/releases/latest")).replace(/\./gi, "");
        const [version, oneClicked] = yield getCurrentVersion(oneClickPath);
        if (!oneClicked && version === -1) {
            return "You do not have the PROS CLI installed. Install it now? (Recommended).";
        }
        else if (oneClicked && version >= recent) {
            return "PROS is up to date!";
        }
        else if (oneClicked && version < recent) {
            return "There is an update available! Would you like to update now?";
        }
        else if (version >= recent) {
            return "PROS detected but not installed with VSCode. Would you like to install using VSCode? (Recommended).";
        }
        else {
            return "An outdated version of PROS was detected on your system, not installed through VS Code. Would you like to install the update with VS Code?";
        }
    });
}
exports.getInstallPromptTitle = getInstallPromptTitle;
//# sourceMappingURL=installed.js.map