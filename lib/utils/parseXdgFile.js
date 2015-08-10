
module.exports = function(content){
  var line
    , obj = {}
    //, reg = /(?:^\[([\w\s]*)\]\n([^\[]*))/gm; //old regex not matching localized entries
    , reg = /(?:^\[([\w\s]*)\](?:\n(^[^\[]+(?:\[\w*\])?=.*$))*)/gm;
  while (line = reg.exec(content)){
    if(line.length !=3){
      continue; //Bad conf file should not be ignored siletly?
    }
    obj[line[1]]= {};
    line[2].split("\n").forEach(function(keyVal){
      if(keyVal.split("=").length !=2){
        return; //Bad conf file should not be ignored siletly?
      }
      var key = keyVal.split("=")[0].replace(/^\s*|\s*$/,"");
      var value = keyVal.split("=")[1].replace(/^\s*|[\n\s;]*$/g,"");
      obj[line[1]][key] = value;
    });
  };
  return obj;
}
