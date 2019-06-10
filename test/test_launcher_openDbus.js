'use strict';
const {Launcher, ErrNotFound} = require("../lib"),
      {promisify} = require("util");

const dbus = require("dbus-native");
const sessionBus = dbus.sessionBus();
const wait = promisify(setTimeout);


function dbus_app({
  serviceName, 
  interfaceName = 'org.freedesktop.Application',
  open_callback=function(){}
}, done=function(){} ) {
  expect(sessionBus).to.be.ok;

  const objectPath = `/${serviceName.replace(/\./g,'/')}`;
  sessionBus.requestName(serviceName, 0x4, (err, retCode) => {
    expect(err).to.be.null;
    expect(retCode).to.equal(1);
    //console.log(`Successfully requested service name "${serviceName}"!`);
    const ifaceDesc = {
      name: interfaceName,
      methods: {
        Open: ['asa{sv}', '', ['files', 'options'], []]
      }
    }
    const iface = {
      Open: open_callback
    }
    sessionBus.exportInterface(iface, objectPath, ifaceDesc);
    done();
    //console.log("Interface exposed to DBus, ready to receive function calls");
  });
}

describe("Launcher.openDbus()",function(){
  this.timeout(10000);
  this.slow(3000);

  describe("resolve names",function(){
    const serviceName = "com.foo"
    const launcher = new Launcher();
    before(function(done){
      dbus_app({serviceName}, done);
    });
  
    after(function(done) {
      sessionBus.releaseName(serviceName,done)
      // sessionBus.connection.end();
    });
    it("Find service if it exists",function(){
      return expect(launcher.openDbus("/path/to/file.bar", serviceName+".desktop")).to.eventually.be.fulfilled;
    })
    it("Throw an error for unknown services", function(){
      //"Error: /com/truc not found : The name com.truc was not provided by any .service files"
      return expect(launcher.openDbus("/path/to/file.bar", "com.truc.desktop")).to.be.rejectedWith(ErrNotFound, /name com.truc was not provided by any \.service files/);
    });
    it("Throw an error when given a null id",function(){
      return expect(launcher.openDbus("/path/to/file.bar", null)).to.be.rejectedWith(TypeError, /should be a string ending with \.desktop/);
    })
    it("Throw an error for unknown id", function(){
      return expect(launcher.openDbus("/path/to/file.bar", serviceName /*no .desktop suffix*/)).to.be.rejectedWith(TypeError, /should be a string ending with \.desktop/);
    })
  })
  
  it("emit end when service drops out", (done) => {
    const local_name = "com.local.bar";
    const launcher = new Launcher();
    dbus_app({
      serviceName: local_name,
      open_callback: function(){
        sessionBus.releaseName(local_name,function(err){
          expect(err).to.be.null;
        })
      }
    });
    launcher.on("end",function(){
      done();
    });
    launcher.openDbus("/path/to/file.bar","com.local.bar.desktop");
  });
});
