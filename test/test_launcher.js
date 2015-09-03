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
  describe(".exec",function(){
    beforeEach(function(){
      this.launcher = new Launcher();
    });
    it("parse app launchers",function(){
      this.launcher.exec("1","sleep %f");
      expect(this.launcher.child).to.be.not.null;
      expect(process.kill(this.launcher.child.pid),0).to.be.true;
    });
    it("parse binary file execution",function(){
      this.launcher.exec(__dirname+"/fixtures/stubFile.sh");
      expect(this.launcher.child).to.be.not.null;
      expect(process.kill(this.launcher.child.pid),0).to.be.true;
    });
  });
  describe(".killChild",function(){
    beforeEach(function(){
      this.launcher = new Launcher();
    });
    it("sleep",function(done){
      this.launcher.exec("10","sleep %f");
      expect(this.launcher.child).to.be.not.null;
      this.launcher.on("end",function(file){
        expect(file).to.equal("10");
        done();
      });
      this.launcher.killChild();

    });

  });
})
