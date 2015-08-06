var fs = require("fs");
var readXdgDir = require("../lib/utils/readXdgDir");
describe("utils - readXdgDir()",function(){
  it("return object with file contents as keys",function(done){
    var target = __dirname+"/fixtures/applications";
    fs.readdir(target,function(err,ref){
      expect(err).to.be.null;
      readXdgDir(target).then(function(ret){
        expect(typeof ret).to.equal("object");
        expect(Object.keys(ret).length).to.equal(ref.length);
        done();
      }).catch(done)
    });
  });
  it("filter out specific files",function(done){
    var target = __dirname+"/fixtures/applications";
    readXdgDir(target,"^mimeapps.list$").then(function(ret){
      expect(typeof ret).to.equal("object");
      expect(Object.keys(ret).length).to.equal(1);
      done();
    }).catch(done)
  });
})
