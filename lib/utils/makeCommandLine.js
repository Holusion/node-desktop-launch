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
    if(/(^%f$)/.test(arg)){
      params.push(files[0]);
    }else if(/(^%F$)/.test(arg)){
      Array.prototype.push.apply(params,files);
    }else if(/(^%u$)/.test(arg)){
      params.push("file://"+files[0]);
    }else if(/(^%U$)/.test(arg)){
      Array.prototype.push.apply(params,files.map(function(file){
        return "file://"+file;
      }));
    }else if(/(^%[ick]$)/.test(arg)){
      //may be of future use
    }else if(!/(^%[a-zA-Z]$)/.test(arg)){
      //Ignore deprecated flags as advised in specification
      params.push(arg);
    }
  });
  return {exec:exec,params:params};
}
