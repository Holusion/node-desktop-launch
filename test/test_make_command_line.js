describe("makeCommandLine",function(){
  var make = require("../lib/utils/makeCommandLine");
  var lines = ["foo %F","foo %U","foo %k %n %m %u"];

  var testFn = function(file, lines, results){
    lines.forEach(function(line,index){
      it(line,function(){
        expect(make(file,line)).to.deep.equal(results[index]);
      });
    });
  }
  describe("absolute",function(){
    var results = [{exec:"foo",params: ["/foofile"]},{exec:"foo",params: ["file:///foofile"]},{exec:"foo",params: ["file:///foofile"]}]
    testFn("/foofile",lines,results);
  })
  describe("relative",function(){
    var results = [{exec:"foo",params: ["foofile"]},{exec:"foo",params: ["file://foofile"]},{exec:"foo",params: ["file://foofile"]}]
    testFn("foofile",lines,results);
  })

});
