'use strict';
const Launcher = require("../lib"),
      {promisify} = require("util");

const dbus = require("dbus-native");
const serviceName = "com.foo";
const interfaceName = 'org.freedesktop.Application';
const objectPath = `/${serviceName.replace(/\./g,'/')}`;
const sessionBus = dbus.sessionBus();
const wait = promisify(setTimeout);

function proceed(callback, end) {
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
        end();
      }, 10);
    }
  }
  callback(iface, ifaceDesc);
}

function dbus_app(done) {
  if(!sessionBus) {
    throw new Error('Could not connect to the DBus session bus');
  }
  sessionBus.requestName(serviceName, 0x4, (err, retCode) => {
    if(err) {
      throw new Error(`Could not request service name ${serviceName}, the error was: ${err}.`);
    }
    if(retCode === 1) {
      console.log(`Successfully requested service name "${serviceName}"!`);
      proceed((iface, ifaceDesc) => {
        sessionBus.exportInterface(iface, objectPath, ifaceDesc);
        console.log("Interface exposed to DBus, ready to receive function calls");
        done();
      }, () => {
        sessionBus.releaseName(serviceName,function(err){console.log("Released name",err)})
        // sessionBus.connection.end();
      });
    } else {
      throw new Error(`Failed to request service name "${serviceName}". Check what return code "${retCode}" means`);
    }
  });
}

describe("Launcher.openDbus() never die",function(){
  this.timeout(4000);
  before(function(done){
    dbus_app(done);
  });

  after(function(done) {
    sessionBus.releaseName(serviceName,function(err){console.log("Released name",err)})
    // sessionBus.connection.end();
    done();
  })

  it("Return a comprehensive error for unknown services", async function(){
    let launcher = new Launcher();
    await launcher.openDbus("/path/to/file.truc", "com.truc.desktop").should.be.rejectedWith("Failed to request interface 'org.freedesktop.Application' at '/com/truc' : The name com.truc was not provided by any .service files");
    launcher.emit("end");
  })

});

describe("Laucher.openDbus always die", function() {
  this.timeout(10000);

  before(() => {
    this.launcher = new Launcher();
  })

  afterEach(() => {
    this.launcher.removeAllListeners('end');
  })

  it("wait for end", (done) => {
    dbus_app(() => {});
    this.launcher.on("end",()=>{
      setTimeout(done, 2000)
    })
    this.launcher.openDbus("/path/to/file.bar","com.foo.desktop");
  });

  it("end message emit one time at each app ends", (done) => {
    this.timeout(10000);
    dbus_app(() => {})
    let launcher = new Launcher();
    let call = 0;
    this.launcher.on("end", () => {
      call++;
    });
    setTimeout(() => {
      this.launcher.openDbus("/path/to/file.bar","com.foo.desktop");
      setTimeout(() => {
        dbus_app(() => {})
        setTimeout(() => {
          this.launcher.openDbus("/path/to/file.bar","com.foo.desktop");
          setTimeout(() => {
            expect(call).be.equal(2);
            done();
          }, 2000);
        }, 1000);
      }, 1000);
    }, 1000);
  })
})
