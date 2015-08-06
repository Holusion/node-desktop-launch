var getXdgDirs = require("./utils/getXdgDirs")
  , readdir = require("./utils/readXdgDir")
  ,dedupe = require("./utils/xdgDedupe");
var confDirs = getXdgDirs("configDirs","mimeapps.list").concat(getXdgDirs("dataDirs","applications/mimeapps.list"));
//based on http://standards.freedesktop.org/mime-apps-spec/latest/index.html



function MimeApps(){
  this.apps = Promise.all(confDirs.map(function(dir){
      return readdir(dir);
    })).then(function(entries){
      return entries.reduce(dedupe,{});
    });
}


module.exports = MimeApps;
