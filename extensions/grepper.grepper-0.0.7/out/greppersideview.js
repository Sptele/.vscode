"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const grepperwebview_1 = require("./grepperwebview");
class GrepperSideViewProvider {
    constructor(_extensionUri, context2) {
        this._extensionUri = _extensionUri;
        this.context2 = context2;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(data => {
            if (data.action == "getUser") {
                this.initPopup(webviewView.webview);
            }
            if (data.action == "saveLogin") {
                if (data.grepper_access_token) {
                    this.context2.globalState.update("grepper_access_token", data.grepper_access_token);
                    this.context2.globalState.update("grepper_user_id", data.grepper_user_id);
                    this.context2.globalState.update("grepper_user_langs", data.grepper_user_langs);
                    this.initPopup(webviewView.webview);
                }
            }
            if (data.action == "openAnswer") {
                grepperwebview_1.default.createOrShow(this.context2.extensionUri, this.context2, data.search_term, "");
            }
        });
    }
    initPopup(currentView) {
        let grepper_user_id = this.context2.globalState.get("grepper_user_id");
        let grepper_access_token = this.context2.globalState.get("grepper_access_token");
        currentView.postMessage({
            command: 'init',
            grepper_user_id: grepper_user_id,
            grepper_access_token: grepper_access_token
        });
    }
    _getHtmlForWebview(webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'popup.js'));
        // Do the same for the stylesheet.
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'popup.css'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'tays_semantic.css'));
        const grepperIconLogoImageUrl = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'img/icon128_hand.png'));
        // Use a nonce to only allow a specific script to be run.
        return `<!doctype html>
<html>
<head>
<title>Grepper</title>
<link href="${styleResetUri}" rel="stylesheet">
<link href="${styleMainUri}" rel="stylesheet">
</head>
<body>
<div id="grepper_option_buttons"></div>
<div id="logo_holder">
    <div id="grepper_logo">Grepper</div>
    <img src="${grepperIconLogoImageUrl}">
</div>

<div id="grepper_account_data" style="display:block">
<div id="grepper_profile_data">

    <div id="grepper_profile_notices_holder" style="text-align:center;display:none;">
        <a id="grepper_profile_notices" href="https://www.codegrepper.com/app/notifications.php" target="_blank">
        <div id="grepper_profile_notices_amount"></div>
        <i class="icon bell"></i>
        <span id="grepper_profile_notices_text"></span>
        </a>
    </div>
   <a id="grepper_profile_data_image_url" target="_blank" title="Edit Profile" src=""><img id="grepper_profile_data_image" src=""></a>
   <div id="grepper_profile_data_helped"> You helped <span id="devs_helped"></span> Devs solve <span id="problems_helped">10</span> problems</div>
    <!-- start belt sytem-->
    <div style="clear:both"></div>
    <div id="belt_system_holder">
        <div class="box"> <li id="overallbelt" class="belt overall">
            <div id="overall_rank">Your Dev Ranking (<span id='overall_belt_color'>White</span> Belt) </div>
        </li> </div>

        <div id="rank_privacy"> </div>
        <div id="next_belt_holder">
            <div id="next_rank">Next Belt (<span id='overall_next_belt_color'></span>)&nbsp; </div>
            <div class="belt reallysmall">
                <div id="percent_till_next"></div>
                <div id="next_belt_progress_bar" class="progress_bar" style="top:0px;opacity:.8;"></div>
             </div>
        </div>
        <!--
        <h2>Language Rankings</h2>
        <div id="language_rankings"></div>
        -->
    </div> 
    <!-- end belt system holder -->
    <div style="clear:both"></div>
        <div style="clear:both"></div>


         <a target="_blank" href="https://www.codegrepper.com/app/my_earnings.php">
            <div id="earnings_are_available" style="display:none;"> 
                <i class="icon dollar sign"></i> You Now Qualify to Earn. Start Earning <i class="icon chevron circle right"></i>.
            </div>

            <div id="earnings_are_enabled" style="display:none;"> 
                <i class="icon dollar sign"></i> 
                Total Earnings:<span id="total_earnings"></span>
                Unpaid:<span id="total_unpaid"></span>
                Paid:<span id="total_paid"></span>
                
                <i class="icon chevron circle right"></i>
            </div>


        </a>
        <div id="your_earnings"> </div>
        <div id="subscription_notice" style="display:none;"> 
            <span style="font-weight:bold">Account Type:</span>
            <span id="subscription_account_type"></span><span style="display:none" class='brand_red' id="not_eligible_to_earn">
            <span style="font-size:10px;">(Ineligible to Earn)</span></span> 
            <a target="_blank" style="font-size:11px;" href="https://www.codegrepper.com/app/settings-subscription.php"class="grepper_button2">Upgrade Account 
            <i class="icon chevron circle right"></i>
            </a>
        </div>

</div>

<div id="options_menu">

     <!--<li class="border-bottom light"> Grepper </li>-->
    <a target="_blank" href="https://www.codegrepper.com/app/docs.php">
    <li class="on_hover">
    <i class="icon file alternate  brand_red"></i>
        Usage Docs 
    </li>
    </a>
    <a target="_blank" id="profile_link" href="https://www.codegrepper.com/app/profile.php">
    <li class="on_hover">
        <i class="icon user circle   brand_green"></i>
       My Account/Profile 
    </li>
    </a>


    <a target="_blank" href="https://www.codegrepper.com/app/teams.php">
        <li class="on_hover">
        <i class="icon users brand_purple"></i>
            My Teams 
        </li>
    </a>
  
    <a target="_blank" href="https://www.codegrepper.com/app/my_answers.php">
        <li class="on_hover">
        <i class="icon code brand_yellow"></i>
            My Code Answers 
        </li>
    </a>
   <a target="_blank" href="https://www.codegrepper.com/app/index.php">
        <li class="on_hover">
            <i class="icon handshake brand_purple"></i>
            Grepper Community
        </li>
    </a>
   <a target="_blank" id="profile_link" href="https://www.codegrepper.com/app/settings-code-languages.php">
    <li class="on_hover">
        <i class="icon cog brand_green"></i>
       My Settings 
    </li>
    </a>
    <div id="recent_answers">
        <span id="recent_answers_header"> Recent Answers </span>
        <div id="recent_answers_holder"></div>
    </div>
 
    <!--
     <a id="logout">
        <li class="on_hover">
        Logout
        </li>
    </a>
    -->

</div>


</div>

<div id="login_menu" style="display:none">
<br/> <br/> 

    <div id="google_register_box">
    <div id="login_error_holder" style="display:none;">
        <ul id="errors" class="errors"></ul>
    </div>
    <h1 id="register_header_1" > Log in </h1>
    <form id="register_form">
        <input placeholder="Email" class="input1" type="text" name="email">
        <input placeholder="Password" class="input1" type="password" name="password">
        <button id="register_button" class="grepper_button1" >Login</button>
    </form>
   <div id="grepper_forgot_password">
    Forgot Password: <a target="_blank" href="https://www.codegrepper.com/app/reset_password.php">Reset it now</a>
   </div>
   <!--
    <div id="grepper_register_notice">To enable Grepper for VSCode you must have the <a href="https://www.codegrepper.com/app/addons.php" target="_blank">Grepper VSCode Add-On Subscription</a>. !-->
    <br/><br/>
    If you are completely new to Grepper we recommend first trying out the <a href="https://www.codegrepper.com" target="_blank">browser extension</a>.</div>
    </div>
</div>

<div id="activate_menu" style="display:none">
<br/> <br/> 
    <h1>Grepper Activation</h1>
    <a class="grepper_button1" id="activate_grepper"> Activate Grepper </a>
<div>

<script src="${scriptUri}"></script>
</body>
</html>`;
    }
}
exports.default = GrepperSideViewProvider;
GrepperSideViewProvider.viewType = 'grepperPopup';
//# sourceMappingURL=greppersideview.js.map