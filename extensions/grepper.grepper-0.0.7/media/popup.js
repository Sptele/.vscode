window.vscode = acquireVsCodeApi();


var prod_url = "https://www.codegrepper.com/app/";
var prod_url_web = "https://www.codegrepper.com/";
var prod_api = "https://www.codegrepper.com/api";

var registerWindow=false;
var activateWindow=false;
var dontLoad = false;
var hideIcons = false;
var currentURL;
var currentTab;


function makeRequest (method, url, data, id, token) {
 
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();


    xhr.open(method, url);
    if(typeof id !=='undefined'){
        xhr.setRequestHeader("x-auth-id", id);   
    }
    if(typeof token !=='undefined'){
        xhr.setRequestHeader("x-auth-token", token);   
    }
    
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText
      });
    };
    if(method=="POST" && data){
        xhr.send(data);
    }else{
        xhr.send();
    }
  });
}



/*
chrome.runtime.onMessage.addListener(function(message){
   if(message.action ==="userRegistered"){
        checkLoginStatus();     
        if(registerWindow){
            registerWindow.close();
        }
   }
});
*/

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function showRankPrivacy(p,user){
        if(!p){
            var rankPrivacyHTML="<i style='margin:0px;' class='icon hand pointer'></i>belt is public: <a id='grepperSetRankPrivateYes'>set private </a>";
            document.getElementById("rank_privacy").innerHTML=rankPrivacyHTML;
            document.getElementById("grepperSetRankPrivateYes").addEventListener("click", function(event) {
                grepperSetRankPrivate(1,user);
            });
        }else{
            var rankPrivacyHTML="<i  style='margin:0px;' class='icon hand pointer outline'></i>belt is private: <a id='grepperSetRankPrivateNo'>set public </a>";
            document.getElementById("rank_privacy").innerHTML=rankPrivacyHTML;
            document.getElementById("grepperSetRankPrivateNo").addEventListener("click", function(event) {
                grepperSetRankPrivate(0,user);
            });
      }

}

function showAccountDataSimple(stats,user){

    //showBlacklistButtons(user);
    if(user.notices && user.notices.length){
    document.getElementById("grepper_profile_notices_holder").style.display="block";
    document.getElementById("grepper_profile_notices_amount").textContent=user.notices.length;
    if(user.notices.length === 1){
        document.getElementById("grepper_profile_notices_text").textContent="view 1 new notification";
        }else{
        document.getElementById("grepper_profile_notices_text").textContent="view "+user.notices.length+" new notifications";
        }
    }

    document.getElementById("login_menu").style.display="none";
    var gad= document.getElementById("grepper_account_data");
        gad.style.display="block";
        document.getElementById("profile_link").href="https://www.codegrepper.com/app/profile.php?id="+user.grepper_user_id;
        document.getElementById("grepper_profile_data_image_url").href="https://www.codegrepper.com/app/profile.php?id="+user.grepper_user_id;

       if(stats.profile_image){
            document.getElementById("grepper_profile_data_image").src=prod_url_web+"profile_images/"+stats.profile_image;
        }else{
            document.getElementById("grepper_profile_data_image").src=prod_url_web+"/app/img/default_profile.png";
        }
        showRankPrivacy(stats.is_rank_private,user);

    document.getElementById("devs_helped").textContent=stats.helped[0];
    document.getElementById("problems_helped").textContent=stats.helped[1];
    document.getElementById("recent_answers_holder").innerHTML ='';
    

 if(stats.earnings_allowed && !stats.earnings_enabled){
     document.getElementById("earnings_are_available").style.display ='block';
 }else if(stats.earnings_allowed && stats.earnings_enabled){
     document.getElementById("earnings_are_enabled").style.display ='block';
     document.getElementById("total_earnings").textContent="$"+currencyFormat(stats.earnings.total_earnings);
     document.getElementById("total_paid").textContent="$"+currencyFormat(stats.earnings.total_paid);
     document.getElementById("total_unpaid").textContent="$"+currencyFormat(stats.earnings.total_unpaid);
 }else if(stats.subscription_type === 0 || stats.subscription_type === 1 ){
    document.getElementById("subscription_notice").style.display ='block';

    var accountType="";
    if(stats.subscription_type === 0){
        accountType="Free";
    }else if(stats.subscription_type === 1){
        accountType="Free Trial";
    }else if(stats.subscription_type === 2){
        accountType="Yearly Subscription";
    }
    document.getElementById("subscription_account_type").textContent=accountType;
    if(!stats.earnings_allowed){
      document.getElementById("not_eligible_to_earn").style.display="inline"; 
    }
        
}

    var html="";
    for(let i=0;i<stats.recent_answers.length;i++){
        var t = stats.recent_answers[i].created_at.split(/[- :]/);
        var d = new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]));
        var formattedDate=dateToNiceDayString(d);
        var a=document.createElement("a");
            a.target="_blank";
            a.style.cursor="pointer";
            a.addEventListener('click',function(){
                window.vscode.postMessage({
                    action:'openAnswer',
                    search_term:stats.recent_answers[i].search_term
                });
            });

            //a.href='https://www.google.com/search?tifgrpr=1&q='+stats.recent_answers[i].search_term;

            //hereok
        var a_div=document.createElement("div");

        var a_span1=document.createElement("span");
            a_span1.className += " recent_answer_term";
            a_span1.textContent=stats.recent_answers[i].search_term;
            a_div.appendChild(a_span1);

        var a_span=document.createElement("span");
            a_span.className += " recent_answer_date";
            a_span.textContent =  formattedDate;

            a.appendChild(a_div);
            a_div.appendChild(a_span);

        var a_span3=document.createElement("span");
            a_span3.className += " recent_answer_clear_both";
            a_div.appendChild(a_span3);


            document.getElementById("recent_answers_holder").appendChild(a);
        
    }


}


function showAccountData(stats){
document.getElementById("login_menu").style.display="none";
var gad= document.getElementById("grepper_account_data");
gad.style.display="block";

document.getElementById("overall_belt_color").textContent=capitalizeFirstLetter(stats.coding_belt[0]);
document.getElementById("overall_next_belt_color").textContent=capitalizeFirstLetter(stats.coding_belt[2]);
document.getElementById("percent_till_next").textContent=Math.round(stats.coding_belt[1]*100)+"%";

document.getElementById("next_belt_progress_bar").style.width=Math.round(stats.coding_belt[1]*100)+"%";
document.getElementById("next_belt_progress_bar").classList+=" " +stats.coding_belt[2]; 
document.getElementById("overallbelt").className+=" "+stats.coding_belt[0];


document.getElementById("belt_system_holder").style.display="block";
}




function showPaymentMenu(){
  document.getElementById("login_menu").style.display="none";
  document.getElementById("activate_menu").style.display="block";
}

function showLoginMenu(){

    document.getElementById("grepper_account_data").style.display="none";
    document.getElementById("login_menu").style.display="block";
}

var isLogin=false;


function checkUserAuth(user){
    makeRequest('GET',prod_api+"/check_auth.php?vscode=1",null,user.grepper_user_id,user.grepper_access_token).then(function(d){
        var stats = JSON.parse(d);
        if(!stats.success){
             if(stats.yearly_subscription_enabled && !stats.subscription_started_on){
                showPaymentMenu();
             }else{
                showLoginMenu();
             }
        }else{
            if(stats.yearly_subscription_enabled && !stats.subscription_started_on){
                showPaymentMenu();
             }else{
                showAccountDataSimple(stats,user); //stats here ie helped states 
                showAccountData(stats.belt_stats);  //stats here is there belt
                //getUserStats(user);
            }
        }
    });
}
/*
document.getElementById("logout").addEventListener("click", function(event) {
    logout();
});
*/

function logout(){
 chrome.storage.sync.set(
 {access_token:""},
 function() {});
 checkLoginStatus();
}

function checkLoginStatus(user){
        if(user.grepper_user_id){
            checkUserAuth(user);
        }else{
            showLoginMenu();
            checkUserAuth(user);
        }
}

function dateToNiceDayString(myDate){
  var month=new Array();
  month[0]="Jan";
  month[1]="Feb";
  month[2]="Mar";
  month[3]="Apr";
  month[4]="May";
  month[5]="Jun";
  month[6]="Jul";
  month[7]="Aug";
  month[8]="Sep";
  month[9]="Oct";
  month[10]="Nov";
  month[11]="Dec";
  var hours = myDate.getHours();
  var minutes = myDate.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ampm;
  //return myDate.getDate()+" "+month[myDate.getMonth()]+" "+myDate.getFullYear()+" "+strTime;
  return month[myDate.getMonth()]+" "+myDate.getDate();
}

function grepperSetRankPrivate(p,user){
    makeRequest('GET',prod_api+"/update_rank_privacy.php?is_rank_private="+p,null,user.grepper_user_id,user.grepper_access_token).then(function(d){
        showRankPrivacy(p,user);
    });
}
function currencyFormat(m){
    return parseFloat(m).toFixed(2); 
}

function blackList(user, url, blacklist_type) {
    var data={};
        data.url=url;
        data.blacklist_type = blacklist_type;
    makeRequest('POST', prod_api+"/blacklist.php",JSON.stringify(data),user.grepper_user_id,user.grepper_access_token).then(function(responseData){
            var dataR=JSON.parse(responseData); 
            //if we could save to backend,just rest to whatever is on the backend 
            if(dataR.success){
                chrome.storage.sync.set({grepper_blacklists: dataR.blacklists}, function() {
                   location.reload();
                   chrome.tabs.update(currentTab.id, {url: currentTab.url});
                   //currentTab.reload();
                });
            }else{
            //    alert("Ooops, You need to login to complete this action. Click the Grepper icon in the top right of your browser ↗ ");
            }
    });

}



/*
function resetNotifications(){
    chrome.browserAction.setBadgeText({text:""});
    chrome.storage.sync.set({notices: []}, function() {});
     window.open("https://www.codegrepper.com/app/notifications.php", '_blank');
}

document.getElementById("grepper_profile_notices").addEventListener("click", resetNotifications);
*/

//Wire up event event handlers

function login(){
var form = document.querySelector('#register_form');
var formData = new FormData(form);
var  url =prod_api+"/login_vscode.php";

makeRequest('POST',url,formData).then(function(d){
    var data=JSON.parse(d);
    if(!data.success){
        document.getElementById("login_error_holder").style.display="block";
        var errorsHolder = document.getElementById("errors");
        errorsHolder.innerHTML = '<h5>Oops, there was a problem. Please fix the below errors.</h5>';
        for(var i = 0; i<data.errors.length;i++){
                errorsHolder.innerHTML+= '<li>'+data.errors[i]+'</li>';
        }
    }else{
        window.vscode.postMessage({
            action:'saveLogin',
            grepper_user_id:data.user_id,
            grepper_access_token:data.access_token,
            grepper_user_langs:data.grepper_user_langs
        });
    }
});

}

document.getElementById("register_form").addEventListener("submit", function(e){
    login();
    e.preventDefault();    //stop form from submitting
  	//do whatever an submit the form
});


window.addEventListener("message", function(event) {
    var message= event.data;
    if(message.command == "init"){
        checkLoginStatus(message);     
    }
     //check status on load
});

window.vscode.postMessage({action:'getUser'});

//post message and wait for response



