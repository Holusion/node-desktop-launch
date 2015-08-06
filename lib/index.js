var util = require("util")
  , EventEmitter = require("events").EventEmitter
  , spawn = require("child_process").spawn
  , EntryList = require("./EntryList")
  , MimeApps = require("./MimeApps")
  , TypeList = require("./MimeType");

function Launcher(){
  this.entries = new EntryList();
  this.apps = new MimeApps();
  this.types = new TypeList();
  this.child = null;
}

Launcher.prototype.start = function (command) {
  var self = this;
  return this.types.lookup(command)
  .then(function(res){
    return self.apps.find(res);
  }) //return an array of desktop entries or the mime type
  .then(function(entries){
    if(Array.isArray(entries) && entries.length > 0){
      return Promise.all(entries.map(function(en){return self.entries.getExecKey(en)})).then(function(keys){
        var result = null;
        keys.some(function(key){
          if(key){
            result = key;
            return true;
          }else{
            return false;
          }
        });
        return result;
      });
    }else{
      return self.entries.find(entries); //here entries is in fact the mime type given to apps.find().
    }
  })
  .then(function(entry){
    self.exec(command,entry)
  })
  .catch(function(e){
    throw e;
  });
};

Launcher.prototype.exec = function (command,entry) {
  this.killChild();
  if(entry){
    entry = entry.replace("%F",command);
    entry = entry.split(/\s/);
    command = entry.shift();
  }else{
    entry = [];
  }
  this.child = spawn(command,entry,{detach:true,stdio:"inherit"});
};
Launcher.prototype.killChild = function () {
  if(!this.child){
    return;
  }else{
    try{
      process.kill(-this.child.pid);
    }catch(e){
      if(e.code != "ESRCH"){ //child_process might already have exitted
        console.log("error (kill_child_process): ",e);
      }
    }finally{
      this.child = null;
    }
  }
};

module.exports = Launcher;
