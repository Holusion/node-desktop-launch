describe("utils - MimeType",function () {
  var MimeType;

  before(function(){
    MimeType = require("../lib/MimeType");
  })

  it("promise a mime type for file",function(done){
    var type = new MimeType();
    type.lookup("test.mp4").then(function(mimetype){
      expect(mimetype).to.equal("video/mp4");
      done();
    }).catch(function(e){
      console.log("error :",e);
      done(e);
    });
  });
  it("match case sensitive extensions(1)",function(done){
    var type = new MimeType();
    type.lookup("test.c").then(function(mimetype){
      expect(mimetype).to.equal("text/x-csrc");
      done();
    }).catch(function(e){
      console.log("error :",e);
      done(e);
    });
  });
  it("match case sensitive extensions(2)",function(done){
    var type = new MimeType();
    type.lookup("test.C").then(function(mimetype){
      expect(mimetype).to.equal("text/x-c++src");
      done();
    }).catch(function(e){
      console.log("error :",e);
      done(e);
    });
  });
});
