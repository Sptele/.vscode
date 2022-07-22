"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseErrorMessage = exports.parseMakeOutput = exports.PREFIX = void 0;
exports.PREFIX = "Uc&42BWAaQ";
const extension_1 = require("../extension");
/**
 * Finds the logging message that contains the error message.
 *
 * @param error The error thrown by the Node child process
 * @returns A user-friendly message to display
 */
const parseMakeOutput = (stdout) => {
    const errorSplit = stdout.split(/\r?\n/);
    for (let e of errorSplit) {
        if (!e.startsWith(exports.PREFIX)) {
            continue;
        }
        let jdata = JSON.parse(e.substr(exports.PREFIX.length));
        if (jdata.type.startsWith("log") && jdata.level === "ERROR") {
            return jdata.simpleMessage;
        }
        else if (jdata.type.startsWith("notify") && String(jdata.text).includes("ERROR")) {
            var errors = false;
            extension_1.output.appendLine('\n********************************\n');
            for (let err of errorSplit) {
                if (err.substr(exports.PREFIX.length).startsWith("{\"text")) {
                    e = JSON.parse(err.substr(exports.PREFIX.length)).text;
                    const regex = new RegExp('[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))', 'g');
                    extension_1.output.appendLine(e.replace(regex, ''));
                    errors = true;
                }
            }
            return "Build Failed! See PROS output for details!";
        }
    }
};
exports.parseMakeOutput = parseMakeOutput;
const parseErrorMessage = (stdout) => {
    const errorSplit = stdout.split(/\r?\n/);
    let err = "NOERROR";
    for (let e of errorSplit) {
        if (!e.startsWith(exports.PREFIX)) {
            continue;
        }
        let jdata = JSON.parse(e.substr(exports.PREFIX.length));
        if (jdata.type.startsWith("log") && jdata.level === "ERROR") {
            console.log(jdata.simpleMessage);
            err = jdata.simpleMessage;
        }
    }
    return err;
};
exports.parseErrorMessage = parseErrorMessage;
//# sourceMappingURL=cli-parsing.js.map