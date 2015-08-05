var fs = require("fs")
  , path = require("path")
  , parser = require("node-x11-desktop-entry");
/**
 * http://standards.freedesktop.org/desktop-entry-spec/latest/
 */
var dataDirs = require("./utils/getDataDirs")("applications");



function EntryList(){
  this.entries = Promise.all(dataDirs.map(function(dir){
      return readdir(dir);
    })).then(function(entries){
      return entries.filter(filter).reduce(dedupe,{});
    }); //TODO deduplicate

}
EntryList.prototype.find = function(mime,callback){
  this.entries.then(function(entries){

  });
}


var dedupe = function(obj,add){
  Object.keys(add).forEach(function(key){
    if(!obj[key]){
      obj[key] = add[key]; //TODO : dedupe also desktop ID
    }
  });
  return obj;
}

/**
 * filter out invalid items
 * @param  {[type]} item object describing the entry
 * @return {[type]}      [description]
 */
var filter = function(item){
  if(item){
    return item;
  }else{
    return false;
  }
}

var readfile = function(file){
  return new Promise(function(resolve, reject) {
    parser.load({
      entry:file,
      onSuccess:function(content){
        //console.log("got content",content);
        resolve(content);
      },
      onError:reject
    });
  });
}

var readdir = function (dir) {
  return new Promise(function(resolve,reject){
    fs.readdir(dir, function(err,files){
      if(err){
        return reject(err);
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

  });
};

module.exports = EntryList;
