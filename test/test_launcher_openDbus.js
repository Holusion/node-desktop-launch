'use strict';
const {Launcher, ErrNotFound} = require("../lib"),
      {promisify} = require("util");

const dbus = require("dbus-native");
const wait = promisify(setTimeout);



describe("Launcher.openDbus()",function(){
  this.timeout(3000);
  this.slow(2000);

  // Don't forget to end the connection in after() hook
  const sessionBus = dbus.sessionBus();

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
      console.log("Interface exposed to DBus, ready to receive function calls");
    });
    return function(cb=function(){}){
      sessionBus.releaseName(serviceName,cb)
    }
  }

  after(function(){
    sessionBus.connection.end();
  })
  
  describe("connects to dbus",function(){
    const serviceName = "com.foo"
    let launcher;
    let close_bus;
    before(function(done){
      launcher = new Launcher();
      close_bus = dbus_app({serviceName}, done);
    });
  
    after(function() {
      close_bus();
      launcher.close();
    });
    it("Find service if it exists",function(){
      return expect(launcher.openDbus("/path/to/file.bar", serviceName+".desktop")).to.eventually.be.fulfilled;
    })
  })
  describe("resolve names",function(){
    const serviceName = "com.foo"
    let launcher;
    before(function(){
      launcher = new Launcher();
    });
    after(function() {
      launcher.close();
    });
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
    const close_bus = dbus_app({
      serviceName: local_name,
      open_callback: function(){
        sessionBus.releaseName(local_name,function(err){
          expect(err).to.be.null;
        })
      }
    });
    launcher.on("end",function(){
      launcher.close();
      done();
    });
    launcher.openDbus("/path/to/file.bar","com.local.bar.desktop");
  });
});
