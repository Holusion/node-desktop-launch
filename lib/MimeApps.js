var getXdgDirs = require("./utils/getXdgDirs")
  , readdir = require("./utils/readXdgDir")
  ,dedupe = require("./utils/xdgDedupe");
var confDirs = getXdgDirs("configDirs").concat(getXdgDirs("dataDirs","applications"));
//based on http://standards.freedesktop.org/mime-apps-spec/latest/index.html

function MimeApps(){
  this.apps = Promise.all(confDirs.map(function(dir){
      return readdir(dir,"^mimeapps.list$");
    })).then(function (contents) {
      var obj = {};
      contents.forEach(function(file){
        if(!file||!(file = file["mimeapps.list"])||!(file = file["Default Applications"])){
          return;
        }
        Object.keys(file).forEach(function(key){
          if(!obj[key]){ //Take only first 
            obj[key] = file[key];
          }

        });
      });
      return obj;
    });
}


module.exports = MimeApps;
