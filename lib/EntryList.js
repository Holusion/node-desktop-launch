var fs = require("fs")
  , path = require("path");

var getXdgDirs = require("./utils/getXdgDirs")
/**
 * http://standards.freedesktop.org/desktop-entry-spec/latest/
 */
var dataDirs = getXdgDirs("dataDirs","applications")
  , readdir = require("./utils/readXdgDir")
  , dedupe = require("./utils/xdgDedupe");

function EntryList(){
  this.entries = Promise.all(dataDirs.map(function(dir){
      return readdir(dir,"desktop");
    }))
    .then(function(entries){
      return entries.reduce(dedupe,{});
    }).then(function (entries) {
      Object.keys(entries).forEach(function(key){
        if(!entries[key]["Desktop Entry"]){
          delete entries[key];
        }
      });
      return entries;
    });
}
EntryList.prototype.find = function(mime){
  var apps = {};
  return this.entries.then(function(entries){
    Object.keys(entries).forEach(function(key){
      if(entries[key]["Desktop Entry"]["MimeType"] && entries[key]["Desktop Entry"]["MimeType"].indexOf(mime) != -1){
        apps[key] = entries[key]["Desktop Entry"];
      }
    });
    return apps;
  });

}




module.exports = EntryList;
