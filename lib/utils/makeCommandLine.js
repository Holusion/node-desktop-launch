var path = require("path");
module.exports = function(files,line){
  if(!line){
    if(typeof files === "string"){
      return {exec:files,params:[]}
    }else{
      throw new Error("invalid execute request : "+files);
    }
  }
  var argv = line.split(/\s/);
  var exec = argv.shift();
  var params = [];
  files = ((Array.isArray(files))?files : [files]);
  argv.forEach(function(arg){
    var match = /^%([fFuUick])$/.exec(arg);
    if(!match)return;
    switch(match[1]){
      case "f":
        params.push(files[0]);
        break;
      case "F":
        Array.prototype.push.apply(params,files);
        break;
      case "u":
        params.push("file://"+files[0]);
        break;
      case "U":
        Array.prototype.push.apply(params,files.map(function(file){
          return "file://"+file;
        }));
        break;
      case "i":
      case "c":
      case "k":
        //unsupported yet but know args
        break;
      default:
        //Ignore deprecated flags as advised in specification
        params.push(arg);
        break;
    }
  });
  return {exec:exec,params:params};
}
