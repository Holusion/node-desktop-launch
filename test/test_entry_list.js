var path = require("path");
describe("EntryList",function () {
  var EntryList;

  before(function(){
    EntryList = require("../lib/EntryList");
  })

  it("parses desktop entries",function(done){
    var list = new EntryList();
    list.entries.then(function(entries){
      expect(typeof entries).to.equal("object");
      expect(typeof entries['test.desktop']).to.equal("object");
      expect(typeof entries['test.desktop']['Desktop Entry']).to.equal("object");
      expect(       entries['test.desktop']['Desktop Entry']["Exec"]).to.equal("fooview %F");
      done();
    }).catch(function(e){
      console.log("error :",e);
      done(e);
    });
  });
  describe("find",function(){
    it("mime type",function(done){
      var list = new EntryList();
      list.find("image/x-foo").then(function(found){
        expect(typeof found["test.desktop"]).to.equal("object");
        done();
      }).catch(function(e){
        done(e);
      })
    });
  })

});
