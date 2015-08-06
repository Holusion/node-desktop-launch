var fs = require("fs")
  path = require("path")
  readfile = require("./readXdgFile");

/**
 * usage :
 * @param  {string} dir dir to explore
 * @param  {string} ext (optionnal) file extension to test for. For example if "desktop" is given, only files ending with ".desktop" are considered valid.
 * @return {[type]}     [description]
 */
module.exports = function (dir,ext) {
  return new Promise(function(resolve,reject){
    fs.readdir(dir, function(err,files){
      if(err){
        return reject(err);
      }
      if(ext){
        test = new RegExp("."+ext+"$","i");
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
  })
};
