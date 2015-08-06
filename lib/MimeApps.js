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
          if(!obj[key]){
            obj[key] = [];
          }
          obj[key].push( file[key]);
        });
      });
      return obj;
    });
}

/**
 * return default apps coresponding to mime type. If no app is available, return the mime type to allow chainable actions.
 * @param  {string} mime mime type
 * @return {Promise}    a Promise that resoles on an app name.
 */
MimeApps.prototype.find = function (mime) {
  return this.apps.then(function(apps){
    if(apps[mime]){
      return apps[mime];
    }else{
      return mime;
    }

  });
};

module.exports = MimeApps;
