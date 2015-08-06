var util = require("util")
  , EventEmitter = require("events").EventEmitter
  , EntryList = require("./EntryList")
  , TypeList = require("./MimeType");

function Launcher(){
  this.entries = new EntryList();
  this.types = new MimeType();
}

Launcher.prototype.start = function (command) {
  var self = this;
  this.types.lookup(command)
  .then(this.entries.find)
  .then(function(entry){
    self.exec(command,entry)
  })
  .catch(function(e){
    self.emit("error",e);
  });
};

Launcher.prototype.exec = function (command,entry) {
  console.log("launching with :",enrty);
};
