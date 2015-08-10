var utils = require("util")
  , makeCommandLine = require("./utils/makeCommandLine")
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
utils.inherits(Launcher,EventEmitter);

Launcher.prototype.start = function (command) {
  var self = this;
  return this.types.lookup(command)
  .then(function(res){
    return self.apps.find(res);
  }) //return an array of desktop entries or the mime type
  .then(function(defaultApps){
    if(Array.isArray(defaultApps) && defaultApps.length > 0){
      return Promise.all(defaultApps.map(function(en){return self.entries.getExecKey(en)})).then(function(keys){
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
      return self.entries.find(defaultApps); //here entries is in fact the mime type given to apps.find().
    }
  })
  .then(function(entry){
    self.exec(command,entry)
  })
  .catch(function(e){
    console.error("Launcher Error : ",e);
  });
};

Launcher.prototype.exec = function (file,line) {
  var self = this;
  var obj = makeCommandLine(file,line);
  this.killChild();
  this.child = spawn(obj.exec,obj.params,{detached:true,stdio:"inherit"});
  this.child.once("exit",function(){
    self.emit("end",file);
  });
};
Launcher.prototype.killChild = function () {
  console.log("killing : ",this.child);
  if(!this.child){
    return;
  }else{
    try{
      process.kill(-this.child.pid);
    }catch(e){
      if(e.code != "ESRCH"){ //child_process might already have exitted
        console.warn("error (kill_child_process): ",e);
      }else{
        console.log("Error : ESRCH killing child process from Launcher");
      }
    }finally{
      this.child = null;
    }
  }
};

module.exports = Launcher;
