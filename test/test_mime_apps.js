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
      console.log(apps);
      done();
    }).catch(function(e){
      console.log("error :",e);
      done(e);
    });
  });

});
