var path = require("path")
  , xdg = require("xdg-basedir")

/**
 * return $XDG_DATA_DIRS (if set in env or default value from spec)
 * each element being concatenated with "path".
 * @param  {string} path path to add
 * @return {Array}      an array of absolute paths.
 */
module.exports = function(localPath){
  if(!localPath){
    return xdg.dataDirs;
  }
  var dirs = [];
  xdg.dataDirs.forEach(function (dir,index,array) {
    dirs.push( path.join(dir,localPath));
  });
  return dirs;
}
