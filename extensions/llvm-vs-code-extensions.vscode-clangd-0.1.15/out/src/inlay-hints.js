"use strict";
// This file implements the client side of clangd's inlay hints
// extension to LSP: https://clangd.llvm.org/extensions#inlay-hints
//
// The feature allows the server to provide the client with inline
// annotations to display for e.g. parameter names at call sites.
// The client-side implementation is adapted from rust-analyzer's.
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
const vscode = require("vscode");
const vscodelc = require("vscode-languageclient/node");
const clangd_context_1 = require("./clangd-context");
function activate(context) {
    const feature = new InlayHintsFeature(context);
    context.client.registerFeature(feature);
}
exports.activate = activate;
/// Protocol ///
var InlayHintKind;
(function (InlayHintKind) {
    InlayHintKind["Parameter"] = "parameter";
    InlayHintKind["Type"] = "type";
})(InlayHintKind || (InlayHintKind = {}));
var InlayHintsRequest;
(function (InlayHintsRequest) {
    InlayHintsRequest.type = new vscodelc.RequestType('clangd/inlayHints');
})(InlayHintsRequest || (InlayHintsRequest = {}));
/// Conversion to VSCode decorations ///
function hintsToDecorations(hints, conv) {
    var result = new Map();
    for (const hint of hints) {
        if (!result.has(hint.kind))
            result.set(hint.kind, []);
        result.get(hint.kind).push({
            range: conv.asRange(hint.range),
            renderOptions: { [hintSide(hint)]: { contentText: hint.label } }
        });
    }
    return result;
}
function positionEq(a, b) {
    return a.character == b.character && a.line == b.line;
}
function hintSide(hint) {
    // clangd only sends 'position' values that are one of the range endpoints.
    if (hint.position) {
        if (positionEq(hint.position, hint.range.start))
            return 'before';
        if (positionEq(hint.position, hint.range.end))
            return 'after';
    }
    // An earlier version of clangd's protocol sent range, but not position.
    // The kind should determine whether the position is the start or end.
    // These kinds were emitted at the time.
    if (hint.kind == InlayHintKind.Parameter)
        return 'before';
    if (hint.kind == InlayHintKind.Type)
        return 'after';
    // This shouldn't happen: old servers shouldn't send any other kinds.
    return 'before';
}
function decorationType(_kind) {
    // FIXME: kind ignored for now.
    const fg = new vscode.ThemeColor('clangd.inlayHints.foreground');
    const bg = new vscode.ThemeColor('clangd.inlayHints.background');
    const attachmentOpts = {
        color: fg,
        backgroundColor: bg,
        fontStyle: 'normal',
        fontWeight: 'normal',
        textDecoration: ';font-size:smaller',
    };
    return vscode.window.createTextEditorDecorationType({ before: attachmentOpts, after: attachmentOpts });
}
const enabledSetting = 'editor.inlayHints.enabled';
class InlayHintsFeature {
    constructor(context) {
        this.context = context;
        this.enabled = false;
        this.sourceFiles = new Map(); // keys are URIs
        this.decorationTypes = new Map();
        this.disposables = [];
    }
    fillClientCapabilities(_capabilities) { }
    fillInitializeParams(_params) { }
    initialize(capabilities, _documentSelector) {
        const serverCapabilities = capabilities;
        if (serverCapabilities.clangdInlayHintsProvider) {
            // The command provides a quick way to toggle inlay hints (key-bindable).
            // FIXME: this is a core VSCode setting, ideally they provide the command.
            // We toggle it globally, language-specific is nicer but undiscoverable.
            this.context.subscriptions.push(vscode.commands.registerCommand('clangd.inlayHints.toggle', () => {
                const current = vscode.workspace.getConfiguration().get(enabledSetting, false);
                vscode.workspace.getConfiguration().update(enabledSetting, !current, vscode.ConfigurationTarget.Global);
            }));
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(enabledSetting))
                    this.checkEnabled();
            });
            this.checkEnabled();
        }
    }
    checkEnabled() {
        const enabled = vscode.workspace.getConfiguration().get(enabledSetting, false);
        if (enabled == this.enabled)
            return;
        this.enabled = enabled;
        enabled ? this.startShowingHints() : this.stopShowingHints();
    }
    onDidCloseTextDocument(document) {
        var _a;
        if (!this.enabled)
            return;
        // Drop state for any file that is now closed.
        const uri = document.uri.toString();
        const file = this.sourceFiles.get(uri);
        if (file) {
            (_a = file.inlaysRequest) === null || _a === void 0 ? void 0 : _a.cancel();
            this.sourceFiles.delete(uri);
        }
    }
    onDidChangeVisibleTextEditors() {
        if (!this.enabled)
            return;
        // When an editor is made visible we have no inlay hints.
        // Obtain and render them, either from the cache or by issuing a request.
        // (This is redundant for already-visible editors, we could detect that).
        this.context.visibleClangdEditors.forEach((editor) => __awaiter(this, void 0, void 0, function* () { this.update(editor.document); }));
    }
    onDidChangeTextDocument({ contentChanges, document }) {
        if (!this.enabled || contentChanges.length === 0 ||
            !clangd_context_1.isClangdDocument(document))
            return;
        this.update(document);
    }
    dispose() { this.stopShowingHints(); }
    startShowingHints() {
        vscode.window.onDidChangeVisibleTextEditors(this.onDidChangeVisibleTextEditors, this, this.disposables);
        vscode.workspace.onDidCloseTextDocument(this.onDidCloseTextDocument, this, this.disposables);
        vscode.workspace.onDidChangeTextDocument(this.onDidChangeTextDocument, this, this.disposables);
        this.onDidChangeVisibleTextEditors();
    }
    stopShowingHints() {
        this.sourceFiles.forEach(file => { var _a; return (_a = file.inlaysRequest) === null || _a === void 0 ? void 0 : _a.cancel(); });
        this.context.visibleClangdEditors.forEach(editor => this.renderDecorations(editor, new Map()));
        this.disposables.forEach(d => d.dispose());
    }
    renderDecorations(editor, decorations) {
        for (const kind of decorations.keys())
            if (!this.decorationTypes.has(kind))
                this.decorationTypes.set(kind, decorationType(kind));
        // Overwrite every kind we ever saw, so we are sure to clear stale hints.
        for (const [kind, type] of this.decorationTypes)
            editor.setDecorations(type, decorations.get(kind) || []);
    }
    // Update cached and displayed inlays for a document.
    update(document) {
        return __awaiter(this, void 0, void 0, function* () {
            const uri = document.uri.toString();
            if (!this.sourceFiles.has(uri))
                this.sourceFiles.set(uri, {
                    cachedDecorations: null,
                    cachedDecorationsVersion: null,
                    inlaysRequest: null
                });
            const file = this.sourceFiles.get(uri);
            // Invalidate the cache if the file content doesn't match.
            if (document.version != file.cachedDecorationsVersion)
                file.cachedDecorations = null;
            // Fetch inlays if we don't have them.
            if (!file.cachedDecorations) {
                const requestVersion = document.version;
                yield this.fetchHints(uri, file).then(hints => {
                    if (!hints)
                        return;
                    file.cachedDecorations = hintsToDecorations(hints, this.context.client.protocol2CodeConverter);
                    file.cachedDecorationsVersion = requestVersion;
                });
            }
            // And apply them to the editor.
            for (const editor of this.context.visibleClangdEditors) {
                if (editor.document.uri.toString() == uri) {
                    if (file.cachedDecorations &&
                        file.cachedDecorationsVersion == editor.document.version)
                        this.renderDecorations(editor, file.cachedDecorations);
                }
            }
        });
    }
    fetchHints(uri, file) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = file.inlaysRequest) === null || _a === void 0 ? void 0 : _a.cancel();
            const tokenSource = new vscode.CancellationTokenSource();
            file.inlaysRequest = tokenSource;
            const request = { textDocument: { uri } };
            return this.context.client.sendRequest(InlayHintsRequest.type, request, tokenSource.token);
        });
    }
}
//# sourceMappingURL=inlay-hints.js.map