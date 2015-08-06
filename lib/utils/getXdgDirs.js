var path = require("path")
  , xdg = require("xdg-basedir")

/**
 * return $XDG_DATA_DIRS (if set in env or default value from spec)
 * each element being concatenated with "path".
 * Directories existence is not checked as advised by the nodejs documentation. The implementor should be prepared for NOTFOUND errors.
 * @param  {string} path path to add
 * @return {Array}      an array of absolute paths.
 */
module.exports = function(type,localPath){
  var dirs = [];
  if(!xdg[type]){
    throw new Error("no xdg directories for : ",type)
  }
  //console.log("type",xdg[type]);
  if(!localPath){
    return xdg[type];
  }

  xdg[type].forEach(function (dir,index,array) {
    dirs.push( path.join(dir,localPath));
  });
  return dirs;
}
