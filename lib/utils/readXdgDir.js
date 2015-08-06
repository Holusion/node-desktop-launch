var fs = require("fs")
  path = require("path")
  readfile = require("./readXdgFile");

/**
 * usage :
 * @param  {string} dir dir to explore
 * @param  {string} patern (optionnal) file name to test for. For example if ".desktop" is given, only files ending with ".desktop" are considered valid.
 * @return {[type]}     [description]
 */
module.exports = function (dir,patern) {
  return new Promise(function(resolve,reject){
    fs.readdir(dir, function(err,files){
      if(err){
        return reject(err);
      }
      if(patern){
        test = new RegExp(patern,"i");
        files = files.filter(function(file){
          return test.test(file);
        });
      }
      Promise.all(files.map(function(file){

        return readfile(path.join(dir,file));
      })).then(function(filesContents){
        var res = {};
        files.forEach(function(file,index){
          res[file] = filesContents[index];
        })
        resolve(res);
      },reject);
    });
  }).catch(function(e){
    //Absorb errors silently
  });
};
