$(document).ready(function() {
  $('input').keyup(function(e){
    if(e.keyCode == 13) {
      $(this).trigger("enterKey");
    }
  });

  $("#SendButton").on("click", Send);
  $("#TextInput").bind("enterKey", Send);

  setInterval(LoadMessages, 2000);
});

function Send() {
  if ($("#NameBox").val().length > 1) {
    $.post("/api", {action: "post", message: {name: $("#NameBox").val(), text: $("#TextInput").val()}}, function(data, status) {
      if (data.success){
        AddMessage({name: $("#NameBox").val(), text: $("#TextInput").val()});
        ScrollDown();

        $("#TextInput").val("");
      }
    });
  }
  else {
    alert("Enter a name.");
  }
}

function LoadMessages() {
  $.post("/api", {action: 'list'}, function(data, status) {
    console.log(data);

    $("#MessageBox").html("");

    for (var i = 0; i < data.messages.length; i++){
      AddMessage(data.messages[i]);
    }

    ScrollDown();

  });
}

function ScrollDown() {
  $('#MessageBox').scrollTop($('#MessageBox')[0].scrollHeight);
}

function AddMessage(message) {
  $("#MessageBox").append('<div><span style="font-size: 8px; color: #77F;">' + message.ip + " </span>" + message.name + '</div><div style="margin-left: 15px; margin-bottom: 10px;"><span style="color:#7F7;">' + escapeHtml(message.text) + "</span></div>");
}

var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

function escapeHtml (string) {
  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
    return entityMap[s];
  });
}
