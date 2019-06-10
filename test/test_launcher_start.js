const {Launcher} = require("../lib");

describe("Launcher.start()",function(){
  const launcher = new Launcher();
  before(function(){
    launcher.exec = function(){};
  });
  it("open with desktop handler",function(){
    return launcher.start("/path/to/file.txt")
    .then(res=>{
      expect(res.had_child).to.be.false;
      expect(res.had_dbus).to.be.false;
      expect(res.is_open).to.be.true;
      expect(res.entry).to.have.property("Exec", "foo %f");
    })
  });
  it("open as binary",function(){
    return launcher.start("/path/to/file")
    .then(res=>{
      expect(res.is_open).to.be.false;
      expect(res.entry).to.be.null;
    })
  });
  it("open URI schemes",function(){
    return launcher.start("bar:///path/to/file")
    .then(res=>{
      expect(res.is_open).to.be.true;
      expect(res.entry).to.have.property("Exec", "bar %U");
    })
  });
})
