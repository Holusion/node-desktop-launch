var Launcher = require("../lib");
describe("Launcher",function(){
  describe(".start()",function(){
    beforeEach(function(){
      this.launcher = new Launcher();

    });
    it("simple",function(done){
      this.launcher.exec = function(command,entry){
        expect(command).to.equal("/path/to/file.txt");
        expect(entry).to.equal("fooview %f");
        done();
      }
      this.launcher.start("/path/to/file.txt").catch(function(e){
        done(e);
      });
    });
    it("binary",function(done){
      this.launcher.exec = function(command,entry){
        expect(command).to.equal("/path/to/file");
        expect(entry).to.be.null;
        done();
      }
      this.launcher.start("/path/to/file").catch(function(e){
        done(e);
      });
    });
    it("known format without autolaunch",function(done){
      this.launcher.exec = function(command,entry){
        expect(command).to.equal("/path/to/file.foo");
        expect(entry).to.equal("fooview %f");
        done();
      }
      this.launcher.start("/path/to/file.foo").catch(function(e){
        done(e);
      });
    });
  });
})
