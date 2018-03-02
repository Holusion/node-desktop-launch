'use strict';
var Launcher = require("../lib");

const dbus = require("dbus-native");
const serviceName = "com.foo";
const interfaceName = 'org.freedesktop.Application';
const objectPath = `/${serviceName.replace(/\./g,'/')}`;


describe("Launcher.openDbus()",function(){
  this.timeout(4000);
  before(function(done){
    const sessionBus = dbus.sessionBus();
    if(!sessionBus) {
      throw new Error('Could not connect to the DBus session bus');
    }
    function proceed() {
      var ifaceDesc = {
        name: interfaceName,
        methods: {
          Open: ['asa{sv}', '', ['files', 'options'], []]
        }
      }

      let iface = {
        Open: function(files, options) {
          setTimeout(function(){
            console.log("ending connection")
            sessionBus.releaseName(serviceName,function(err){console.log("Released name",err)})
            sessionBus.connection.end();
          }, 10);
          //sessionBus.removeMatch(`{'path': '${objectPath}','interface': '${interfaceName}'}`);
        }
      }
      sessionBus.exportInterface(iface, objectPath, ifaceDesc);
      console.log("Interface exposed to DBus, ready to receive function calls");
      done();
    }
    sessionBus.requestName(serviceName, 0x4, (err, retCode) => {
      if(err) {
        throw new Error(`Could not request service name ${serviceName}, the error was: ${err}.`);
      }
      if(retCode === 1) {
        console.log(`Successfully requested service name "${serviceName}"!`);
        proceed();
      } else {
        throw new Error(`Failed to request service name "${serviceName}". Check what return code "${retCode}" means`);
      }
    });
  })
  it("Return a comprehensive error for unknown services", async function(){
    let launcher = new Launcher();
    return await launcher.openDbus("/path/to/file.truc", "com.truc.desktop").should.be.rejectedWith("Failed to request interface 'org.freedesktop.Application' at '/com/truc' : The name com.truc was not provided by any .service files");
  })
  it("wait for end", function(done) {
    let launcher = new Launcher();
    console.log("pid : ",process.pid);
    launcher.on("end",()=>{
      done();
    })
    launcher.openDbus("/path/to/file.bar","com.foo.desktop");
  });
});
