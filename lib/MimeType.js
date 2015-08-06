var fs = require("fs")
  , path = require("path")
  , getXdgDirs = require("./utils/getXdgDirs");

var GLOB_EXTENSIONS = {};
var GLOB_REGEXP = [];

var ESCAPE_REG_EXP =  /([.+?^=!:${}()|\/\\])/g;
var EXTENSION_GLOB_REGEXP = /^\*\.[^\*\?\[]+$/; //CHeck it's not bracketed

function glob2regexp(glob, sensitive){
	return new RegExp('^' + glob.replace(ESCAPE_REG_EXP, '\\$1').replace(/\*/g, '.*') + '$', sensitive ? '' : 'i')
}

var files = getXdgDirs("dataDirs","mime/globs2");
for(var i = 0, file; file = files[i]; i++){
  try {
    var content = fs.readFileSync(file,{encoding:"utf-8"});
  }catch(e){
    continue;
  }
  var lines = content.split('\n');
  for(var j = 0, line; line = lines[j]; j++){
    if(line.charAt(0) === '#')
      continue;
    var glob = line.split(':')
    var cs = glob[3] === 'cs' //Case sensitive
    if(!cs && EXTENSION_GLOB_REGEXP.test(glob[2])){
      var ext = glob[2].substring(2).toLowerCase()
      if(!GLOB_EXTENSIONS[ext])
        GLOB_EXTENSIONS[ext] = glob[1];

    } else{
      GLOB_REGEXP.push([glob2regexp(glob[2], cs), glob[1]])
    }
  }
};

function MimeType(){

}

MimeType.prototype.lookup = function (file) {
  return new Promise(function(resolve, reject) {
    var basename = path.basename(file)
  	var ext = path.extname(basename.toLowerCase()).replace(".","");
  	if(ext && GLOB_EXTENSIONS[ext]){
      return resolve(GLOB_EXTENSIONS[ext]);
    }
  	for(var i = 0, glob; glob = GLOB_REGEXP[i]; i++){
  		if(glob[0].test(basename)){
        return resolve(glob[1]);
      }

  	}
  	resolve("application,/octet-stream");
  });
};

module.exports = MimeType;
