var path = require("path");
describe("MimeApps",function () {
  var MimeApps;

  before(function(){
    MimeApps = require("../lib/MimeApps");
  });

  it("parses mime associations",function(done){
    var list = new MimeApps();
    list.apps.then(function(apps){
      expect(typeof apps).to.equal("object");
      expect(apps).to.not.have.property("application/bar");
      expect(apps).to.have.property("application/baz","foobar");
      done();
    }).catch(function(e){
      console.log("error :",e);
      done(e);
    });
  });

});
