"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeDataProvider = void 0;
const vscode = require("vscode");
class TreeDataProvider {
    constructor() {
        this.data = [new TreeItem('Quick Actions', [new TreeItem('Build & Upload', undefined, 'pros.build&upload'), new TreeItem('Upload', undefined, 'pros.upload'), new TreeItem('Build', undefined, 'pros.build'), new TreeItem('Clean', undefined, 'pros.clean'), new TreeItem('Brain Terminal', undefined, 'pros.terminal'), new TreeItem('Integrated Terminal', undefined, 'pros.showterminal'), new TreeItem('Capture Image', undefined, 'pros.capture')]),
            new TreeItem('Conductor', [new TreeItem('Upgrade Project', undefined, 'pros.upgrade'), new TreeItem('Create Project', undefined, 'pros.new')]),
            new TreeItem('Other', [new TreeItem('Install PROS', undefined, 'pros.install'), new TreeItem('Uninstall PROS', undefined, 'pros.uninstall'), new TreeItem('Update PROS CLI', undefined, 'pros.updatecli'), new TreeItem('Verify PROS Installation', undefined, 'pros.verify')])];
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element === undefined) {
            return this.data;
        }
        return element.children;
    }
}
exports.TreeDataProvider = TreeDataProvider;
class TreeItem extends vscode.TreeItem {
    constructor(label, children, command) {
        super(label, children === undefined ? vscode.TreeItemCollapsibleState.None :
            vscode.TreeItemCollapsibleState.Expanded);
        if (command !== undefined) {
            this.command = {
                title: label,
                command
            };
        }
        this.children = children;
    }
}
//# sourceMappingURL=tree-view.js.map