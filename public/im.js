var conn = null;
var fb_user_id = false;
var app_id = '217811734953910';
var recipient_fb_id = null;
var chats_history = {};

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
  }, {scope: 'email,xmpp_login,friends_online_presence'});
};

fb_logout = function() {
  fb_user_id = false;
  FB.logout(function(response){});
};

setUserInfo = function() {
  $("#user-info").html('<img src="'+avatar(fb_user_id)+'">');
  FB.api('/me', function(res) {
    $("#user-info").append(res.name);
    //alert("TODO find/create:"+userID+","+res.email+","+res.name);
  });
  FB.api('/me/friends', function(res) {
    $.each(res.data, function(i, v) {
      add_fb_friend(v.id, v.name);
    });
  });
};

avatar = function(user_id) {
  return "https://graph.facebook.com/"+user_id+"/picture";
};

add_fb_friend = function(user_id, name) {
  $("#friends").append('<div class=friend id="friend_'+user_id+'"><img src="'+avatar(user_id)+'"><span>'+name+'</span></div>');
  $("#friend_"+user_id).click(function() {
    $(".active").removeClass("active");
    $(this).addClass("active");
    recipient_fb_id = user_id;
    // remove current messages & restore any previous messages
    $("#chat").html("");
    if(chats_history[recipient_fb_id]) {
      $.each(chats_history[recipient_fb_id], function(i, v) {
        var id = v.is_sender ? fb_user_id : recipient_fb_id;
        add_chat(id, v.text);
      });
    }
  });
};

updateStatus = function(response) {
  if(response.authResponse && !fb_user_id) {
    //user is already logged in and connected
    toggleLoginHtml(false);
    fb_user_id = response.authResponse.userID;
    setUserInfo();
    fb_server_challenge(response.authResponse.accessToken);
  }
  else if(!fb_user_id){
    //user is not connected to your app or logged out
    toggleLoginHtml(true);
  }
};

toggleLoginHtml = function(show_bool) {
  if(show_bool) {
    $("#fb-auth").show(0);
    $("#fb-logout").hide(0);
    $("#user-info").hide(0);
    $("#bottom").slideUp(400, function() {
      $("#friends").html("");
      $("#chat").html("");
      chats_history = {};
    });
  }
  else {
    $("#fb-auth").hide(0);
    $("#fb-logout").show(0);
    $("#user-info").show(0);
    $("#bottom").slideDown(400);
  }
};

fb_server_challenge = function(access_token) {
  var jid = fb_user_id+"@chat.facebook.com";
  conn.facebookConnect(
    jid
    ,on_fb_chat_connect
    ,60
    ,1
    ,app_id
    ,null
    ,access_token
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
    $("#message-input").keypress(function(e) {
      if(e.which == 13) {
        if(on_fb_send())
          $("#message-input").val("");
      }
    });
    conn.send($pres().tree()); // presence stanza
  }
};

on_fb_message = function(msg) {
  var from_id = msg.getAttribute("from").split("@")[0].substring(1);
  var type = msg.getAttribute("type");
  var text = Strophe.getText(msg.getElementsByTagName("body")[0]);
  console.log("Type:"+type+" From:"+from_id);
  var is_typing = false;
  if(msg.getElementsByTagName("composing").length > 0) {
    console.log("Typing...");
    is_typing = true;
  }
  else if(text.length > 0){
    console.log(text);
  }

  if(!is_typing){
    save_message(from_id, false, text);
  }
  if(from_id === recipient_fb_id) {
    if(is_typing) {
      //TODO show some indicator
    }
    else {
      add_chat(from_id, text);
    }
  }
  else {
    //TODO: some sort of notification?
  }
  return true; // keep handler alive
};

on_fb_send = function() {
  if(!recipient_fb_id) {
    console.log("Please select a person to chat with");
    return false;
  }
  if(!$("#message-input").val()) {
    console.log("Please enter a message first");
    return false;
  }
  var to = '-'+recipient_fb_id+'@chat.facebook.com'; 
  var text = $("#message-input").val();
  console.log("Send "+text+" TO "+to);
  
  var message = $msg({to: to,type: 'chat'})
    .cnode(Strophe.xmlElement('body', text));
  conn.send(message.tree());

  save_message(recipient_fb_id, true, text);
  add_chat(fb_user_id, text);
  return true;
};

save_message = function(id, is_sender, text) {
  if(!chats_history[id]) {
    chats_history[id] = [];
  }
  chats_history[id].push({is_sender:is_sender, text:text});
};

add_chat = function(sender_id, text) {
  $("#chat").append('<div class=message><img src="'+avatar(sender_id)+'"><span>'+text+'</span></div>');
};
