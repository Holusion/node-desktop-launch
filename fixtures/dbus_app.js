'use strict'
const fs = require("fs");
const dbus = require("dbus-native");
const serviceName = "com.fobar";
const interfaceName = 'org.freedesktop.Application';
const objectPath = `/${serviceName.replace(/\./g,'/')}`;

const sessionBus = dbus.sessionBus();
if(!sessionBus) {
  throw new Error('Could not connect to the DBus session bus');
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

function proceed() {
  var ifaceDesc = {
    name: interfaceName,
    methods: {
      Open: ['asa{sv}', '', ['files', 'options'], []]
    }
  }

  let iface = {
    Open: function(files, options) {
      console.log("child pid : ",process.pid);
      setTimeout(function(){
        console.log("timed out");
        process.exit(0);
      }, 100000);
      sessionBus.removeMatch(`{'path': '${objectPath}','interface': '${interfaceName}'}`);
    }
  }

  sessionBus.exportInterface(iface, objectPath, ifaceDesc);

  console.log("Interface exposed to DBus, ready to receive function calls");
}
