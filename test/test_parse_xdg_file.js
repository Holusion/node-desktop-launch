var parseXdgFile = require("../lib/utils/parseXdgFile");
var path = require("path");
var fs = require("fs");
describe("parseXdgFile",function(){
  it("parse desktop entry",function(done){
    fs.readFile(path.join(__dirname,"fixtures/applications/test.desktop"),function(err,data){
      expect(err).to.be.null;
      var conf = parseXdgFile(data);
      expect(typeof conf["Desktop Entry"]).to.equal("object");
      expect(conf["Desktop Entry"]["Exec"]).to.equal("fooview %f");
      done();
    });
  });
  it("parse app association entry",function(done){
    fs.readFile(path.join(__dirname,"fixtures/applications/mimeapps.list"),function(err,data){
      expect(err).to.be.null;
      var conf = parseXdgFile(data);
      expect(typeof conf["Added Associations"]).to.equal("object");
      expect(conf["Added Associations"]["application/bar"]).to.equal("foo");
      done();
    })
  })
})
