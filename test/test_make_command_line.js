describe("makeCommandLine",function(){
  var make = require("../lib/utils/makeCommandLine");
  var lines = ["foo %F","foo %U","foo %k %n %m %u"];
  var file = "foofile";
  var result = {exec:"foo",params: ["foofile"]}
  lines.forEach(function(line,index){
    it("parse :"+line,function(){
      expect(make(file,line)).to.deep.equal(result);
    });
  });
});
