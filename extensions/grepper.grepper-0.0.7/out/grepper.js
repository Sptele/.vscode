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
exports.search = exports.check_auth = exports.addAnswer = exports.grepperSearch = void 0;
const vscode = require("vscode");
const vscode_1 = require("vscode");
const axios_1 = require("axios");
const provider_1 = require("./provider");
const qs = require('qs');
function getCurrentLanguage() {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode_1.window.activeTextEditor;
        let language = editor === null || editor === void 0 ? void 0 : editor.document.languageId;
        return language;
    });
}
function getCurrentText() {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode_1.window.activeTextEditor;
        console.log(vscode_1.window.activeTextEditor);
        let text = editor === null || editor === void 0 ? void 0 : editor.document.getText(editor.selection);
        return { text, type: editor === null || editor === void 0 ? void 0 : editor.document.languageId };
    });
}
function grepperSearch(search_term, context) {
    return __awaiter(this, void 0, void 0, function* () {
        let grepper_access_token = context.globalState.get("grepper_access_token");
        let grepper_user_id = context.globalState.get("grepper_user_id");
        let query = encodeURI(search_term.replace(/ /g, "+"));
        let url = "https://www.codegrepper.com/api/vscode_get_answers.php?v=2&s=" + query + "&u=" + grepper_user_id + "&HTTP_X_AUTH_TOKEN=" + grepper_access_token + "&HTTP_X_AUTH_ID=" + grepper_user_id;
        let res = yield axios_1.default.get(url);
        return res;
    });
}
exports.grepperSearch = grepperSearch;
function addAnswer(context) {
    return __awaiter(this, void 0, void 0, function* () {
        let grepper_user_id = context.globalState.get("grepper_user_id");
        let grepper_access_token = context.globalState.get("grepper_access_token");
        let language = yield getCurrentLanguage();
        let answer_snippet = yield getCurrentText();
        const answer_title = yield vscode_1.window.showInputBox({ placeHolder: 'Search Term:' });
        if (answer_title === undefined) {
            console.log("I am undefined.");
            return;
        }
        let postData = {
            answer: answer_snippet.text,
            user_id: grepper_user_id,
            codeSearch: { search: answer_title },
            source: 11,
            language: language,
            source_url: ""
        };
        //	'content-type': 'application/x-www-form-urlencoded',
        let res = yield axios_1.default({
            method: "POST",
            headers: {
                "x-auth-id": grepper_user_id,
                "x-auth-token": grepper_access_token
            },
            url: "https://www.codegrepper.com/api/save_answer.php",
            data: JSON.stringify(postData)
        });
    });
}
exports.addAnswer = addAnswer;
function check_auth(context) {
    return __awaiter(this, void 0, void 0, function* () {
        //todo: figure out good flow for this
        if (!context.globalState.get("grepper_access_token")) {
            const grepper_email = yield vscode_1.window.showInputBox({ placeHolder: 'Please input your Grepper Email' });
            const grepper_password = yield vscode_1.window.showInputBox({ placeHolder: 'Please input your Grepper Password' });
            if (grepper_email === undefined) {
                console.log("I am undefined.");
                return;
            }
            if (grepper_password === undefined) {
                console.log("I am undefined.");
                return;
            }
            let postData = { "email": "", "password": "" };
            postData.email = grepper_email;
            postData.password = grepper_password;
            let res = yield axios_1.default({
                method: "POST",
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                url: "https://www.codegrepper.com/api/login.php",
                data: qs.stringify(postData)
            });
            console.log(res.data);
            if (res.data.access_token) {
                context.globalState.update("grepper_access_token", res.data.access_token);
                context.globalState.update("grepper_user_id", res.data.user_id);
            }
        }
    });
}
exports.check_auth = check_auth;
function search(context) {
    return __awaiter(this, void 0, void 0, function* () {
        //context.globalState.update("grepper_key","asdfkljlsadf");
        console.log("context is:");
        console.log(context);
        //console.log(this);
        const search_term = yield vscode_1.window.showInputBox({
            //value: '',
            //valueSelection: [2, 4],
            placeHolder: 'javascript loop through array' //,
            //validateInput: text => {
            //	window.showInformationMessage(`Validating: ${text}`);
            //	return text === '123' ? 'Not 123!' : null;
            //}
        });
        if (search_term === undefined) {
            console.log("I am undefined.");
            return;
        }
        //let answers = doRequest("js loop");
        let answers = yield grepperSearch(search_term, context);
        if (answers.data.answers.length < 1) {
            return;
        }
        function dateToNiceDayString(myDate) {
            var month = new Array();
            month[0] = "Jan";
            month[1] = "Feb";
            month[2] = "Mar";
            month[3] = "Apr";
            month[4] = "May";
            month[5] = "Jun";
            month[6] = "Jul";
            month[7] = "Aug";
            month[8] = "Sep";
            month[9] = "Oct";
            month[10] = "Nov";
            month[11] = "Dec";
            var hours = myDate.getHours();
            var minutes = myDate.getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = hours + ':' + minutes + ampm;
            //return myDate.getDate()+" "+month[myDate.getMonth()]+" "+myDate.getFullYear()+" "+strTime;
            return month[myDate.getMonth()] + " " + myDate.getDate() + " " + myDate.getFullYear();
        }
        function capitalizeFirstLetter(s) {
            return s.charAt(0).toUpperCase() + s.slice(1);
        }
        let answersF = answers.data.answers;
        let docData = "";
        for (let i = 0; i < answersF.length; i++) {
            let username = answersF[i].fun_name;
            var t = answersF[i].created_at.split(/[- :]/);
            var d = new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]));
            var formattedDate = dateToNiceDayString(d);
            docData += "//------------------------------------------------------------------------------\n";
            docData += "// “" + answersF[i].term + "”" + " " + capitalizeFirstLetter(answersF[i].language) + " by " + username + " on " + formattedDate + "\n";
            docData += "//------------------------------------------------------------------------------\n";
            docData += answersF[i].answer;
            docData += "\n\n";
        }
        //docData = docData.replace(/^\s+|\s+$/g, '');
        docData = docData.slice(0, -2);
        //let docData = answers.data.answers[0].answer;
        let language = answers.data.answers[0].language;
        let uri = provider_1.encodeRequest(search_term, language, docData);
        let doc = yield vscode.workspace.openTextDocument(uri);
        try {
            doc = yield vscode.languages.setTextDocumentLanguage(doc, language);
        }
        catch (e) {
            console.log(`Cannot set document language to ${language}: ${e}`);
        }
        yield vscode.window.showTextDocument(doc, {
            viewColumn: vscode.ViewColumn.Two,
            preview: true,
            preserveFocus: true
        });
        console.log('done showing doc');
    });
}
exports.search = search;
//# sourceMappingURL=grepper.js.map