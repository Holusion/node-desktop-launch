var utils = require("util")
  , makeCommandLine = require("./utils/makeCommandLine")
  , EventEmitter = require("events").EventEmitter
  , spawn = require("child_process").spawn
  , Finder = require("xdg-apps")

function Launcher(){
  //Early instanciation because we can already fetch every desktop file we will need later.
  //Promises allow us to start querying immediately.
  this.finder = new Finder("desktop");
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
  return this.finder.find(file)
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
