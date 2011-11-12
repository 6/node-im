var conn = new JSJaCHttpBindingConnection({
  httpbase: '/fbchat'
  ,timerval: 2000
});

var logged_in = false;

/* TODO
  conn.connect({
    authtype: 'x-facebook-platform'
    ,facebookApp: app
  });  
*/

window.fbAsyncInit = function() {
  FB.init({
    appId: '217811734953910'
    ,status: true
    ,cookie: true
    ,xfbml: true
    ,oauth: true
  });

  // run once with current status and whenever the status changes
  FB.getLoginStatus(updateStatus);
  FB.Event.subscribe('auth.statusChange', updateStatus);
  $("#fb-auth").click(fb_login);
  $("#fb-logout").click(fb_logout);
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
