var utils = require("util")
  , makeCommandLine = require("./utils/makeCommandLine")
  , EventEmitter = require("events").EventEmitter
  , spawn = require("child_process").spawn
  , Finder = require("xdg-apps")
  , dbus = require('dbus-native');

function Launcher(){
  //Early instanciation because we can already fetch every desktop file we will need later.
  //Promises allow us to start querying immediately.
  this.finder = new Finder("desktop");
  this.child = null;
  this.endPipe = this.emit.bind(this,"end");
  this.stdoutPipe = this.emit.bind(this,"stdout");
  this.stderrPipe = this.emit.bind(this,"stderr");

  //Technique to find the moment when the application is closed :
  //If the name argument matches the service name you want to know about.
  //If the old_owner argument is empty, then the service has just claimed the name on the bus.
  //If new_owner is empty then the service has gone away from the bus (for whatever reason).
  this.sessionBus = dbus.sessionBus();
  this.id = "";
  this.sessionBus.getService("org.freedesktop.DBus").getInterface("/org/freedesktop/DBus", "org.freedesktop.DBus", (err, call) => {
    call.on("NameOwnerChanged", (name, old_owner, new_owner) => {
      if(name == this.id && !new_owner) {
        console.log("NameOwnerChanged", name, "exits");
        this.emit("end");
      }
    })
  });
}
utils.inherits(Launcher,EventEmitter);
/**
 * Open a file or an array of file. Don't forget to catch errors using promise syntax :
 * 		launcher.start("pat/to/file").catch(function(e){//catch errors});
 *
 * @param  {string|Array} file file to open or array of file to open
 * @return {child_process}         reference to the created child process
 */
Launcher.prototype.start = function (file,opts) {
  return this.finder.findEntry(file)
  .then(entry => {
    if(entry === null) {
      this.exec(file, entry, opts);
      return;
    }
    if(entry['DBusActivatable'] == 'true') {
      this.id = entry['ID'].replace(".desktop", ""); //Transform desktop id to service name (service.name)
      var service = this.sessionBus.getService(id);

      //We replace all points in id by / to get the path of the interface
      //We call org.freedesktop.Application => See spec :https://standards.freedesktop.org/desktop-entry-spec/latest/ar01s07.html
      service.getInterface("/" + this.id.replace(/\./g, '/'), 'org.freedesktop.Application', (err, call) => {
        if(err) console.log(err);

        //Open method need an array in param
        if(Array.isArray(file)) {
          call.Open(file, {"desktop-startup-id" : ["s", "truc"]}, (err) => {
            if(err) console.log(err);
          });
        } else {
          call.Open([file], {"desktop-startup-id" : ["s", "truc"]}, (err) => {
            if(err) console.log(err);
          });
        }

      });
    } else {
      this.exec(file, entry['Exec'], opts)
    }
  });
};


Launcher.prototype.exec = function (file,line,opts) {
  var obj = makeCommandLine(file,line);
  opts = opts||{};
  if(this.child){
    this.child.removeListener('exit', this.endPipe); //otherwise the client will think we emit "end" for this new command.
    this.killChild();
  }
  this.child = this._spawn(obj.exec,obj.params,opts);
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
