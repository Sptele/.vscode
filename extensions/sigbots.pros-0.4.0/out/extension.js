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
exports.deactivate = exports.activate = exports.getProsTerminal = exports.output = exports.system = void 0;
const vscode = require("vscode");
const path = require("path");
const tree_view_1 = require("./views/tree-view");
const welcome_view_1 = require("./views/welcome-view");
const commands_1 = require("./commands");
const editor_1 = require("./views/editor");
const ga_1 = require("./ga");
const install_1 = require("./one-click/install");
const util_1 = require("util");
let analytics;
exports.output = vscode.window.createOutputChannel("PROS Output");
/// Get a reference to the "PROS Terminal" VSCode terminal used for running
/// commands.
const getProsTerminal = (context) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const prosTerminals = vscode.window.terminals.filter((t) => t.name === "PROS Terminal");
    if (prosTerminals.length > 1) {
        // Clean up duplicate terminals
        prosTerminals.slice(1).forEach((t) => t.dispose());
    }
    // Create a new PROS Terminal if one doesn't exist
    if (prosTerminals.length) {
        const options = prosTerminals[0].creationOptions;
        if ((_b = (_a = options === null || options === void 0 ? void 0 : options.env) === null || _a === void 0 ? void 0 : _a.PATH) === null || _b === void 0 ? void 0 : _b.includes("pros-cli")) {
            // Only keep the existing terminal if it has the correct path
            return prosTerminals[0];
        }
    }
    yield install_1.configurePaths(context);
    return vscode.window.createTerminal({
        name: "PROS Terminal",
        env: process.env,
    });
});
exports.getProsTerminal = getProsTerminal;
function activate(context) {
    analytics = new ga_1.Analytics(context);
    install_1.configurePaths(context);
    workspaceContainsProjectPros().then((isProsProject) => {
        vscode.commands.executeCommand("setContext", "pros.isPROSProject", isProsProject);
        if (isProsProject) {
            exports.getProsTerminal(context).then((terminal) => {
                terminal.sendText("pros build-compile-commands");
            });
        }
    });
    if (vscode.workspace
        .getConfiguration("pros")
        .get("showWelcomeOnStartup")) {
        vscode.commands.executeCommand("pros.welcome");
    }
    vscode.commands.registerCommand("pros.install", () => __awaiter(this, void 0, void 0, function* () {
        analytics.sendAction("install");
        yield install_1.install(context);
    }));
    vscode.commands.registerCommand("pros.uninstall", () => __awaiter(this, void 0, void 0, function* () {
        analytics.sendAction("uninstall");
        yield install_1.uninstall(context);
    }));
    vscode.commands.registerCommand("pros.updatecli", () => __awaiter(this, void 0, void 0, function* () {
        analytics.sendAction("updatecli");
        yield install_1.updateCLI(context);
    }));
    vscode.commands.registerCommand("pros.verify", () => __awaiter(this, void 0, void 0, function* () {
        analytics.sendAction("verify");
        yield install_1.cleanup(context);
    }));
    vscode.commands.registerCommand("pros.build&upload", () => __awaiter(this, void 0, void 0, function* () {
        analytics.sendAction("build&upload");
        yield commands_1.buildUpload();
    }));
    vscode.commands.registerCommand("pros.upload", () => __awaiter(this, void 0, void 0, function* () {
        analytics.sendAction("upload");
        yield commands_1.upload();
    }));
    vscode.commands.registerCommand("pros.build", () => __awaiter(this, void 0, void 0, function* () {
        analytics.sendAction("build");
        yield commands_1.build();
    }));
    vscode.commands.registerCommand("pros.clean", commands_1.clean);
    vscode.commands.registerCommand("pros.terminal", () => __awaiter(this, void 0, void 0, function* () {
        analytics.sendAction("serialterminal");
        try {
            const terminal = yield exports.getProsTerminal(context);
            terminal.sendText("pros terminal");
            terminal.show();
        }
        catch (err) {
            vscode.window.showErrorMessage(err.message);
        }
    }));
    vscode.commands.registerCommand("pros.showterminal", () => __awaiter(this, void 0, void 0, function* () {
        analytics.sendAction("showterminal");
        try {
            const terminal = yield exports.getProsTerminal(context);
            terminal.show();
            vscode.window.showInformationMessage("PROS Terminal started!");
        }
        catch (err) {
            vscode.window.showErrorMessage(err.message);
        }
    }));
    vscode.commands.registerCommand("pros.capture", () => __awaiter(this, void 0, void 0, function* () {
        analytics.sendAction("capture");
        yield commands_1.capture();
    }));
    vscode.commands.registerCommand("pros.upgrade", () => {
        analytics.sendAction("upgrade");
        commands_1.upgradeProject();
    });
    vscode.commands.registerCommand("pros.new", () => {
        analytics.sendAction("projectCreated");
        commands_1.createNewProject();
    });
    vscode.commands.registerCommand("pros.welcome", () => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        analytics.sendPageview("welcome");
        const panel = vscode.window.createWebviewPanel("welcome", "Welcome", vscode.ViewColumn.One, {
            enableScripts: true,
        });
        panel.iconPath = vscode.Uri.file(path.join(context.extensionPath, "media", "pros-color-icon.png"));
        const onDiskPath = vscode.Uri.file(path.join(context.extensionPath, "media", "welcome.css"));
        const cssPath = panel.webview.asWebviewUri(onDiskPath);
        const imgHeaderPath = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "media", "pros-horiz-white.png")));
        const imgIconPath = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "media", "tree-view.png")));
        const imgActionPath = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "media", "quick-action.png")));
        const imgProjectProsPath = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "media", "project-view.png")));
        const jsPath = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "media", "welcome.js")));
        const newKernel = yield welcome_view_1.fetchKernelVersionNonCLIDependent();
        const newCli = yield welcome_view_1.fetchCliVersion();
        const useGoogleAnalytics = (_a = vscode.workspace
            .getConfiguration("pros")
            .get("useGoogleAnalytics")) !== null && _a !== void 0 ? _a : false;
        const showWelcomeOnStartup = (_b = vscode.workspace
            .getConfiguration("pros")
            .get("showWelcomeOnStartup")) !== null && _b !== void 0 ? _b : false;
        panel.webview.html = welcome_view_1.getWebviewContent(cssPath, jsPath, imgHeaderPath, imgIconPath, imgActionPath, imgProjectProsPath, newKernel, newCli, useGoogleAnalytics, showWelcomeOnStartup, context);
        panel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
            yield vscode.workspace
                .getConfiguration("pros")
                .update(message.command, message.value, true);
        }));
    }));
    vscode.window.registerTreeDataProvider("prosTreeview", new tree_view_1.TreeDataProvider());
    if (vscode.workspace
        .getConfiguration("pros")
        .get("showInstallOnStartup")) {
        install_1.install(context);
    }
    // heuristic to add new files to the compilation database without requiring a full build
    vscode.workspace.onDidCreateFiles((event) => __awaiter(this, void 0, void 0, function* () {
        var _c;
        // terminate early if there's no pros project or workspace folder open
        if (!(yield workspaceContainsProjectPros()) ||
            !vscode.workspace.workspaceFolders) {
            return;
        }
        const workspaceRootUri = vscode.workspace.workspaceFolders[0].uri;
        const compilationDbUri = vscode.Uri.joinPath(workspaceRootUri, "compile_commands.json");
        // first check if the cdb exists. if not, attempt to build the project to generate it
        try {
            yield vscode.workspace.fs.stat(compilationDbUri);
        }
        catch (_d) {
            yield vscode.commands.executeCommand("pros.clean");
            yield vscode.commands.executeCommand("pros.build");
            // after building, check for cdb again. if still not present then just abandon the heuristic
            try {
                yield vscode.workspace.fs.stat(compilationDbUri);
            }
            catch (_e) {
                return;
            }
        }
        // now we know there is a cdb present, we can load it
        const compilationDbData = JSON.parse(new util_1.TextDecoder().decode(yield vscode.workspace.fs.readFile(compilationDbUri)));
        let compilationDbDirty = false;
        const mainArgs = (_c = compilationDbData.find((entry) => entry.file === "src/main.cpp")) === null || _c === void 0 ? void 0 : _c.arguments;
        // if for some reason there isn't an entry for main.cpp then i give up
        if (!mainArgs) {
            return;
        }
        for (let file of event.files) {
            // the cdb only has entries for source files
            if (file.fsPath.includes("src")) {
                // since the cdb encodes the file as a relative path we have to do the same for the files given to us by the event
                const thisFileRelative = path.relative(workspaceRootUri.path, file.path);
                // anyway, if there is already an entry for this file somehow, just skip it
                if (compilationDbData.find((entry) => entry.file === thisFileRelative)) {
                    continue;
                }
                // pop object file and source file from the compiler arguments list from the copy we saved of the args for main.cpp
                const [_objFile, _srcFile, ...args] = mainArgs.reverse();
                // create an entry for this file
                compilationDbData.push({
                    arguments: [
                        ...args.reverse(),
                        `${thisFileRelative.replace("src", "bin")}.o`,
                        thisFileRelative,
                    ],
                    directory: workspaceRootUri.path,
                    file: thisFileRelative,
                });
                // mark the cdb dirty
                compilationDbDirty = true;
            }
        }
        // write changes back to the cdb if there are any
        if (compilationDbDirty) {
            yield vscode.workspace.fs.writeFile(compilationDbUri, new util_1.TextEncoder().encode(JSON.stringify(compilationDbData, undefined, 4)));
        }
    }));
    context.subscriptions.push(editor_1.ProsProjectEditorProvider.register(context));
}
exports.activate = activate;
function deactivate() {
    analytics.endSession();
}
exports.deactivate = deactivate;
function workspaceContainsProjectPros() {
    return __awaiter(this, void 0, void 0, function* () {
        const filename = "project.pros";
        if (vscode.workspace.workspaceFolders === undefined ||
            vscode.workspace.workspaceFolders === null) {
            return false;
        }
        let exists = true;
        try {
            // By using VSCode's stat function (and the uri parsing functions), this code should work regardless
            // of if the workspace is using a physical file system or not.
            const workspaceUri = vscode.workspace.workspaceFolders[0].uri;
            const uriString = `${workspaceUri.scheme}:${workspaceUri.path}/${filename}`;
            const uri = vscode.Uri.parse(uriString);
            yield vscode.workspace.fs.stat(uri);
        }
        catch (e) {
            console.error(e);
            exists = false;
        }
        return exists;
    });
}
//# sourceMappingURL=extension.js.map