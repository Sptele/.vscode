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
exports.getWebviewContent = exports.fetchCliVersion = exports.fetchKernelVersionNonCLIDependent = exports.fetchKernelVersion = void 0;
const child_process = require("child_process");
const util_1 = require("util");
const semver_1 = require("semver");
const axios_1 = require("axios");
const cli_parsing_1 = require("../commands/cli-parsing");
const nonce_1 = require("./nonce");
const path_1 = require("../one-click/path");
var fetch = require("node-fetch");
/**
 * Queries the server for the latest available library version.
 *
 * @returns The kernel library versions
 */
const fetchKernelVersion = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stdout, stderr } = yield util_1.promisify(child_process.exec)(`pros c q --target v5 --machine-output`, {
            env: Object.assign(Object.assign({}, process.env), { PATH: path_1.getChildProcessPath() }),
        });
        let newKernel = "0.0.0";
        for (let e of stdout.split(/\r?\n/)) {
            if (e.startsWith(cli_parsing_1.PREFIX)) {
                let jdata = JSON.parse(e.substr(cli_parsing_1.PREFIX.length));
                if (jdata.type === "finalize") {
                    for (let ver of jdata.data) {
                        if (ver.name === "kernel" && semver_1.gt(ver.version, newKernel)) {
                            newKernel = ver.version;
                        }
                    }
                }
            }
        }
        return newKernel;
    }
    catch (error) {
        return "0.0.0";
    }
});
exports.fetchKernelVersion = fetchKernelVersion;
const fetchKernelVersionNonCLIDependent = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch("https://api.github.com/repos/purduesigbots/pros/releases/latest");
    if (!response.ok) {
        console.log(response.url, response.status, response.statusText);
        throw new Error(`Can't fetch kernel release: ${response.statusText}`);
    }
    var v = (yield response.json()).tag_name;
    return v;
});
exports.fetchKernelVersionNonCLIDependent = fetchKernelVersionNonCLIDependent;
const fetchCliVersion = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.get("https://purduesigbots.github.io/pros-mainline/stable/UpgradeManifestV1.json");
    return `${response.data.version.major}.${response.data.version.minor}.${response.data.version.patch}`;
});
exports.fetchCliVersion = fetchCliVersion;
function getWebviewContent(styleUri, scriptUri, imgHeaderPath, imgIconPath, imgActionPath, imgProjectProsPath, newKernel, newCli, useGoogleAnalytics, showWelcomeOnStartup, context) {
    const nonce = nonce_1.getNonce();
    // install(context);
    return `
	<!DOCTYPE html>
	<html lang="en">
	   <head>
		  <link href="${styleUri}" rel="stylesheet" />
		  <title>Welcome</title>
	   </head>
	   <body>
			 <header>
			 <a class="header__link" title="Learn more about PROS" href="https://pros.cs.purdue.edu/">
				 <div class="header__logo">
					 <img class="image__logo" src="${imgHeaderPath}" />
				 </div>
			 </a>
			 <p class="header__blurb">
			 	 <a title="Open PROS on GitHub" href="https://github.com/purduesigbots/pros">Open Source</a>
				 C/C++ Development for <b>VEX V5</b> and <b>VEX Cortex</b>. PROS is a lightweight and 
				 fast alternative open source operating system for VEX EDR Microcontrollers. It features multitasking, 
				 low-level control, and Wiring compatible functions to harness the full power of the Cortex. 
				 PROS is built with developers in mind and with a focus on providing an environment for 
				 industry-applicable experience.
			 </p>
		     </header>
				<div class="body__container">
					<div class="body__content">
						<div class="body__intro">
							Welcome To <span class="bold">PROS</span>
						</div>
						<div class="body__new_versions">
							See what's new in <a href="https://pros.cs.purdue.edu/v5/releases/cli${newCli}.html">CLI ${newCli}</a> and <a href="https://pros.cs.purdue.edu/v5/releases/kernel${newKernel}.html">Kernel ${newKernel}</a>
						</div>
						<div class="body__blurb">
							Primary maintenance of PROS is done by students at Purdue University through Purdue ACM SIGBots. Inspiration for this project came from several computer science and engineering students itching to write code for VEX U's extended autonomous period. We created PROS to leverage this opportunity. 	
						</div>
						<hr>
						<div class="body__features">
							<div class="body__features_header">Features</div>
							<div class="body__features_img_left_one">Access all of the PROS commands you will need from the VSCode sidebar. Click on the PROS Icon on the sidebar for a list of common actions like Building, Uploading, Debugging, and Upgrading your project.</div>
							<div class="body__features_img_right_one"><img src="${imgIconPath}" /></div>
							<div class="body__features_img_left_two"><img src="${imgActionPath}" /></div>
							<div class="body__features_img_right_two">Quickly iterate with the PROS Quick Action button. This PROS Icon on the top right of the editor will build and upload your code.</div>
							<div class="body__features_img_left_three">Modify your project's settings easily with the project.pros custom editor. Opening the "project.pros" file at the root of your project will open this custom settings editor.</div>
							<div class="body__features_img_right_three"><img src="${imgProjectProsPath}" /></div>
						</div>
						<hr>
						<div class="body__settings">
							<div class="body__settings_header">Settings</div>
							<div class="body__settings_checkbox">
								<div><input type="checkbox" ${useGoogleAnalytics ? "checked" : ""} id="useGoogleAnalytics"/></div>
								<div><label>Send anonymous usage statistics</label></div>
							</div>
							<div class="body__settings_checkbox">
								<div><input type="checkbox" ${showWelcomeOnStartup ? "checked" : ""} id="showWelcomeOnStartup" /></div>
								<div><label>Show Welcome Guide when opening VSCode</label></div>
							</div>
						</div>
						<hr>
						<div class="body__help">
							For help, please visit:
							<ul>
								<li><a href="https://pros.cs.purdue.edu/v5/editor/index.html">This page</a> for a guide to getting started with PROS for VSCode</li>
								<li>The <a href="https://pros.cs.purdue.edu/v5/tutorials/index.html">PROS tutorial page</a> to learn about using everything from sensors to motors to tasks and multithreading in PROS.</li>
								<li>The <a href="https://pros.cs.purdue.edu/v5/api/index.html">PROS API documentation</a></li>
							</ul>
						</div>
					</div>
				</div>
		  </div>

			<script nonce="${nonce}" src="${scriptUri}"></script>
	   </body>
	</html>
	`;
}
exports.getWebviewContent = getWebviewContent;
//# sourceMappingURL=welcome-view.js.map