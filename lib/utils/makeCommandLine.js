
module.exports = function(file,line){
  if(!line){
    return {exec:file,params:[]}
  }
  var argv = line.split(/\s/);
  var exec = argv.shift();
  var params = [];
  argv.forEach(function(arg){
    if(/(^%[fFUu]$)/.test(arg)){
      params.push(file);
    }else if(/(^%[ick]$)/.test(arg)){
      //may be of future use
    }else if(!/(^%[a-zA-Z]$)/.test(arg)){
      params.push(arg);
    }
  });
  return {exec:exec,params:params};
}
