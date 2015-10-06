var utils = require("util")
  , makeCommandLine = require("./utils/makeCommandLine")
  , EventEmitter = require("events").EventEmitter
  , spawn = require("child_process").spawn
  , EntryList = require("./EntryList")
  , MimeApps = require("./MimeApps")
  , TypeList = require("./MimeType");

function Launcher(){
  //Early instanciation because we can already fetch every desktop file we will need later.
  //Promises allow us to start querying immediately.
  this.entries = new EntryList();
  this.apps = new MimeApps();
  this.types = new TypeList();
  this.child = null;
}
utils.inherits(Launcher,EventEmitter);
/**
 * Open a file or an array of file. Don't forget to catch errors using promise syntax :
 * 		launcher.start("pat/to/file").catch(function(e){//catch errors});
 *
 * @param  {string|Array} file file to open or array of file to open
 * @return {child_process}         reference to the created child process
 */
Launcher.prototype.start = function (file) {
  var self = this;
  return this.types.lookup(file)
  .then(function(res){
    return self.apps.find(res);
  }) //return an array of desktop entries or the mime type
  .then(function(defaultApps){
    //TODO this is bad. getExecKey should be an independant function upon which both entries and apps depends.
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
    self.exec(file,entry)
  });
};


Launcher.prototype.exec = function (file,line) {
  var self = this;
  var obj = makeCommandLine(file,line);
  this.killChild();
  this.child = spawn(obj.exec,obj.params,{detached:true,stdio:"inherit"});
  this.child.once("exit",function(){
    self.emit("end",file);
    self.child = null;
  });
  return this.child;
};
Launcher.prototype.killChild = function () {
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
