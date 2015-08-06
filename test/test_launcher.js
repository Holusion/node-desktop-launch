var Launcher = require("../lib");

describe("Launcher.start",function(){
  it("simple",function(done){
    var launcher = new Launcher();
    launcher.exec = function(command,entry){
      expect(command).to.equal("/path/to/file.txt");
      expect(entry).to.equal("fooview %F");
      done();
    }
    launcher.start("/path/to/file.txt").catch(function(e){
      done(e);
    });
  });
  it("binary",function(done){
    var launcher = new Launcher();
    launcher.exec = function(command,entry){
      expect(command).to.equal("/path/to/file");
      expect(entry).to.be.null;
      done();
    }
    launcher.start("/path/to/file").catch(function(e){
      done(e);
    });
  });
  it("known format without autolaunch",function(done){
    var launcher = new Launcher();
    launcher.exec = function(command,entry){
      expect(command).to.equal("/path/to/file.foo");
      expect(entry).to.equal("fooview %F");
      done();
    }
    launcher.start("/path/to/file.foo").catch(function(e){
      done(e);
    });
  });
})
