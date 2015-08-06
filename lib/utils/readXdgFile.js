var fs = require('fs');
var parser = require("./parseXdgFile");
module.exports = function(file){
  return new Promise(function(resolve, reject) {
    fs.readFile(file,function(err,content){
      if(err){
        console.log("REJECT")
        return reject(err)
      }
      resolve(parser(content));
    })
  });
}
