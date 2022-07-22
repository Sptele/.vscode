"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Analytics = void 0;
const vscode = require("vscode");
const ua = require("universal-analytics");
const CID_KEY = "installed-packages:pros-vscode:ga-cid";
const GA_TID = "UA-84548828-7";
class Analytics {
    constructor(context) {
        this.el = "pros-vscode";
        this.startSession = () => {
            var _a, _b;
            (_b = (_a = this.visitor) === null || _a === void 0 ? void 0 : _a.event("session", "start_session", this.el, 1, {
                sc: "start",
                nonInteraction: true,
                aip: true,
            })) === null || _b === void 0 ? void 0 : _b.send();
        };
        this.endSession = () => {
            var _a, _b;
            (_b = (_a = this.visitor) === null || _a === void 0 ? void 0 : _a.event("session", "end_session", this.el, 0, {
                sc: "end",
                nonInteraction: true,
                aip: true,
            })) === null || _b === void 0 ? void 0 : _b.send();
        };
        this.sendAction = (type) => {
            var _a;
            (_a = this.visitor) === null || _a === void 0 ? void 0 : _a.event("action", type, this.el);
        };
        this.sendPageview = (page) => {
            var _a, _b;
            (_b = (_a = this.visitor) === null || _a === void 0 ? void 0 : _a.pageview(page, "https://pros.cs.purdue.edu", page)) === null || _b === void 0 ? void 0 : _b.send();
        };
        if (!vscode.workspace
            .getConfiguration("pros")
            .get("useGoogleAnalytics")) {
            // don't set the UA visitor if the user has turned off telemetry
            return;
        }
        const cid = context.globalState.get(CID_KEY);
        if (!cid) {
            // We do not yet have a client ID for this install
            this.visitor = ua(GA_TID);
            context.globalState.update(CID_KEY, this.visitor.cid);
        }
        else {
            this.visitor = ua(GA_TID, cid);
        }
        this.startSession();
    }
}
exports.Analytics = Analytics;
//# sourceMappingURL=ga.js.map