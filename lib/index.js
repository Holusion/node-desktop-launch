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
  this.endPipe = this.emit.bind(this,"end");
  this.stdoutPipe = this.emit.bind(this,"stdout");
  this.stderrPipe = this.emit.bind(this,"stderr");
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
  if(this.child){
    this.child.removeListener('exit', this.endPipe); //otherwise the client will think we emit "end" for this new command.
    this.killChild();
  }
  this.child = this._spawn(obj.exec,obj.params,{});
  this.child.stdout.on("data",this.stdoutPipe);
  this.child.stderr.on("data",this.stderrPipe);
  this.child.once("exit",this.endPipe);
  return this.child;
};

Launcher.prototype._spawn = function(a,b,c){
  return spawn.apply(this,[a,b,c]);
}
Launcher.prototype.killChild = function () {
  if(this.child !== null){
    try{
      process.kill(this.child.pid);
    }catch(e){
      if(e.code !== "ESRCH"){ //child_process might already have exitted. In which case it's not necessary to throw an error...
        this.emit("error",e);
      }
    }finally{
      this.child = null;
    }
  }
};


module.exports = Launcher;
