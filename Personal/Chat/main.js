var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/*", GetRequest);
app.post("/api", ApiRequest);

app.listen(3000, function() { console.log("Server running at localhost:3000"); });

var _messages = {};
var current_chunk = 0;

_messages[current_chunk.toString()] = [];

function AddMessage(message) {
  _messages[current_chunk.toString()].push(message);

  if (_messages[current_chunk.toString()].length >= 5) {
    current_chunk++;
    _messages[current_chunk.toString()] = [];
  }
}

function GetMessages() {
  var i = current_chunk;

  var arr = _messages[i.toString()];
  while (i > 0){
    i--;
    var narr = _messages[i.toString()];
    arr = narr.concat(arr);
  }

  return arr;
}

function GetRequest(req, res) {
  var data = {};
  if ('query' in req)
    data = req.query;

  var url = req.url;
  if (url === "/")
    url += "index.html"

  fs.exists("server" + url, function (exists) {
    if (exists) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(fs.readFileSync("server" + url));
    }
    else {
      res.writeHead(404);
      res.end();
    }
  });
}

function ApiRequest(req, res) {
  var action = req.body.action;
  var ip = req.connection.remoteAddress;

  var ss = ip.split(':');

  req.body._ip = ss[ss.length - 1];

  if (action in ApiActions)
    ApiActions[action](req.body, function(data) {
      res.writeHead(200, {'Content-Type': 'text/json'});
      res.end(JSON.stringify(data));
    });
  else {
    res.writeHead(200, {'Content-Type': 'text/json'});
    res.end(JSON.stringify({success: false}));
  }
}

var ApiActions = {
  'post': function(a, r) {
    a.message.ip = a._ip;
    AddMessage(a.message);
    console.log(a.message);
    r({success: true});
  },

  'list': function(a, r) {
    r({success: true, messages: GetMessages()});
  }
}
