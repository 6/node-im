var conn = null;
var logged_in = false;
var app_id = '217811734953910';

window.fbAsyncInit = function() {
  FB.init({
    appId: app_id
    ,status: true
    ,cookie: true
    ,oauth: true
  });

  // run once with current status and whenever the status changes
  FB.getLoginStatus(updateStatus);
  FB.Event.subscribe('auth.statusChange', updateStatus);
  $("#fb-auth").click(fb_login);
  $("#fb-logout").click(fb_logout);
  conn = new Strophe.Connection('http://107.22.171.171:5280/http-bind/');
};

fb_login = function() {
  FB.login(function(response) {
    if(!response.authResponse) {
      //user cancelled login or did not grant authorization
      alert("CANCEL");
    }
  }, {scope: 'email,xmpp_login'});
};

fb_logout = function() {
  logged_in = false;
  FB.logout(function(response){});
};

setUserInfo = function(userID) {
  $("#user-info").html('<img src="https://graph.facebook.com/'+userID+'/picture" width=30>');
  FB.api('/me', function(res) {
    $("#user-info").append(res.name);
    alert("TODO find/create:"+userID+","+res.email+","+res.name);
  });
};

var resp = null; // TODO
updateStatus = function(response) {
  if(response.authResponse && !logged_in) {
    resp = response.authResponse; // TODO expiresIn or offline_access
    //user is already logged in and connected
    toggleLoginHtml(false);
    setUserInfo(response.authResponse.userID);
    logged_in = true;
    fb_server_challenge(response.authResponse);
  }
  else if(!logged_in){
    //user is not connected to your app or logged out
    toggleLoginHtml(true);
  }
};

toggleLoginHtml = function(show_bool) {
  if(show_bool) {
    $("#fb-auth").show(0);
    $("#fb-logout").hide(0);
    $("#user-info").hide(0);
  }
  else {
    $("#fb-auth").hide(0);
    $("#fb-logout").show(0);
    $("#user-info").show(0);
  }
};

fb_server_challenge = function(info) {
  var jid = info.userID+"@chat.facebook.com";
  console.log("Connecting as: "+jid);
  conn.facebookConnect(
    jid
    ,on_fb_chat_connect
    ,60
    ,1
    ,app_id
    ,null
    ,info.accessToken
  );
}

on_fb_chat_connect = function(status) {
  if(status == Strophe.Status.CONNECTING) console.log("connecting");
  else if(status == Strophe.Status.CONNFAIL) console.log("confail");
  else if(status == Strophe.Status.DISCONNECTING) console.log("disconnecting");
  else if(status == Strophe.Status.DISCONNECTED) console.log("disconnected");
  else if(status == Strophe.Status.CONNECTED){
    console.log("CONNECTED");
    conn.addHandler(on_fb_message, null, 'message', null, null,  null);
    conn.send($pres().tree()); // presence stanza
  }
};

on_fb_message = function(msg) {
  var from_id = msg.getAttribute("from").split("@")[0].substring(1);
  var type = msg.getAttribute("type");
  var text = Strophe.getText(msg.getElementsByTagName("body")[0]);
  console.log("Type:"+type+" From:"+from_id);
  if(msg.getElementsByTagName("composing").length > 0) {
    console.log("Typing...");
  }
  else if(text.length > 0){
    console.log(text);
  }
  return true; // keep handler alive
};

on_fb_send = function() {
  //TODO
};
