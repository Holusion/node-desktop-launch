'use strict';
const utils = require("util")
  , makeCommandLine = require("./utils/makeCommandLine")
  , EventEmitter = require("events").EventEmitter
  , spawn = require("child_process").spawn
  , Finder = require("xdg-apps")
  , dbus = require('dbus-native');


class ErrNotFound extends Error{
  constructor(filename, reason){
    super(`${filename} not found : ${reason || "(details not provided)"}`);
    this.type="ENOTFOUND";
  }
}

class ErrOpen extends Error{
  constructor(filename){
    super(`can't open ${filename}`);
    this.type="EOPEN";
  }
}


class Launcher extends EventEmitter{
  constructor(){
    super();
    //Early instanciation because we can already fetch every desktop file we will need later.
    //Promises allow us to start querying immediately.
    this.finder = new Finder("desktop");
    this._event_pipes = {
      end: this.emit.bind(this,"end"),
      stdout: this.emit.bind(this,"stdout"),
      stderr: this.emit.bind(this,"stderr")
    }
    this._listeners = [];
  }

  pipe(child){
    child.stdout.on("data",this._event_pipes["stdout"]);
    child.stderr.on("data",this._event_pipes["stderr"]);
    child.once("exit",this._event_pipes["end"]);
    this._child = child;
  }
  close(){
    this.killChild();
    //Do not create a dbus connection if it has not been used
    if(this._session_bus){
      this._session_bus.connection.end();
    }
  }
  get child(){
    return this._child || null;
  }
  get sessionBus(){
    if(!this._session_bus){
      this._session_bus =  dbus.sessionBus();
      //Technique to find the moment when the application is closed :
      //If the name argument matches the service name you want to know about.
      //If the old_owner argument is empty, then the service has just claimed the name on the bus.
      //If new_owner is empty then the service has gone away from the bus (for whatever reason).
      this._session_bus.getService("org.freedesktop.DBus").getInterface("/org/freedesktop/DBus", "org.freedesktop.DBus", (err, call) => {
        call.on("NameOwnerChanged", (name, old_owner, new_owner) => {
          if(this.child_service_id && name == this.child_service_id && !new_owner) {
            console.log("NameOwnerChanged", name, "exits");
            this.emit("end");
          }
        })
      });
    }
    return this._session_bus;
  }

/**
 * Open a file or an array of file. Don't forget to catch errors using promise syntax :
 * 		launcher.start("pat/to/file").catch(function(e){//catch errors});
 *
 * @param  {string|Array} file file to open or array of file to open
 * @return {child_process}         reference to the created child process
 */
  async start(file,opts) {
    const entry = await this.finder.findEntry(file);
    const res = {
      had_child: ((this.child)?true: false),
      had_dbus: ((this.child_service_id)?true: false),
      is_open: (entry?true: false),
      is_dbus: ((entry && entry['DBusActivatable'] == 'true')? true: false),
      entry
    };
    if (res.had_dbus){
      //FIXME handle early kill
      //We unref the service id though it has not yet been stopped which might not be very wise
      this.child_service_id = null;
    }

    if ( res.is_dbus ) {
      await this.openDbus(file, entry['ID']);
    } else if (res.is_open ) {
      this.exec(file, entry['Exec'], opts)
    } else { //default to directly exec file
      this.exec(file, entry, opts);
    }
    return res;
  }

  exec(file,line,opts) {
    this.killChild();
    var obj = makeCommandLine(file,line);
    opts = opts||{};

    let child = this._spawn(obj.exec,obj.params,opts);
    this.pipe(child);
    return child;
  }
  _spawn(a,b,c){
    return spawn.apply(this,[a,b,c]);
  }

  getInterface(id) {
    let uri = "/" + id.replace(/\./g, '/'); //Transform desktop id to service name (service.name)
    var service = this.sessionBus.getService(id);
    console.log('Opening file', id, uri);

    return new Promise((resolve, reject) => {
      service.getInterface(uri, "org.freedesktop.Application", (err, call) => {
        if(err) {
          reject(new ErrNotFound(uri, err));
        } else {
          resolve(call);
        }
      })
    })
  }

  //FIXME should "end" when it fails?
  async openDbus(file, id){
    if(!id || typeof id !== "string" || !id.endsWith(".desktop")) {
      throw new TypeError(`id parameter should be a string ending with .desktop`);
    }
    id = id.replace(".desktop", "")
    //We replace all points in id by / to get the path of the interface
    //We call org.freedesktop.Application => See spec :https://standards.freedesktop.org/desktop-entry-spec/latest/ar01s07.html
    const call = await this.getInterface(id);
    let files = file;
    //Open method need an array in param
    if(!Array.isArray(file)) {
      files = [file];
    }
    await call.Open(files, {"desktop-startup-id" : ["s", "default_main_window"]}, (err) => {
      if(err) throw new Error(`Error while calling Open: ${err}`);
    });
    this.child_service_id = id;
    return id;
  }

  //This function is slightly unsafe because we kill the child by PID without checking if it's still alive.
  killChild() {
    if(this.child !== null && typeof this.child.pid == "number"){
      const old_child = this.child; //Keep reference to this.child 
      try{
        this.child.removeListener('exit', this._event_pipes["end"]); //prevent end being fired in the next tick after killChild()
        // stdout and stderr are automatically closed once the child is dead.
        process.kill(this.child.pid);
      }catch(e){
        if(e.code !== "ESRCH"){ //child_process might already have exitted. In which case it's not necessary to throw an error...
          this.emit("error",e);
        }
      }finally{
        this._child = null;
      }
    }
  }
}


module.exports = {Launcher, ErrNotFound, ErrOpen};
