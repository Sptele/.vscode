"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class GrepperPanel {
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._panel = panel;
        this._extensionUri = extensionUri;
        // Set the webview's initial html content
        this._update();
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Update the content based on view changes
        this._panel.onDidChangeViewState(e => {
            if (this._panel.visible) {
                this._update();
            }
        }, null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(message => {
            if (message.action == "reload") {
                GrepperPanel.createOrShow(extensionUri, GrepperPanel.context, GrepperPanel.search_term, "");
                return;
            }
            if (message.action == "changeTitle") {
                this._panel.title = message.title;
                GrepperPanel.search_term = message.title;
                //GrepperPanel.createOrShow(extensionUri, GrepperPanel.context, GrepperPanel.search_term,"");
                return;
            }
            if (message.action == "alert") {
                vscode.window.showErrorMessage(message.message);
                return;
            }
            if (message.action == "closeWindow") {
                this.dispose();
                return;
            }
        }, null, this._disposables);
    }
    static createOrShow(extensionUri, context, search_term, answer_text) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // If we already have a panel, show it.
        if (GrepperPanel.currentPanel) {
            GrepperPanel.currentPanel.dispose();
            //GrepperPanel.currentPanel._update();
            //GrepperPanel.currentPanel._panel.reveal(column);
            //GrepperPanel.currentPanel._panel.title=search_term;
            // GrepperPanel.currentPanel.init_search(context,search_term);
            //return;
        }
        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(GrepperPanel.viewType, search_term, vscode.ViewColumn.Two, this.getWebviewOptions(extensionUri));
        GrepperPanel.context = context;
        GrepperPanel.search_term = search_term;
        GrepperPanel.currentPanel = new GrepperPanel(panel, extensionUri);
        GrepperPanel.currentPanel.init_search(context, search_term, answer_text);
    }
    init_search(context, search_term, answer_text) {
        let grepper_user_id = context.globalState.get("grepper_user_id");
        let grepper_access_token = context.globalState.get("grepper_access_token");
        let grepper_user_langs = context.globalState.get("grepper_user_langs");
        let mediaPath = this._panel.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', ''));
        const editor = vscode.window.activeTextEditor;
        let language = editor === null || editor === void 0 ? void 0 : editor.document.languageId;
        console.log("language is");
        console.log(language);
        this._panel.webview.postMessage({
            command: 'init',
            grepper_user_id: grepper_user_id,
            grepper_access_token: grepper_access_token,
            grepper_user_langs: grepper_user_langs,
            search_term: search_term,
            language: language,
            answer_text: answer_text,
            mediaPath: mediaPath.toString()
        });
    }
    static revive(panel, extensionUri) {
        GrepperPanel.currentPanel = new GrepperPanel(panel, extensionUri);
    }
    doRefactor() {
        // Send a message to the webview webview.
        // You can send any JSON serializable data.
        this._panel.webview.postMessage({ command: 'refactor' });
    }
    dispose() {
        GrepperPanel.currentPanel = undefined;
        // Clean up our resources
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    _update() {
        const webview = this._panel.webview;
        // Vary the webview's content based on where it is located in the editor.
        switch (this._panel.viewColumn) {
            case vscode.ViewColumn.Two:
                this._updateForCat(webview);
                return;
            case vscode.ViewColumn.Three:
                this._updateForCat(webview);
                return;
            case vscode.ViewColumn.One:
            default:
                this._updateForCat(webview);
                return;
        }
    }
    static getWebviewOptions(extensionUri) {
        return {
            // Enable javascript in the webview
            enableScripts: true,
            // And restrict the webview to only loading content from our extension's `media` directory.
            localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
        };
    }
    _updateForCat(webview) {
        //this._panel.title = "";
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }
    _getHtmlForWebview(webview) {
        // Local path to main script run in the webview
        const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'content.js');
        const scriptPathOnDisk2 = vscode.Uri.joinPath(this._extensionUri, 'media', 'prism.js');
        // And the uri we use to load this script in the webview
        const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
        const scriptUri2 = webview.asWebviewUri(scriptPathOnDisk2);
        // Local path to css styles
        const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css');
        const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css');
        const grepperStylePathMainPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css');
        const grepperStylePathMainPath2 = vscode.Uri.joinPath(this._extensionUri, 'media', 'prism.css');
        const grepperStylePathMainPath3 = vscode.Uri.joinPath(this._extensionUri, 'media', 'codemirror.css');
        const grepperStylePathMainPath4 = vscode.Uri.joinPath(this._extensionUri, 'media', 'prism-okaidia.css');
        // Uri to load styles into webview
        const stylesResetUri = webview.asWebviewUri(styleResetPath);
        const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);
        const grepperStylePathMainPathUri = webview.asWebviewUri(grepperStylePathMainPath);
        const grepperStylePathMainPathUri2 = webview.asWebviewUri(grepperStylePathMainPath2);
        const grepperStylePathMainPathUri3 = webview.asWebviewUri(grepperStylePathMainPath3);
        const grepperStylePathMainPathUri4 = webview.asWebviewUri(grepperStylePathMainPath4);
        // Use a nonce to only allow specific scripts to be run
        return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<!--<link href="${stylesResetUri}" rel="stylesheet">-->
			<!--<link href="${stylesMainUri}" rel="stylesheet">-->
		
			<link href="${grepperStylePathMainPathUri2}" rel="stylesheet">
			<link href="${grepperStylePathMainPathUri3}" rel="stylesheet">
			<link href="${grepperStylePathMainPathUri4}" rel="stylesheet">
			<link href="${grepperStylePathMainPathUri}" rel="stylesheet">

			<title>Cat Coding</title>
		</head>
		<body>
			<h1 id="grepper_title_1">Grepper Search</h1>
			<div id="search"></div>
			<div id="no_answers_message"></div>
			<script src="${scriptUri}"></script>
			<script src="${scriptUri2}"></script>
		</body>
		</html>`;
    }
}
exports.default = GrepperPanel;
GrepperPanel.viewType = 'grepperAnswersListView';
GrepperPanel.context = undefined;
GrepperPanel.search_term = undefined;
GrepperPanel.answer_text = undefined;
//# sourceMappingURL=grepperwebview.js.map