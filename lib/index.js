'use strict';
const utils = require("util")
  , makeCommandLine = require("./utils/makeCommandLine")
  , EventEmitter = require("events").EventEmitter
  , spawn = require("child_process").spawn
  , Finder = require("xdg-apps")
  , dbus = require('dbus-native');


class Launcher extends EventEmitter{
  constructor(){
    super()
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
    this.sessionBus.getService("org.freedesktop.DBus").getInterface("/org/freedesktop/DBus", "org.freedesktop.DBus", (err, call) => {
      call.on("NameOwnerChanged", (name, old_owner, new_owner) => {
        if(this.child_service_id && name == this.child_service_id && !new_owner) {
          console.log("NameOwnerChanged", name, "exits");
          this.emit("end");
        }
      })
    });
  }
  get sessionBus(){
    return dbus.sessionBus();
  }

/**
 * Open a file or an array of file. Don't forget to catch errors using promise syntax :
 * 		launcher.start("pat/to/file").catch(function(e){//catch errors});
 *
 * @param  {string|Array} file file to open or array of file to open
 * @return {child_process}         reference to the created child process
 */
  async start(file,opts) {
    let entry = await this.finder.findEntry(file)
    if(this.child){
      this.child.removeListener('exit', this.endPipe); //otherwise the client will think we emit "end" for this new command.
      this.killChild();
      this.child = null;
    }
    if (this.child_service_id){
      //FIXME handle early kill
      this.child_service_id = null;
    }

    if( entry && entry['DBusActivatable'] == 'true') {
      this.openDbus(file, entry['ID']);
    } else if (entry ) {
      this.exec(file, entry['Exec'], opts)
    }else{ //default to directly exec file
      this.exec(file, entry, opts);
    }
    return;
  }

  exec(file,line,opts) {
    var obj = makeCommandLine(file,line);
    opts = opts||{};

    let child = this._spawn(obj.exec,obj.params,opts);
    child.stdout.on("data",this.stdoutPipe);
    child.stderr.on("data",this.stderrPipe);
    child.once("exit",this.endPipe);
    this.child = child;
    return child;
  }
  _spawn(a,b,c){
    return spawn.apply(this,[a,b,c]);
  }
  openDbus(file, id){
    //FIXME what if id is null or invalid?
    //FIXME async/await until dbus has been contacted
    id = id.replace(".desktop", "")
    let uri = id.replace(/\./g, '/'); //Transform desktop id to service name (service.name)
    var service = this.sessionBus.getService(id);
    //We replace all points in id by / to get the path of the interface
    //We call org.freedesktop.Application => See spec :https://standards.freedesktop.org/desktop-entry-spec/latest/ar01s07.html
    console.log('Opening file', id, uri)
    service.getInterface("/" + uri, 'org.freedesktop.Application', (err, call) => {
      if(err) console.log(err);
      let files = file;

      //Open method need an array in param
      if(!Array.isArray(file)) {
        files = [file];
      }
      call.Open(files, {"desktop-startup-id" : ["s", "truc"]}, (err) => {
        if(err) console.log(err);
      });
    })
    this.child_service_id = id;
    return id;
  }
  killChild() {
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
  }
}


module.exports = Launcher;
